import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Awell Panels Documentation',
  description: 'Comprehensive documentation for the Panels Management System',
  ignoreDeadLinks: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Intro', link: '/intro' },
      { text: 'Getting Started', link: '/getting-started/' },
      { text: 'How-to Guides', link: '/guides/' },
      { text: 'API Reference', link: '/reference/' },
      { text: 'Understanding', link: '/explanation/' },
      { text: 'Projects', link: '/projects/' },
      { text: 'Examples', link: '/examples/' },
    ],

    sidebar: {
      '/': [{ text: 'Intro', link: '/intro' }],
      '/getting-started/': [
        {
          text: 'Tutorial',
          items: [
            { text: 'Introduction', link: '/getting-started/' },
            { text: 'Installation', link: '/getting-started/installation' },
            { text: 'Your First Panel', link: '/getting-started/first-panel' },
            {
              text: 'Adding Data Sources',
              link: '/getting-started/adding-data-sources',
            },
            {
              text: 'Creating Columns',
              link: '/getting-started/creating-columns',
            },
            { text: 'Building Views', link: '/getting-started/building-views' },
            { text: 'Next Steps', link: '/getting-started/next-steps' },
          ],
        },
      ],

      '/guides/': [
        {
          text: 'API Client',
          items: [
            {
              text: 'Error Handling',
              link: '/guides/api-client/handling-errors',
            },
            {
              text: 'Authentication',
              link: '/guides/api-client/authentication',
            },
            {
              text: 'Caching Responses',
              link: '/guides/api-client/caching-responses',
            },
            { text: 'Testing APIs', link: '/guides/api-client/testing-apis' },
          ],
        },
        {
          text: 'Panels',
          items: [
            {
              text: 'Complex Formulas',
              link: '/guides/panels/complex-formulas',
            },
            {
              text: 'Multi-Source Panels',
              link: '/guides/panels/multi-source-panels',
            },
            {
              text: 'Performance Tips',
              link: '/guides/panels/performance-tips',
            },
          ],
        },
        {
          text: 'Views',
          items: [
            {
              text: 'Advanced Filtering',
              link: '/guides/views/advanced-filtering',
            },
            { text: 'Custom Layouts', link: '/guides/views/custom-layouts' },
            {
              text: 'Sharing Workflows',
              link: '/guides/views/sharing-workflows',
            },
          ],
        },
        {
          text: 'Deployment',
          items: [
            {
              text: 'Production Setup',
              link: '/guides/deployment/production-setup',
            },
            {
              text: 'Environment Config',
              link: '/guides/deployment/environment-config',
            },
            { text: 'Monitoring', link: '/guides/deployment/monitoring' },
          ],
        },
      ],

      '/reference/': [
        {
          text: 'API Client',
          items: [
            { text: 'Panels API', link: '/reference/api-client/panels-api' },
            { text: 'Views API', link: '/reference/api-client/views-api' },
            { text: 'TypeScript Types', link: '/reference/api-client/types' },
            {
              text: 'Endpoints Mapping',
              link: '/reference/api-client/endpoints',
            },
          ],
        },
        {
          text: 'Backend API',
          items: [
            { text: 'Panel Endpoints', link: '/reference/backend-api/panels/' },
            { text: 'View Endpoints', link: '/reference/backend-api/views/' },
            {
              text: 'Column Endpoints',
              link: '/reference/backend-api/columns/',
            },
            {
              text: 'Data Source Endpoints',
              link: '/reference/backend-api/datasources/',
            },
            {
              text: 'Request/Response Schemas',
              link: '/reference/backend-api/schemas',
            },
          ],
        },
        {
          text: 'Configuration',
          items: [
            {
              text: 'Environment Variables',
              link: '/reference/configuration/environment-vars',
            },
            {
              text: 'Database Schema',
              link: '/reference/configuration/database-schema',
            },
            { text: 'Data Types', link: '/reference/configuration/data-types' },
          ],
        },
        {
          text: 'Testing',
          items: [
            {
              text: 'Bruno Collection',
              link: '/reference/bruno-collection/api-testing',
            },
          ],
        },
      ],

      '/explanation/': [
        {
          text: 'Architecture',
          items: [
            {
              text: 'System Overview',
              link: '/explanation/architecture/system-overview',
            },
            {
              text: 'Data Model',
              link: '/explanation/architecture/data-model',
            },
            {
              text: 'Multi-tenancy',
              link: '/explanation/architecture/multi-tenancy',
            },
            {
              text: 'Security Model',
              link: '/explanation/architecture/security-model',
            },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            {
              text: 'Panels vs Views',
              link: '/explanation/concepts/panels-vs-views',
            },
            {
              text: 'Calculated Columns',
              link: '/explanation/concepts/calculated-columns',
            },
            {
              text: 'Change Tracking',
              link: '/explanation/concepts/change-tracking',
            },
            {
              text: 'Publishing Model',
              link: '/explanation/concepts/publishing-model',
            },
          ],
        },
        {
          text: 'Design Decisions',
          items: [
            {
              text: 'Technology Stack',
              link: '/explanation/decisions/tech-stack',
            },
            { text: 'API Design', link: '/explanation/decisions/api-design' },
            {
              text: 'Database Design',
              link: '/explanation/decisions/database-design',
            },
          ],
        },
      ],

      '/projects/': [
        {
          text: 'Monorepo Overview',
          items: [{ text: 'Project Structure', link: '/projects/' }],
        },
        {
          text: 'Frontend (App)',
          items: [
            { text: 'Overview', link: '/projects/app/' },
            { text: 'Components', link: '/projects/app/components' },
            {
              text: 'State Management',
              link: '/projects/app/state-management',
            },
          ],
        },
        {
          text: 'Backend (Services)',
          items: [
            { text: 'Overview', link: '/projects/services/' },
            { text: 'Modules', link: '/projects/services/modules' },
            { text: 'Testing', link: '/projects/services/testing' },
          ],
        },
        {
          text: 'Shared Types',
          items: [
            { text: 'Overview', link: '/projects/types/' },
            { text: 'Schema Design', link: '/projects/types/schema-design' },
          ],
        },
        {
          text: 'Documentation',
          items: [
            { text: 'Overview', link: '/projects/docs/' },
            { text: 'Contributing', link: '/projects/docs/contributing' },
          ],
        },
      ],

      '/examples/': [
        {
          text: 'Basic Usage',
          items: [
            {
              text: 'Create Panel',
              link: '/examples/basic-usage/create-panel',
            },
            { text: 'Add Columns', link: '/examples/basic-usage/add-columns' },
            { text: 'Build View', link: '/examples/basic-usage/build-view' },
          ],
        },
        {
          text: 'Advanced Patterns',
          items: [
            {
              text: 'Formula Examples',
              link: '/examples/advanced-patterns/formula-examples',
            },
            {
              text: 'Filter Combinations',
              link: '/examples/advanced-patterns/filter-combinations',
            },
            {
              text: 'API Integration',
              link: '/examples/advanced-patterns/api-integration',
            },
          ],
        },
        {
          text: 'Code Samples',
          items: [
            {
              text: 'React Components',
              link: '/examples/code-samples/react-components',
            },
            {
              text: 'Error Handling',
              link: '/examples/code-samples/error-handling',
            },
            { text: 'Testing', link: '/examples/code-samples/testing' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
    ],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the Apache License 2.0.',
      copyright: 'Copyright © 2024 Awell Health',
    },
  },
})
