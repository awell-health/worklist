# API Client Authentication

Learn how to securely authenticate with the Panels API and manage user sessions across your application.

## Overview

The Panels API uses multi-layered authentication to ensure secure access to tenant-specific data. This guide covers all authentication methods and best practices for production use.

## Authentication Methods

### 1. JWT Token Authentication (Recommended)

The primary authentication method using JSON Web Tokens:

```typescript
import { panelsAPI } from '@panels/app/api'

// Configure API client with JWT token
panelsAPI.configure({
  baseURL: process.env.PANELS_API_URL,
  authentication: {
    type: 'jwt',
    token: userToken // From your auth system
  }
})

// All subsequent API calls will include the JWT token
const panels = await panelsAPI.panels.list(tenantId, userId)
```

### 2. API Key Authentication

For server-to-server communication:

```typescript
panelsAPI.configure({
  baseURL: process.env.PANELS_API_URL,
  authentication: {
    type: 'api-key',
    apiKey: process.env.PANELS_API_KEY,
    tenantId: process.env.TENANT_ID
  }
})
```

### 3. Session-based Authentication

For traditional web applications:

```typescript
panelsAPI.configure({
  baseURL: process.env.PANELS_API_URL,
  authentication: {
    type: 'session',
    sessionId: req.sessionID // From Express session
  },
  credentials: 'include' // Include cookies
})
```

## Multi-tenant Context

Every API call requires tenant and user context:

```typescript
// Required parameters for all operations
const context = {
  tenantId: "tenant-123",  // Organization/workspace identifier
  userId: "user-456"       // Current user identifier
}

// Usage pattern
const panels = await panelsAPI.panels.list(context.tenantId, context.userId)
const panel = await panelsAPI.panels.create(panelData, context.tenantId, context.userId)
```

## Authentication Patterns

### React Application Setup

```typescript
// contexts/auth.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { panelsAPI } from '@panels/app/api'

interface AuthContext {
  user: User | null
  tenant: Tenant | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContext | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Configure API client when token changes
    if (token) {
      panelsAPI.configure({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        authentication: {
          type: 'jwt',
          token: token
        }
      })
    }
  }, [token])

  const login = async (credentials: LoginCredentials) => {
    try {
      // Your authentication logic here
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      const { user, tenant, token } = await response.json()

      setUser(user)
      setTenant(tenant)
      setToken(token)

      // Store token securely
      localStorage.setItem('auth_token', token)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = async () => {
    setUser(null)
    setTenant(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    
    // Clear API client configuration
    panelsAPI.configure({
      authentication: null
    })
  }

  return (
    <AuthContext.Provider 
      value={{
        user,
        tenant,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

### Using Authentication in Components

```typescript
// components/PanelsList.tsx
import { useAuth } from '../contexts/auth'
import { panelsAPI } from '@panels/app/api'
import { useEffect, useState } from 'react'

export function PanelsList() {
  const { user, tenant, isAuthenticated } = useAuth()
  const [panels, setPanels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !tenant || !user) return

    const loadPanels = async () => {
      try {
        setLoading(true)
        const panelsList = await panelsAPI.panels.list(tenant.id, user.id)
        setPanels(panelsList)
      } catch (error) {
        console.error('Failed to load panels:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPanels()
  }, [isAuthenticated, tenant, user])

  if (!isAuthenticated) {
    return <div>Please log in to view panels</div>
  }

  if (loading) {
    return <div>Loading panels...</div>
  }

  return (
    <div>
      <h2>Your Panels</h2>
      {panels.map(panel => (
        <div key={panel.id}>
          <h3>{panel.title}</h3>
          <p>{panel.description}</p>
        </div>
      ))}
    </div>
  )
}
```

## Server-side Authentication

### Next.js API Routes

```typescript
// pages/api/panels/index.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { panelsAPI } from '@panels/app/api'
import { verifyToken, getTenantFromToken } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const userPayload = await verifyToken(token)
    const tenant = await getTenantFromToken(token)

    // Configure API client for this request
    panelsAPI.configure({
      baseURL: process.env.PANELS_API_URL,
      authentication: {
        type: 'jwt',
        token: token
      }
    })

    switch (req.method) {
      case 'GET':
        const panels = await panelsAPI.panels.list(tenant.id, userPayload.userId)
        return res.json(panels)

      case 'POST':
        const newPanel = await panelsAPI.panels.create(
          req.body,
          tenant.id,
          userPayload.userId
        )
        return res.json(newPanel)

      default:
        res.setHeader('Allow', ['GET', 'POST'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
```

### Express.js Middleware

```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express'
import { panelsAPI } from '@panels/app/api'
import jwt from 'jsonwebtoken'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    tenantId: string
    permissions: string[]
  }
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Access token required' })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    // Configure API client
    panelsAPI.configure({
      baseURL: process.env.PANELS_API_URL,
      authentication: {
        type: 'jwt',
        token: token
      }
    })

    // Add user context to request
    req.user = {
      id: decoded.userId,
      tenantId: decoded.tenantId,
      permissions: decoded.permissions || []
    }

    next()
  } catch (error) {
    console.error('Authentication error:', error)
    return res.status(403).json({ error: 'Invalid or expired token' })
  }
}

// Usage in routes
import express from 'express'
const router = express.Router()

router.get('/panels', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const panels = await panelsAPI.panels.list(req.user!.tenantId, req.user!.id)
    res.json(panels)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch panels' })
  }
})
```

## Security Best Practices

### Token Storage

**Client-side Security:**
```typescript
// ✅ Good: Use httpOnly cookies for sensitive tokens
// Set via server-side response
res.cookie('auth_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
})

// ✅ Good: Use sessionStorage for temporary tokens
sessionStorage.setItem('temp_token', token)

// ⚠️ Acceptable: localStorage with proper expiration
const tokenData = {
  token,
  expiresAt: Date.now() + (24 * 60 * 60 * 1000)
}
localStorage.setItem('auth_data', JSON.stringify(tokenData))

// ❌ Bad: Plain localStorage without expiration
localStorage.setItem('token', token)
```

### Token Validation

```typescript
// lib/auth.ts
import jwt from 'jsonwebtoken'

export interface TokenPayload {
  userId: string
  tenantId: string
  permissions: string[]
  exp: number
  iat: number
}

export const verifyToken = async (token: string): Promise<TokenPayload> => {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload
    
    // Additional validation
    if (payload.exp * 1000 < Date.now()) {
      throw new Error('Token expired')
    }

    return payload
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = jwt.decode(token) as TokenPayload
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}
```

### Automatic Token Refresh

```typescript
// hooks/useAuthToken.ts
import { useEffect, useRef } from 'react'
import { useAuth } from '../contexts/auth'

export const useAuthToken = () => {
  const { token, refreshToken, logout } = useAuth()
  const refreshTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!token) return

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expiresAt = payload.exp * 1000
      const refreshAt = expiresAt - (5 * 60 * 1000) // Refresh 5 min before expiry

      const timeUntilRefresh = refreshAt - Date.now()

      if (timeUntilRefresh > 0) {
        refreshTimeoutRef.current = setTimeout(async () => {
          try {
            await refreshToken()
          } catch (error) {
            console.error('Token refresh failed:', error)
            logout()
          }
        }, timeUntilRefresh)
      } else {
        // Token expires soon, refresh immediately
        refreshToken().catch(logout)
      }
    } catch (error) {
      console.error('Failed to parse token:', error)
      logout()
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [token, refreshToken, logout])
}
```

## Error Handling

### Authentication Errors

```typescript
// lib/apiClient.ts
import { panelsAPI } from '@panels/app/api'

export class AuthenticationError extends Error {
  constructor(message: string, public status: number) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export const handleAuthError = (error: any) => {
  if (error.status === 401) {
    // Token expired or invalid
    throw new AuthenticationError('Authentication required', 401)
  } else if (error.status === 403) {
    // Insufficient permissions
    throw new AuthenticationError('Insufficient permissions', 403)
  } else if (error.status === 429) {
    // Rate limited
    throw new AuthenticationError('Too many requests', 429)
  }
  
  throw error
}

// Enhanced API wrapper with error handling
export const authenticatedAPI = {
  async panels(tenantId: string, userId: string) {
    try {
      return await panelsAPI.panels.list(tenantId, userId)
    } catch (error) {
      handleAuthError(error)
    }
  },

  async createPanel(data: any, tenantId: string, userId: string) {
    try {
      return await panelsAPI.panels.create(data, tenantId, userId)
    } catch (error) {
      handleAuthError(error)
    }
  }
}
```

### React Error Boundary

```typescript
// components/AuthErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AuthenticationError } from '../lib/apiClient'

interface Props {
  children: ReactNode
  onAuthError?: () => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Auth error boundary caught an error:', error, errorInfo)
    
    if (error instanceof AuthenticationError) {
      // Handle authentication errors
      this.props.onAuthError?.()
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.state.error instanceof AuthenticationError) {
        return (
          <div className="auth-error">
            <h2>Authentication Required</h2>
            <p>Please log in to continue.</p>
            <button onClick={() => window.location.href = '/login'}>
              Go to Login
            </button>
          </div>
        )
      }

      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <p>An unexpected error occurred. Please try again.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

## Testing Authentication

### Mock Authentication for Tests

```typescript
// __tests__/utils/mockAuth.ts
import { panelsAPI } from '@panels/app/api'

export const mockAuthConfig = {
  baseURL: 'http://localhost:3001',
  authentication: {
    type: 'jwt' as const,
    token: 'mock-jwt-token'
  }
}

export const setupMockAuth = () => {
  panelsAPI.configure(mockAuthConfig)
}

export const mockUserContext = {
  tenantId: 'test-tenant',
  userId: 'test-user'
}
```

### Integration Tests

```typescript
// __tests__/auth.test.ts
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '../contexts/auth'
import { PanelsList } from '../components/PanelsList'
import { setupMockAuth, mockUserContext } from './utils/mockAuth'

beforeEach(() => {
  setupMockAuth()
})

test('shows panels after authentication', async () => {
  const user = userEvent.setup()
  
  render(
    <AuthProvider>
      <PanelsList />
    </AuthProvider>
  )

  // Should show login prompt initially
  expect(screen.getByText('Please log in to view panels')).toBeInTheDocument()

  // Mock successful authentication
  // ... authentication flow test

  // Should show panels list
  await waitFor(() => {
    expect(screen.getByText('Your Panels')).toBeInTheDocument()
  })
})
```

## Environment Configuration

```typescript
// .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
PANELS_API_KEY=your-api-key-here
JWT_SECRET=your-jwt-secret-here
TENANT_ID=default-tenant

# .env.production
NEXT_PUBLIC_API_URL=https://api.panels.company.com
PANELS_API_KEY=prod-api-key
JWT_SECRET=strong-production-secret
```

## Summary

Authentication in the Panels API system requires:

1. **Proper token management** with secure storage and refresh
2. **Multi-tenant context** in every API call
3. **Error handling** for authentication failures
4. **Security best practices** for production deployment

The authentication system supports multiple methods and provides the flexibility needed for various application architectures while maintaining security and multi-tenant isolation. 