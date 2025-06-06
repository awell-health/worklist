# How to integrate the API

> ⚠️ **Future Feature**: This guide describes advanced API integration features that are planned for future releases. For current API usage, see [How to use the REST API](./use-rest-api.md).

This guide shows you how to integrate with the Panels API to build custom applications and integrations.

## Prerequisites

- API access credentials
- Node.js or your preferred programming language
- Understanding of REST APIs and HTTP methods
- Access to the API documentation

## Step 1: Authentication Setup

### Get API Credentials
1. **Contact your administrator** for API access
2. **Obtain your API key** and base URL
3. **Store credentials securely** (never in code)

### Environment Configuration
\`\`\`bash
# .env file
PANELS_API_URL=https://api.panels.yourorg.com
PANELS_API_KEY=your-api-key-here
PANELS_CLIENT_ID=your-client-id
PANELS_CLIENT_SECRET=your-client-secret
\`\`\`

### Authentication Methods

#### Option 1: API Key Authentication
\`\`\`typescript
// Simple API key authentication
const headers = {
  'Authorization': `Bearer ${process.env.PANELS_API_KEY}`,
  'Content-Type': 'application/json'
}
\`\`\`

#### Option 2: OAuth 2.0 Flow
\`\`\`typescript
// OAuth 2.0 authentication
import { AuthenticationProvider } from '@panels/api-client'

const auth = new AuthenticationProvider({
  clientId: process.env.PANELS_CLIENT_ID,
  clientSecret: process.env.PANELS_CLIENT_SECRET,
  baseUrl: process.env.PANELS_API_URL
})

const token = await auth.getAccessToken()
\`\`\`

## Step 2: Install API Client

### Using npm
\`\`\`bash
npm install @panels/api-client
\`\`\`

### Using yarn
\`\`\`bash
yarn add @panels/api-client
\`\`\`

### Basic Client Setup
\`\`\`typescript
import { PanelsClient } from '@panels/api-client'

const client = new PanelsClient({
  baseUrl: process.env.PANELS_API_URL,
  apiKey: process.env.PANELS_API_KEY,
  timeout: 30000
})
\`\`\`

## Step 3: Basic API Operations

### Fetch Panels List
\`\`\`typescript
// Get all panels for current user
async function getAllPanels() {
  try {
    const panels = await client.panels.list({
      limit: 50,
      offset: 0,
      includeArchived: false
    })
    
    console.log(`Found ${panels.total} panels`)
    return panels.data
  } catch (error) {
    console.error('Failed to fetch panels:', error.message)
    throw error
  }
}
\`\`\`

### Get Panel Data
\`\`\`typescript
// Fetch data from a specific panel
async function getPanelData(panelId: string) {
  try {
    const panelData = await client.panels.getData(panelId, {
      filters: {
        dateRange: {
          start: '2024-01-01',
          end: '2024-12-31'
        }
      },
      sort: [
        { field: 'patient_name', direction: 'asc' }
      ],
      limit: 100
    })
    
    return panelData
  } catch (error) {
    console.error(`Failed to fetch panel ${panelId}:`, error.message)
    throw error
  }
}
\`\`\`

### Create New Panel
\`\`\`typescript
// Create a new panel
async function createPanel(panelConfig: PanelConfig) {
  try {
    const newPanel = await client.panels.create({
      name: panelConfig.name,
      description: panelConfig.description,
      dataSourceId: panelConfig.dataSourceId,
      columns: panelConfig.columns,
      filters: panelConfig.defaultFilters,
      permissions: panelConfig.permissions
    })
    
    console.log(`Created panel: ${newPanel.id}`)
    return newPanel
  } catch (error) {
    console.error('Failed to create panel:', error.message)
    throw error
  }
}
\`\`\`

## Step 4: Working with Panel Data

### Data Filtering
\`\`\`typescript
// Apply complex filters to panel data
async function getFilteredData(panelId: string) {
  const filters = {
    // Age range filter
    age: {
      min: 18,
      max: 65
    },
    
    // Condition filter (ICD-10 codes)
    conditions: ['E11.9', 'I10'],
    
    // Date range filter
    lastVisit: {
      after: '2024-01-01',
      before: '2024-12-31'
    },
    
    // Custom field filter
    customFields: {
      riskScore: { min: 0.7 }
    }
  }
  
  const data = await client.panels.getData(panelId, { filters })
  return data
}
\`\`\`

### Data Aggregation
\`\`\`typescript
// Get aggregated data from panel
async function getPanelSummary(panelId: string) {
  const summary = await client.panels.getAggregation(panelId, {
    groupBy: ['condition', 'age_group'],
    metrics: [
      { field: 'patient_count', operation: 'count' },
      { field: 'avg_a1c', operation: 'average' },
      { field: 'risk_score', operation: 'max' }
    ]
  })
  
  return summary
}
\`\`\`

## Step 5: Real-Time Data Updates

### WebSocket Connection
\`\`\`typescript
// Subscribe to real-time panel updates
import { PanelsWebSocketClient } from '@panels/api-client'

const wsClient = new PanelsWebSocketClient({
  url: process.env.PANELS_WS_URL,
  apiKey: process.env.PANELS_API_KEY
})

// Subscribe to panel changes
wsClient.subscribe('panel:' + panelId, (update) => {
  console.log('Panel updated:', update)
  // Handle real-time update
  handlePanelUpdate(update)
})

// Subscribe to data changes
wsClient.subscribe('data:' + panelId, (dataUpdate) => {
  console.log('Data updated:', dataUpdate)
  // Refresh UI with new data
  refreshPanelData(dataUpdate)
})
\`\`\`

### Webhook Integration
\`\`\`typescript
// Set up webhook to receive panel updates
async function setupWebhook() {
  const webhook = await client.webhooks.create({
    url: 'https://yourapp.com/api/panels/webhook',
    events: ['panel.updated', 'data.changed'],
    panelIds: [panelId]
  })
  
  return webhook
}

// Handle incoming webhook
app.post('/api/panels/webhook', (req, res) => {
  const { event, data } = req.body
  
  switch (event) {
    case 'panel.updated':
      handlePanelUpdate(data)
      break
    case 'data.changed':
      handleDataChange(data)
      break
  }
  
  res.status(200).send('OK')
})
\`\`\`

## Step 6: Error Handling and Retries

### Robust Error Handling
\`\`\`typescript
import { PanelsApiError, PanelsNetworkError } from '@panels/api-client'

async function robustApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall()
    } catch (error) {
      lastError = error
      
      if (error instanceof PanelsApiError) {
        // API returned an error response
        if (error.status >= 400 && error.status < 500) {
          // Client error - don't retry
          throw error
        }
      }
      
      if (error instanceof PanelsNetworkError) {
        // Network error - retry with backoff
        const delay = Math.pow(2, attempt) * 1000
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      // Unknown error - don't retry
      throw error
    }
  }
  
  throw lastError
}

// Usage
const panels = await robustApiCall(() => client.panels.list())
\`\`\`

### Request Timeout and Cancellation
\`\`\`typescript
// Set up request timeout
const client = new PanelsClient({
  baseUrl: process.env.PANELS_API_URL,
  apiKey: process.env.PANELS_API_KEY,
  timeout: 30000,
  retries: 3
})

// Cancel long-running requests
const abortController = new AbortController()

const dataPromise = client.panels.getData(panelId, {
  signal: abortController.signal
})

// Cancel after 10 seconds
setTimeout(() => {
  abortController.abort()
}, 10000)

try {
  const data = await dataPromise
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request was cancelled')
  }
}
\`\`\`

## Step 7: Caching and Performance

### Response Caching
\`\`\`typescript
import { LRUCache } from 'lru-cache'

// Set up cache
const cache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 5 // 5 minutes
})

async function getCachedPanelData(panelId: string) {
  const cacheKey = `panel:${panelId}`
  
  // Check cache first
  let data = cache.get(cacheKey)
  if (data) {
    console.log('Cache hit for panel:', panelId)
    return data
  }
  
  // Fetch from API
  data = await client.panels.getData(panelId)
  
  // Store in cache
  cache.set(cacheKey, data)
  
  return data
}
\`\`\`

### Batch Operations
\`\`\`typescript
// Batch multiple API calls
async function batchPanelOperations(panelIds: string[]) {
  const batchSize = 5
  const results = []
  
  for (let i = 0; i < panelIds.length; i += batchSize) {
    const batch = panelIds.slice(i, i + batchSize)
    
    const batchPromises = batch.map(panelId => 
      robustApiCall(() => client.panels.getData(panelId))
    )
    
    const batchResults = await Promise.allSettled(batchPromises)
    results.push(...batchResults)
  }
  
  return results
}
\`\`\`

## Step 8: Testing Your Integration

### Unit Tests
\`\`\`typescript
// Mock the API client for testing
import { jest } from '@jest/globals'
import { PanelsClient } from '@panels/api-client'

jest.mock('@panels/api-client')

describe('Panel Integration', () => {
  let mockClient: jest.Mocked<PanelsClient>
  
  beforeEach(() => {
    mockClient = new PanelsClient() as jest.Mocked<PanelsClient>
  })
  
  it('should fetch panel data successfully', async () => {
    // Mock API response
    const mockData = { id: '123', name: 'Test Panel' }
    mockClient.panels.getData.mockResolvedValue(mockData)
    
    // Test your function
    const result = await getPanelData('123')
    
    expect(result).toEqual(mockData)
    expect(mockClient.panels.getData).toHaveBeenCalledWith('123', expect.any(Object))
  })
  
  it('should handle API errors gracefully', async () => {
    // Mock API error
    mockClient.panels.getData.mockRejectedValue(new Error('API Error'))
    
    // Test error handling
    await expect(getPanelData('123')).rejects.toThrow('API Error')
  })
})
\`\`\`

### Integration Tests
\`\`\`typescript
// Test against actual API (use test environment)
describe('API Integration Tests', () => {
  let client: PanelsClient
  
  beforeAll(() => {
    client = new PanelsClient({
      baseUrl: process.env.TEST_API_URL,
      apiKey: process.env.TEST_API_KEY
    })
  })
  
  it('should create and delete a panel', async () => {
    // Create test panel
    const panel = await client.panels.create({
      name: 'Test Panel',
      dataSourceId: 'test-source'
    })
    
    expect(panel.id).toBeDefined()
    
    // Clean up
    await client.panels.delete(panel.id)
  })
})
\`\`\`

## Step 9: Production Deployment

### Environment Configuration
\`\`\`typescript
// Production configuration
const prodConfig = {
  baseUrl: process.env.PANELS_API_URL,
  apiKey: process.env.PANELS_API_KEY,
  timeout: 30000,
  retries: 3,
  rateLimit: {
    requests: 100,
    per: 60000 // per minute
  },
  logging: {
    level: 'warn',
    destination: '/var/log/panels-integration.log'
  }
}

const client = new PanelsClient(prodConfig)
\`\`\`

### Monitoring and Alerting
\`\`\`typescript
// Add monitoring to your integration
import { metrics } from 'your-monitoring-library'

async function monitoredApiCall<T>(
  operation: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const startTime = Date.now()
  
  try {
    const result = await apiCall()
    
    // Record success metrics
    metrics.increment('panels.api.success', {
      operation
    })
    
    metrics.timing('panels.api.duration', Date.now() - startTime, {
      operation
    })
    
    return result
  } catch (error) {
    // Record error metrics
    metrics.increment('panels.api.error', {
      operation,
      error: error.constructor.name
    })
    
    throw error
  }
}

// Usage
const data = await monitoredApiCall('getPanelData', () => 
  client.panels.getData(panelId)
)
\`\`\`

## Best Practices

### Security
- **Never hardcode API keys** in your source code
- **Use environment variables** for configuration
- **Implement proper authentication** flows
- **Validate and sanitize** all user inputs
- **Use HTTPS** for all API communication

### Performance
- **Implement caching** for frequently accessed data
- **Use batch operations** when possible
- **Set appropriate timeouts** for API calls
- **Implement pagination** for large datasets
- **Monitor API usage** and optimize accordingly

### Reliability
- **Implement retry logic** with exponential backoff
- **Handle all error cases** gracefully
- **Set up proper monitoring** and alerting
- **Test error scenarios** thoroughly
- **Plan for API versioning** changes

## Troubleshooting

### Common Issues

**Q: Authentication failures**
- Verify API key is correct and not expired
- Check if your IP is allowlisted
- Ensure proper headers are being sent

**Q: Rate limiting errors**
- Implement exponential backoff
- Reduce request frequency
- Contact support for rate limit increases

**Q: Timeout errors**
- Increase timeout values
- Optimize your queries
- Consider using pagination

**Q: Data inconsistency**
- Check data source synchronization
- Verify filter parameters
- Review panel configuration

## Next Steps

- **[How to create custom columns](./custom-columns.md)** - Add calculated fields
- **[How to extend the UI](./extend-ui.md)** - Build custom interfaces
- **[How to write tests](./write-tests.md)** - Test your integration
- **[API Reference](../../reference/backend-api/)** - Complete API documentation

## Related Topics

- **[Understanding the data model](../../explanation/architecture/data-model.md)** - Learn the data structure
- **[API design principles](../../explanation/decisions/api-design.md)** - Understand the API design
- **[Authentication guide](../admin/configure-permissions.md)** - Set up user permissions
