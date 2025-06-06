#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const rootDir = join(__dirname, '../..')
const docsDir = join(rootDir, 'apps/docs')

// Configuration for code validation
const VALIDATION_CONFIG = {
  // File patterns to check
  patterns: ['**/*.md'],

  // Code block languages to validate
  languages: {
    javascript: { extension: '.js', runner: 'node' },
    typescript: { extension: '.ts', runner: 'tsx' },
    bash: { extension: '.sh', runner: 'bash' },
    sql: { extension: '.sql', runner: 'psql' },
    json: {
      extension: '.json',
      runner:
        'node -e "JSON.parse(require(\'fs\').readFileSync(process.argv[1]))"',
    },
  },

  // Directories for temporary test files
  tempDir: join(rootDir, '.temp-docs-validation'),

  // Code blocks to skip (by comment or tag)
  skipPatterns: [
    /\/\/ @skip-validation/,
    /# @skip-validation/,
    /<!-- @skip-validation -->/,
    /@example-only/,
  ],

  // Environment setup for validation
  environment: {
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://medplum:medplum@localhost:5432/medplum_test',
    API_BASE_URL: 'http://localhost:3001',
  },
}

class DocumentationValidator {
  constructor(config = VALIDATION_CONFIG) {
    this.config = config
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: [],
    }
  }

  /**
   * Main validation function
   */
  async validate() {
    console.log('🔍 Starting documentation code validation...\n')

    try {
      // Setup temporary directory
      this.setupTempDirectory()

      // Find all markdown files
      const markdownFiles = this.findMarkdownFiles(docsDir)
      console.log(`📄 Found ${markdownFiles.length} documentation files\n`)

      // Process each file
      for (const file of markdownFiles) {
        await this.validateFile(file)
      }

      // Cleanup
      this.cleanup()

      // Report results
      this.reportResults()
    } catch (error) {
      console.error('💥 Validation failed:', error.message)
      process.exit(1)
    }
  }

  /**
   * Find all markdown files recursively
   */
  findMarkdownFiles(dir) {
    const files = []

    function scan(currentDir) {
      const items = readdirSync(currentDir)

      for (const item of items) {
        const fullPath = join(currentDir, item)
        const stat = statSync(fullPath)

        if (stat.isDirectory() && !item.startsWith('.')) {
          scan(fullPath)
        } else if (stat.isFile() && extname(item) === '.md') {
          files.push(fullPath)
        }
      }
    }

    scan(dir)
    return files
  }

  /**
   * Validate a single documentation file
   */
  async validateFile(filePath) {
    const relativePath = relative(docsDir, filePath)
    console.log(`📝 Validating: ${relativePath}`)

    const content = readFileSync(filePath, 'utf8')
    const codeBlocks = this.extractCodeBlocks(content)

    if (codeBlocks.length === 0) {
      console.log('   ⏭️  No code blocks found\n')
      return
    }

    console.log(`   🔍 Found ${codeBlocks.length} code blocks`)

    for (const [index, block] of codeBlocks.entries()) {
      await this.validateCodeBlock(block, relativePath, index + 1)
    }

    console.log()
  }

  /**
   * Extract code blocks from markdown content
   */
  extractCodeBlocks(content) {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const blocks = []
    let match

    // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const [, language = 'text', code] = match

      // Skip if no language or unsupported language
      if (!language || !this.config.languages[language]) {
        continue
      }

      // Skip if marked for skipping
      if (this.shouldSkipBlock(code)) {
        continue
      }

      blocks.push({
        language,
        code: code.trim(),
        raw: match[0],
      })
    }

    return blocks
  }

  /**
   * Check if a code block should be skipped
   */
  shouldSkipBlock(code) {
    return this.config.skipPatterns.some((pattern) => pattern.test(code))
  }

  /**
   * Validate a single code block
   */
  async validateCodeBlock(block, filePath, blockNumber) {
    const { language, code } = block
    const languageConfig = this.config.languages[language]

    this.results.total++

    try {
      // Skip validation for certain patterns
      if (this.shouldSkipValidation(code, language)) {
        console.log(`     ${blockNumber}. ${language} - ⏭️  SKIPPED`)
        this.results.skipped++
        return
      }

      // Create temporary file
      const tempFile = this.createTempFile(
        code,
        languageConfig.extension,
        blockNumber,
      )

      // Run validation
      const success = await this.runValidation(
        tempFile,
        languageConfig.runner,
        language,
      )

      if (success) {
        console.log(`     ${blockNumber}. ${language} - ✅ PASSED`)
        this.results.passed++
      } else {
        console.log(`     ${blockNumber}. ${language} - ❌ FAILED`)
        this.results.failed++
        this.results.errors.push({
          file: filePath,
          block: blockNumber,
          language,
          code: `${code.substring(0, 100)}...`,
        })
      }
    } catch (error) {
      console.log(
        `     ${blockNumber}. ${language} - ❌ ERROR: ${error.message}`,
      )
      this.results.failed++
      this.results.errors.push({
        file: filePath,
        block: blockNumber,
        language,
        error: error.message,
      })
    }
  }

  /**
   * Determine if validation should be skipped based on content
   */
  shouldSkipValidation(code, language) {
    // Skip examples with placeholders
    if (
      code.includes('<your-') ||
      code.includes('example.com') ||
      code.includes('TODO')
    ) {
      return true
    }

    // Skip incomplete code snippets
    if (
      language === 'typescript' &&
      !code.includes('import') &&
      !code.includes('export')
    ) {
      return true
    }

    // Skip configuration examples
    if (language === 'bash' && code.includes('# Example configuration')) {
      return true
    }

    return false
  }

  /**
   * Create a temporary file for validation
   */
  createTempFile(code, extension, blockNumber) {
    const hash = createHash('md5').update(code).digest('hex')
    const filename = `block-${blockNumber}-${hash}${extension}`
    const tempFile = join(this.config.tempDir, filename)

    // Add necessary imports/setup for different languages
    const processedCode = this.preprocessCode(code, extension)

    require('node:fs').writeFileSync(tempFile, processedCode)
    return tempFile
  }

  /**
   * Preprocess code to add necessary imports and setup
   */
  preprocessCode(code, extension) {
    switch (extension) {
      case '.js':
      case '.ts':
        // Add common imports if not present
        if (!code.includes('import') && !code.includes('require')) {
          const commonImports = `
// Auto-added imports for validation
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

${code}
          `.trim()
          return commonImports
        }
        break

      case '.sql':
        // Add connection setup for SQL
        return `-- Auto-added for validation\n-- \\c medplum_test\n\n${code}`

      case '.sh':
        // Add bash safety
        return `#!/bin/bash\nset -e\n\n${code}`
    }

    return code
  }

  /**
   * Run validation on a temporary file
   */
  async runValidation(tempFile, runner, language) {
    return new Promise((resolve) => {
      const env = { ...process.env, ...this.config.environment }

      // Special handling for different languages
      let command
      let args

      if (language === 'sql') {
        command = 'psql'
        args = [
          '-f',
          tempFile,
          process.env.DATABASE_URL || this.config.environment.DATABASE_URL,
        ]
      } else if (language === 'json') {
        command = 'node'
        args = [
          '-e',
          `JSON.parse(require('fs').readFileSync('${tempFile}', 'utf8'))`,
        ]
      } else {
        const parts = runner.split(' ')
        command = parts[0]
        args = [...parts.slice(1), tempFile]
      }

      const child = spawn(command, args, {
        stdio: 'pipe',
        env,
        timeout: 10000, // 10 second timeout
      })

      let output = ''
      let errorOutput = ''

      child.stdout?.on('data', (data) => {
        output += data.toString()
      })

      child.stderr?.on('data', (data) => {
        errorOutput += data.toString()
      })

      child.on('close', (code) => {
        // Success if exit code is 0
        resolve(code === 0)
      })

      child.on('error', () => {
        resolve(false)
      })
    })
  }

  /**
   * Setup temporary directory for validation files
   */
  setupTempDirectory() {
    const fs = require('node:fs')
    if (fs.existsSync(this.config.tempDir)) {
      fs.rmSync(this.config.tempDir, { recursive: true })
    }
    fs.mkdirSync(this.config.tempDir, { recursive: true })
  }

  /**
   * Cleanup temporary files
   */
  cleanup() {
    const fs = require('node:fs')
    if (fs.existsSync(this.config.tempDir)) {
      fs.rmSync(this.config.tempDir, { recursive: true })
    }
  }

  /**
   * Report validation results
   */
  reportResults() {
    console.log('📊 Validation Results:')
    console.log('========================')
    console.log(`Total code blocks: ${this.results.total}`)
    console.log(`✅ Passed: ${this.results.passed}`)
    console.log(`❌ Failed: ${this.results.failed}`)
    console.log(`⏭️  Skipped: ${this.results.skipped}`)

    const successRate =
      this.results.total > 0
        ? ((this.results.passed / this.results.total) * 100).toFixed(1)
        : 0

    console.log(`📈 Success Rate: ${successRate}%`)

    if (this.results.errors.length > 0) {
      console.log('\n❌ Failed Code Blocks:')
      console.log('======================')

      for (const error of this.results.errors) {
        console.log(
          `📄 ${error.file} - Block ${error.block} (${error.language})`,
        )
        if (error.error) {
          console.log(`   Error: ${error.error}`)
        }
        if (error.code) {
          console.log(`   Code: ${error.code}`)
        }
        console.log()
      }
    }

    // Exit with error code if validations failed
    if (this.results.failed > 0) {
      console.log('💥 Some validations failed. Please fix the issues above.')
      process.exit(1)
    } else {
      console.log('\n🎉 All validations passed!')
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📚 Documentation Code Validator

Usage: node dev/scripts/validate-docs.js [options]

Options:
  --help, -h     Show this help message
  --verbose, -v  Show verbose output
  --fix          Attempt to fix simple issues
  --language     Validate only specific language (js, ts, bash, sql)

Examples:
  # Validate all documentation
  pnpm docs:validate
  
  # Validate only TypeScript examples
  node dev/scripts/validate-docs.js --language typescript
  
  # Verbose output
  node dev/scripts/validate-docs.js --verbose
    `)
    return
  }

  const validator = new DocumentationValidator()
  await validator.validate()
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('💥 Validation script failed:', error.message)
    process.exit(1)
  })
}
