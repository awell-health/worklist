import { vi } from 'vitest'

// Mock server-only to prevent it from throwing in tests
vi.mock('server-only', () => ({}))

// Mock fetch globally
global.fetch = vi.fn()

// Setup global environment variables for tests
vi.stubEnv('NODE_ENV', 'test')
