# Testing API Operations

Learn comprehensive testing strategies for Panels API operations, from unit tests to integration testing and end-to-end validation.

## Overview

Testing your Panels API integration ensures reliability, catches regressions early, and provides confidence in production deployments. This guide covers testing at multiple levels with practical examples.

## Testing Levels

### 1. Unit Tests
- Test individual API client functions
- Mock external dependencies
- Validate request/response handling
- Test error conditions

### 2. Integration Tests
- Test API client with actual backend
- Validate multi-tenant behavior
- Test authentication flows
- Verify data consistency

### 3. End-to-End Tests
- Test complete user workflows
- Browser automation testing
- Real data validation
- Performance verification

## Unit Testing Setup

### Jest Configuration

\`\`\`typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/test/**/*'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
\`\`\`

### Test Setup

\`\`\`typescript
// src/test/setup.ts
import { panelsAPI } from '@panels/app/api'
import nock from 'nock'

// Mock API configuration
export const mockConfig = {
  baseURL: 'http://localhost:3001',
  authentication: {
    type: 'jwt' as const,
    token: 'mock-jwt-token'
  }
}

// Test data fixtures
export const mockTenantId = 'test-tenant-123'
export const mockUserId = 'test-user-456'

export const mockPanel = {
  id: 'panel-123',
  title: 'Test Panel',
  description: 'A test panel for unit testing',
  tenantId: mockTenantId,
  userId: mockUserId,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

export const mockDataSource = {
  id: 1,
  type: 'database',
  config: {
    connectionString: 'postgresql://test:test@localhost:5432/test',
    table: 'users'
  },
  lastSyncAt: new Date('2024-01-01'),
  tenantId: mockTenantId,
  userId: mockUserId
}

export const mockColumn = {
  id: 1,
  title: 'Full Name',
  sourceField: 'name',
  dataType: 'text',
  displaySettings: {
    width: 200,
    sortable: true
  },
  validation: {
    required: true,
    maxLength: 100
  },
  tenantId: mockTenantId,
  userId: mockUserId
}

beforeEach(() => {
  // Configure API client for testing
  panelsAPI.configure(mockConfig)
  
  // Clear any existing nock interceptors
  nock.cleanAll()
})

afterEach(() => {
  // Verify all HTTP mocks were called
  nock.isDone()
})
\`\`\`

## Unit Testing Patterns

### Testing Panel Operations

\`\`\`typescript
// __tests__/panels.test.ts
import { panelsAPI } from '@panels/app/api'
import nock from 'nock'
import { mockConfig, mockTenantId, mockUserId, mockPanel } from '../test/setup'

describe('Panel API Operations', () => {
  const baseURL = mockConfig.baseURL

  describe('list panels', () => {
    it('should fetch panels list successfully', async () => {
      // Mock the API response
      const mockPanels = [mockPanel]
      nock(baseURL)
        .get('/panels')
        .query({ tenantId: mockTenantId, userId: mockUserId })
        .reply(200, mockPanels)

      // Execute the operation
      const result = await panelsAPI.panels.list(mockTenantId, mockUserId)

      // Verify the result
      expect(result).toEqual(mockPanels)
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: mockPanel.id,
        title: mockPanel.title,
        tenantId: mockTenantId
      })
    })

    it('should handle empty panels list', async () => {
      nock(baseURL)
        .get('/panels')
        .query({ tenantId: mockTenantId, userId: mockUserId })
        .reply(200, [])

      const result = await panelsAPI.panels.list(mockTenantId, mockUserId)

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('should handle API errors gracefully', async () => {
      nock(baseURL)
        .get('/panels')
        .query({ tenantId: mockTenantId, userId: mockUserId })
        .reply(500, { error: 'Internal server error' })

      await expect(
        panelsAPI.panels.list(mockTenantId, mockUserId)
      ).rejects.toThrow('Internal server error')
    })

    it('should handle authentication errors', async () => {
      nock(baseURL)
        .get('/panels')
        .query({ tenantId: mockTenantId, userId: mockUserId })
        .reply(401, { error: 'Unauthorized' })

      await expect(
        panelsAPI.panels.list(mockTenantId, mockUserId)
      ).rejects.toThrow('Unauthorized')
    })
  })

  describe('create panel', () => {
    it('should create panel with valid data', async () => {
      const newPanelData = {
        title: 'New Test Panel',
        description: 'A new panel for testing'
      }

      const createdPanel = {
        ...mockPanel,
        ...newPanelData
      }

      nock(baseURL)
        .post('/panels', {
          ...newPanelData,
          tenantId: mockTenantId,
          userId: mockUserId
        })
        .reply(201, createdPanel)

      const result = await panelsAPI.panels.create(
        newPanelData,
        mockTenantId,
        mockUserId
      )

      expect(result).toMatchObject(newPanelData)
      expect(result.id).toBeDefined()
      expect(result.tenantId).toBe(mockTenantId)
    })

    it('should validate required fields', async () => {
      const invalidData = {
        description: 'Missing title'
      }

      nock(baseURL)
        .post('/panels')
        .reply(400, { 
          error: 'Validation failed',
          details: ['Title is required']
        })

      await expect(
        panelsAPI.panels.create(invalidData as any, mockTenantId, mockUserId)
      ).rejects.toThrow('Validation failed')
    })
  })

  describe('update panel', () => {
    it('should update panel successfully', async () => {
      const updateData = {
        title: 'Updated Panel Title',
        description: 'Updated description'
      }

      const updatedPanel = {
        ...mockPanel,
        ...updateData,
        updatedAt: new Date()
      }

      nock(baseURL)
        .put(`/panels/${mockPanel.id}`, {
          ...updateData,
          tenantId: mockTenantId,
          userId: mockUserId
        })
        .reply(200, updatedPanel)

      const result = await panelsAPI.panels.update(
        mockPanel.id,
        updateData,
        mockTenantId,
        mockUserId
      )

      expect(result.title).toBe(updateData.title)
      expect(result.description).toBe(updateData.description)
      expect(new Date(result.updatedAt).getTime()).toBeGreaterThan(
        new Date(mockPanel.updatedAt).getTime()
      )
    })

    it('should handle non-existent panel', async () => {
      const nonExistentId = 'non-existent-panel'
      
      nock(baseURL)
        .put(`/panels/${nonExistentId}`)
        .reply(404, { error: 'Panel not found' })

      await expect(
        panelsAPI.panels.update(
          nonExistentId,
          { title: 'New Title' },
          mockTenantId,
          mockUserId
        )
      ).rejects.toThrow('Panel not found')
    })
  })
})
\`\`\`

### Testing Data Source Operations

\`\`\`typescript
// __tests__/dataSources.test.ts
import { panelsAPI } from '@panels/app/api'
import nock from 'nock'
import { 
  mockConfig, 
  mockTenantId, 
  mockUserId, 
  mockPanel, 
  mockDataSource 
} from '../test/setup'

describe('Data Source API Operations', () => {
  const baseURL = mockConfig.baseURL
  const panelId = mockPanel.id

  describe('create data source', () => {
    it('should create database data source', async () => {
      const dataSourceConfig = {
        type: 'database',
        config: {
          connectionString: 'postgresql://user:pass@localhost:5432/db',
          table: 'customers'
        }
      }

      const createdDataSource = {
        ...mockDataSource,
        ...dataSourceConfig,
        id: 2
      }

      nock(baseURL)
        .post(`/panels/${panelId}/data-sources`, {
          ...dataSourceConfig,
          tenantId: mockTenantId,
          userId: mockUserId
        })
        .reply(201, createdDataSource)

      const result = await panelsAPI.dataSources.create(
        panelId,
        dataSourceConfig,
        mockTenantId,
        mockUserId
      )

      expect(result.type).toBe('database')
      expect(result.config.table).toBe('customers')
      expect(result.id).toBeDefined()
    })

    it('should create API data source', async () => {
      const apiConfig = {
        type: 'api',
        config: {
          apiEndpoint: 'https://api.example.com/users',
          method: 'GET',
          headers: {
            'Authorization': 'Bearer token123'
          }
        }
      }

      nock(baseURL)
        .post(`/panels/${panelId}/data-sources`)
        .reply(201, { ...mockDataSource, ...apiConfig, id: 3 })

      const result = await panelsAPI.dataSources.create(
        panelId,
        apiConfig,
        mockTenantId,
        mockUserId
      )

      expect(result.type).toBe('api')
      expect(result.config.apiEndpoint).toBe('https://api.example.com/users')
    })

    it('should validate connection string format', async () => {
      const invalidConfig = {
        type: 'database',
        config: {
          connectionString: 'invalid-connection-string',
          table: 'users'
        }
      }

      nock(baseURL)
        .post(`/panels/${panelId}/data-sources`)
        .reply(400, { 
          error: 'Invalid connection string format' 
        })

      await expect(
        panelsAPI.dataSources.create(
          panelId,
          invalidConfig,
          mockTenantId,
          mockUserId
        )
      ).rejects.toThrow('Invalid connection string format')
    })
  })

  describe('sync data source', () => {
    it('should trigger sync successfully', async () => {
      const syncResponse = {
        dataSourceId: mockDataSource.id,
        status: 'success',
        recordsProcessed: 150,
        syncedAt: new Date().toISOString()
      }

      nock(baseURL)
        .post(`/panels/${panelId}/data-sources/${mockDataSource.id}/sync`, {
          tenantId: mockTenantId,
          userId: mockUserId
        })
        .reply(200, syncResponse)

      const result = await panelsAPI.dataSources.sync(
        panelId,
        mockDataSource.id,
        mockTenantId,
        mockUserId
      )

      expect(result.status).toBe('success')
      expect(result.recordsProcessed).toBe(150)
      expect(result.dataSourceId).toBe(mockDataSource.id)
    })

    it('should handle sync failures', async () => {
      nock(baseURL)
        .post(`/panels/${panelId}/data-sources/${mockDataSource.id}/sync`)
        .reply(500, { 
          error: 'Connection failed',
          details: 'Unable to connect to database'
        })

      await expect(
        panelsAPI.dataSources.sync(
          panelId,
          mockDataSource.id,
          mockTenantId,
          mockUserId
        )
      ).rejects.toThrow('Connection failed')
    })
  })
})
\`\`\`

### Testing Column Operations

\`\`\`typescript
// __tests__/columns.test.ts
import { panelsAPI } from '@panels/app/api'
import nock from 'nock'
import { 
  mockConfig, 
  mockTenantId, 
  mockUserId, 
  mockPanel, 
  mockColumn 
} from '../test/setup'

describe('Column API Operations', () => {
  const baseURL = mockConfig.baseURL
  const panelId = mockPanel.id

  describe('create base column', () => {
    it('should create base column successfully', async () => {
      const columnData = {
        title: 'Email Address',
        sourceField: 'email',
        dataType: 'email',
        displaySettings: {
          width: 250,
          sortable: true
        },
        validation: {
          required: true,
          pattern: '^[^@]+@[^@]+\\.[^@]+$'
        }
      }

      const createdColumn = {
        ...mockColumn,
        ...columnData,
        id: 2
      }

      nock(baseURL)
        .post(`/panels/${panelId}/columns/base`, {
          ...columnData,
          tenantId: mockTenantId,
          userId: mockUserId
        })
        .reply(201, createdColumn)

      const result = await panelsAPI.columns.createBase(
        panelId,
        columnData,
        mockTenantId,
        mockUserId
      )

      expect(result.title).toBe('Email Address')
      expect(result.dataType).toBe('email')
      expect(result.sourceField).toBe('email')
    })

    it('should validate column data types', async () => {
      const invalidColumn = {
        title: 'Invalid Column',
        sourceField: 'field',
        dataType: 'invalid-type'
      }

      nock(baseURL)
        .post(`/panels/${panelId}/columns/base`)
        .reply(400, { 
          error: 'Invalid data type',
          allowedTypes: ['text', 'number', 'email', 'url', 'datetime', 'boolean']
        })

      await expect(
        panelsAPI.columns.createBase(
          panelId,
          invalidColumn as any,
          mockTenantId,
          mockUserId
        )
      ).rejects.toThrow('Invalid data type')
    })
  })

  describe('create calculated column', () => {
    it('should create calculated column with formula', async () => {
      const calculatedColumn = {
        title: 'Full Name',
        formula: 'CONCAT([First Name], " ", [Last Name])',
        dataType: 'text',
        dependencies: ['First Name', 'Last Name'],
        displaySettings: {
          width: 300,
          sortable: true
        }
      }

      const createdColumn = {
        ...mockColumn,
        ...calculatedColumn,
        id: 3,
        type: 'calculated'
      }

      nock(baseURL)
        .post(`/panels/${panelId}/columns/calculated`, {
          ...calculatedColumn,
          tenantId: mockTenantId,
          userId: mockUserId
        })
        .reply(201, createdColumn)

      const result = await panelsAPI.columns.createCalculated(
        panelId,
        calculatedColumn,
        mockTenantId,
        mockUserId
      )

      expect(result.type).toBe('calculated')
      expect(result.formula).toBe('CONCAT([First Name], " ", [Last Name])')
      expect(result.dependencies).toEqual(['First Name', 'Last Name'])
    })

    it('should validate formula syntax', async () => {
      const invalidFormula = {
        title: 'Invalid Formula',
        formula: 'INVALID_FUNCTION([Field])',
        dataType: 'text',
        dependencies: ['Field']
      }

      nock(baseURL)
        .post(`/panels/${panelId}/columns/calculated`)
        .reply(400, { 
          error: 'Invalid formula syntax',
          details: 'INVALID_FUNCTION is not a recognized function'
        })

      await expect(
        panelsAPI.columns.createCalculated(
          panelId,
          invalidFormula,
          mockTenantId,
          mockUserId
        )
      ).rejects.toThrow('Invalid formula syntax')
    })

    it('should detect circular dependencies', async () => {
      const circularColumn = {
        title: 'Circular Column',
        formula: '[Circular Column] + 1',
        dataType: 'number',
        dependencies: ['Circular Column']
      }

      nock(baseURL)
        .post(`/panels/${panelId}/columns/calculated`)
        .reply(400, { 
          error: 'Circular dependency detected',
          details: 'Column cannot depend on itself'
        })

      await expect(
        panelsAPI.columns.createCalculated(
          panelId,
          circularColumn,
          mockTenantId,
          mockUserId
        )
      ).rejects.toThrow('Circular dependency detected')
    })
  })
})
\`\`\`

## Integration Testing

### Test Database Setup

\`\`\`typescript
// src/test/integration/setup.ts
import { Pool } from 'pg'
import { panelsAPI } from '@panels/app/api'

// Test database configuration
const testDb = new Pool({
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '5432'),
  database: process.env.TEST_DB_NAME || 'panels_test',
  user: process.env.TEST_DB_USER || 'test',
  password: process.env.TEST_DB_PASSWORD || 'test'
})

export const setupTestDatabase = async () => {
  // Create test schema
  await testDb.query(`
    CREATE SCHEMA IF NOT EXISTS test_data;
    
    DROP TABLE IF EXISTS test_data.users CASCADE;
    CREATE TABLE test_data.users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      score NUMERIC(5,2) DEFAULT 0
    );
    
    INSERT INTO test_data.users (name, email, status, score) VALUES
    ('John Doe', 'john@example.com', 'active', 85.5),
    ('Jane Smith', 'jane@example.com', 'active', 92.0),
    ('Bob Johnson', 'bob@example.com', 'inactive', 67.3),
    ('Alice Brown', 'alice@example.com', 'pending', 78.9),
    ('Charlie Wilson', 'charlie@example.com', 'suspended', 45.2);
  `)
}

export const cleanupTestDatabase = async () => {
  await testDb.query('DROP SCHEMA IF EXISTS test_data CASCADE;')
}

export const getTestConnectionString = () => {
  return `postgresql://${process.env.TEST_DB_USER}:${process.env.TEST_DB_PASSWORD}@${process.env.TEST_DB_HOST}:${process.env.TEST_DB_PORT}/${process.env.TEST_DB_NAME}`
}

// Configure API client for integration tests
panelsAPI.configure({
  baseURL: process.env.TEST_API_URL || 'http://localhost:3001',
  authentication: {
    type: 'jwt',
    token: process.env.TEST_JWT_TOKEN || 'test-token'
  }
})
\`\`\`

### Complete Workflow Integration Tests

\`\`\`typescript
// __tests__/integration/panel-workflow.test.ts
import { panelsAPI, viewsAPI } from '@panels/app/api'
import { 
  setupTestDatabase, 
  cleanupTestDatabase, 
  getTestConnectionString 
} from './setup'

describe('Complete Panel Workflow Integration', () => {
  const testTenantId = 'integration-test-tenant'
  const testUserId = 'integration-test-user'
  
  let panelId: string
  let dataSourceId: number
  let columnIds: number[] = []

  beforeAll(async () => {
    await setupTestDatabase()
  }, 30000)

  afterAll(async () => {
    await cleanupTestDatabase()
  })

  it('should complete full panel creation workflow', async () => {
    // 1. Create Panel
    console.log('Creating panel...')
    const panel = await panelsAPI.panels.create(
      {
        title: 'Integration Test Panel',
        description: 'Complete workflow test panel'
      },
      testTenantId,
      testUserId
    )
    
    panelId = panel.id
    expect(panel.title).toBe('Integration Test Panel')

    // 2. Add Data Source
    console.log('Adding data source...')
    const dataSource = await panelsAPI.dataSources.create(
      panelId,
      {
        type: 'database',
        config: {
          connectionString: getTestConnectionString(),
          schema: 'test_data',
          table: 'users'
        }
      },
      testTenantId,
      testUserId
    )
    
    dataSourceId = dataSource.id
    expect(dataSource.type).toBe('database')

    // 3. Sync Data Source
    console.log('Syncing data source...')
    const syncResult = await panelsAPI.dataSources.sync(
      panelId,
      dataSourceId,
      testTenantId,
      testUserId
    )
    
    expect(syncResult.status).toBe('success')
    expect(syncResult.recordsProcessed).toBeGreaterThan(0)

    // 4. Create Base Columns
    console.log('Creating base columns...')
    const baseColumns = await Promise.all([
      panelsAPI.columns.createBase(panelId, {
        title: 'Name',
        sourceField: 'name',
        dataType: 'text',
        displaySettings: { width: 200, sortable: true },
        validation: { required: true }
      }, testTenantId, testUserId),
      
      panelsAPI.columns.createBase(panelId, {
        title: 'Email',
        sourceField: 'email',
        dataType: 'email',
        displaySettings: { width: 250, sortable: true },
        validation: { required: true }
      }, testTenantId, testUserId),
      
      panelsAPI.columns.createBase(panelId, {
        title: 'Status',
        sourceField: 'status',
        dataType: 'select',
        displaySettings: { width: 120, alignment: 'center' },
        selectOptions: [
          { value: 'active', label: 'Active', color: 'green' },
          { value: 'inactive', label: 'Inactive', color: 'gray' },
          { value: 'pending', label: 'Pending', color: 'yellow' },
          { value: 'suspended', label: 'Suspended', color: 'red' }
        ]
      }, testTenantId, testUserId),
      
      panelsAPI.columns.createBase(panelId, {
        title: 'Score',
        sourceField: 'score',
        dataType: 'number',
        displaySettings: { 
          width: 100, 
          alignment: 'right',
          numberFormat: '0.0'
        }
      }, testTenantId, testUserId)
    ])
    
    columnIds = baseColumns.map(col => col.id)
    expect(baseColumns).toHaveLength(4)

    // 5. Create Calculated Column
    console.log('Creating calculated column...')
    const calculatedColumn = await panelsAPI.columns.createCalculated(
      panelId,
      {
        title: 'Performance Grade',
        formula: 'IF([Score] >= 90, "A", IF([Score] >= 80, "B", IF([Score] >= 70, "C", IF([Score] >= 60, "D", "F"))))',
        dataType: 'text',
        dependencies: ['Score'],
        displaySettings: { width: 100, alignment: 'center' }
      },
      testTenantId,
      testUserId
    )
    
    columnIds.push(calculatedColumn.id)
    expect(calculatedColumn.formula).toContain('IF([Score]')

    // 6. Create Views
    console.log('Creating views...')
    const activeUsersView = await viewsAPI.create(
      panelId,
      {
        title: 'Active Users',
        description: 'View of active users only',
        filters: [
          {
            columnTitle: 'Status',
            operator: 'equals',
            value: 'active'
          }
        ],
        sorting: [
          {
            columnTitle: 'Score',
            direction: 'desc'
          }
        ],
        columnVisibility: {
          'Name': true,
          'Email': true,
          'Status': true,
          'Score': true,
          'Performance Grade': true
        }
      },
      testTenantId,
      testUserId
    )

    const highPerformersView = await viewsAPI.create(
      panelId,
      {
        title: 'High Performers',
        description: 'Users with score >= 80',
        filters: [
          {
            columnTitle: 'Score',
            operator: 'greaterThanOrEqual',
            value: 80
          }
        ],
        sorting: [
          {
            columnTitle: 'Score',
            direction: 'desc'
          }
        ]
      },
      testTenantId,
      testUserId
    )

    expect(activeUsersView.title).toBe('Active Users')
    expect(highPerformersView.title).toBe('High Performers')

    // 7. Publish Views
    console.log('Publishing views...')
    await viewsAPI.publish(
      panelId,
      activeUsersView.id,
      {
        publishedTitle: 'Active Users',
        description: 'View of all active users',
        permissions: ['read'],
        userGroups: ['managers', 'viewers'],
        isDefault: true
      },
      testTenantId,
      testUserId
    )

    await viewsAPI.publish(
      panelId,
      highPerformersView.id,
      {
        publishedTitle: 'Top Performers',
        description: 'High scoring users',
        permissions: ['read'],
        userGroups: ['managers']
      },
      testTenantId,
      testUserId
    )

    // 8. Verify Final State
    console.log('Verifying final state...')
    const finalPanels = await panelsAPI.panels.list(testTenantId, testUserId)
    const createdPanel = finalPanels.find(p => p.id === panelId)
    expect(createdPanel).toBeDefined()

    const dataSources = await panelsAPI.dataSources.list(
      panelId,
      testTenantId,
      testUserId
    )
    expect(dataSources).toHaveLength(1)

    const columns = await panelsAPI.columns.list(
      panelId,
      testTenantId,
      testUserId
    )
    expect(columns).toHaveLength(5)

    const views = await viewsAPI.list(panelId, testTenantId, testUserId)
    expect(views).toHaveLength(2)

    console.log('✅ Complete workflow test passed!')
  }, 60000)

  it('should handle data updates and recalculation', async () => {
    // Update a record in the test database
    // This would trigger recalculation of dependent calculated columns
    
    // Sync data source again
    const syncResult = await panelsAPI.dataSources.sync(
      panelId,
      dataSourceId,
      testTenantId,
      testUserId
    )
    
    expect(syncResult.status).toBe('success')
    
    // Verify calculated columns are updated
    const columns = await panelsAPI.columns.list(
      panelId,
      testTenantId,
      testUserId
    )
    
    const calculatedColumn = columns.find(col => col.title === 'Performance Grade')
    expect(calculatedColumn).toBeDefined()
    expect(calculatedColumn.type).toBe('calculated')
  })
})
\`\`\`

## Performance Testing

### Load Testing Setup

\`\`\`typescript
// __tests__/performance/load.test.ts
import { panelsAPI } from '@panels/app/api'
import { performance } from 'perf_hooks'

describe('Performance Tests', () => {
  const testTenantId = 'perf-test-tenant'
  const testUserId = 'perf-test-user'

  it('should handle concurrent panel operations', async () => {
    const concurrentRequests = 10
    const startTime = performance.now()

    // Create multiple panels concurrently
    const promises = Array.from({ length: concurrentRequests }, (_, i) =>
      panelsAPI.panels.create(
        {
          title: `Performance Test Panel ${i}`,
          description: `Panel ${i} for performance testing`
        },
        testTenantId,
        testUserId
      )
    )

    const results = await Promise.all(promises)
    const endTime = performance.now()
    const duration = endTime - startTime

    expect(results).toHaveLength(concurrentRequests)
    expect(duration).toBeLessThan(5000) // Should complete within 5 seconds
    
    console.log(`Created ${concurrentRequests} panels in ${duration.toFixed(2)}ms`)
    console.log(`Average time per panel: ${(duration / concurrentRequests).toFixed(2)}ms`)
  })

  it('should handle large column lists efficiently', async () => {
    const panel = await panelsAPI.panels.create(
      {
        title: 'Large Column Test Panel',
        description: 'Panel for testing many columns'
      },
      testTenantId,
      testUserId
    )

    const startTime = performance.now()
    
    // Create many columns
    const columnPromises = Array.from({ length: 50 }, (_, i) =>
      panelsAPI.columns.createBase(panel.id, {
        title: `Column ${i}`,
        sourceField: `field_${i}`,
        dataType: 'text',
        displaySettings: { width: 100 }
      }, testTenantId, testUserId)
    )

    await Promise.all(columnPromises)
    
    // List all columns and measure performance
    const listStartTime = performance.now()
    const columns = await panelsAPI.columns.list(panel.id, testTenantId, testUserId)
    const listEndTime = performance.now()

    expect(columns).toHaveLength(50)
    expect(listEndTime - listStartTime).toBeLessThan(1000) // Should list within 1 second
    
    console.log(`Listed ${columns.length} columns in ${(listEndTime - listStartTime).toFixed(2)}ms`)
  })
})
\`\`\`

## Test Utilities and Helpers

### API Test Helpers

\`\`\`typescript
// src/test/helpers/api.ts
import { panelsAPI, viewsAPI } from '@panels/app/api'

export class TestPanelBuilder {
  private panelId?: string
  private tenantId: string
  private userId: string

  constructor(tenantId: string, userId: string) {
    this.tenantId = tenantId
    this.userId = userId
  }

  async createPanel(title: string, description?: string) {
    const panel = await panelsAPI.panels.create(
      { title, description: description || `Test panel: ${title}` },
      this.tenantId,
      this.userId
    )
    this.panelId = panel.id
    return this
  }

  async addDatabaseSource(connectionString: string, table: string) {
    if (!this.panelId) throw new Error('Panel must be created first')
    
    await panelsAPI.dataSources.create(
      this.panelId,
      {
        type: 'database',
        config: { connectionString, table }
      },
      this.tenantId,
      this.userId
    )
    return this
  }

  async addColumn(title: string, sourceField: string, dataType: string = 'text') {
    if (!this.panelId) throw new Error('Panel must be created first')
    
    await panelsAPI.columns.createBase(
      this.panelId,
      {
        title,
        sourceField,
        dataType,
        displaySettings: { width: 200 }
      },
      this.tenantId,
      this.userId
    )
    return this
  }

  async addCalculatedColumn(title: string, formula: string, dependencies: string[]) {
    if (!this.panelId) throw new Error('Panel must be created first')
    
    await panelsAPI.columns.createCalculated(
      this.panelId,
      {
        title,
        formula,
        dataType: 'text',
        dependencies,
        displaySettings: { width: 200 }
      },
      this.tenantId,
      this.userId
    )
    return this
  }

  async createView(title: string, filters: any[] = [], sorting: any[] = []) {
    if (!this.panelId) throw new Error('Panel must be created first')
    
    const view = await viewsAPI.create(
      this.panelId,
      { title, description: `Test view: ${title}`, filters, sorting },
      this.tenantId,
      this.userId
    )
    return view
  }

  getPanelId() {
    return this.panelId
  }
}

// Usage in tests:
export const createTestPanel = (tenantId: string, userId: string) => 
  new TestPanelBuilder(tenantId, userId)
\`\`\`

### Assertion Helpers

\`\`\`typescript
// src/test/helpers/assertions.ts
import { expect } from '@jest/globals'

export const expectValidPanel = (panel: any) => {
  expect(panel).toMatchObject({
    id: expect.any(String),
    title: expect.any(String),
    tenantId: expect.any(String),
    userId: expect.any(String),
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date)
  })
}

export const expectValidDataSource = (dataSource: any) => {
  expect(dataSource).toMatchObject({
    id: expect.any(Number),
    type: expect.stringMatching(/^(database|api|file|webhook)$/),
    config: expect.any(Object),
    tenantId: expect.any(String),
    userId: expect.any(String)
  })
}

export const expectValidColumn = (column: any) => {
  expect(column).toMatchObject({
    id: expect.any(Number),
    title: expect.any(String),
    dataType: expect.stringMatching(/^(text|number|email|url|datetime|boolean|select|json)$/),
    displaySettings: expect.any(Object),
    tenantId: expect.any(String),
    userId: expect.any(String)
  })
}

export const expectValidView = (view: any) => {
  expect(view).toMatchObject({
    id: expect.any(Number),
    title: expect.any(String),
    filters: expect.any(Array),
    sorting: expect.any(Array),
    columnVisibility: expect.any(Object)
  })
}
\`\`\`

## Continuous Integration

### GitHub Actions Configuration

\`\`\`yaml
# .github/workflows/api-tests.yml
name: API Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Run unit tests
      run: pnpm test:unit
      env:
        NODE_ENV: test
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: panels_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Start API server
      run: pnpm start:test &
      env:
        NODE_ENV: test
        DATABASE_URL: postgresql://test:test@localhost:5432/panels_test
    
    - name: Wait for API server
      run: npx wait-on http://localhost:3001/health
    
    - name: Run integration tests
      run: pnpm test:integration
      env:
        NODE_ENV: test
        TEST_API_URL: http://localhost:3001
        TEST_DB_HOST: localhost
        TEST_DB_PORT: 5432
        TEST_DB_NAME: panels_test
        TEST_DB_USER: test
        TEST_DB_PASSWORD: test
\`\`\`

## Summary

Comprehensive API testing ensures:

1. **Unit Tests** validate individual operations and error handling
2. **Integration Tests** verify complete workflows with real data
3. **Performance Tests** ensure acceptable response times under load
4. **Test Utilities** provide reusable patterns and helpers
5. **CI/CD Integration** runs tests automatically on code changes

This testing strategy provides confidence in your Panels API integration and catches issues before they reach production.
