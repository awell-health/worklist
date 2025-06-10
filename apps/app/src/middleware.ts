import { auth } from '@/lib/auth'
import { getValidator } from '@/lib/auth/validators/index'
import type { ExternalSessionValidator } from '@/lib/auth/validators/types'
import { GitHub, StytchProvider } from '@nextauth/next'
import { NextAuth } from '@nextauth/next'
import { type NextRequest, NextResponse } from 'next/server'

// Stytch session validation function
async function validateStytchSession(
  sessionToken: string,
): Promise<{ id: string; email: string; name?: string } | null> {
  try {
    // Note: You'll need to install 'stytch' package and configure with your credentials
    const response = await fetch(
      'https://test.stytch.com/v1/sessions/authenticate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${process.env.STYTCH_PROJECT_ID}:${process.env.STYTCH_SECRET}`).toString('base64')}`,
        },
        body: JSON.stringify({
          session_token: sessionToken,
        }),
      },
    )

    if (response.ok) {
      const data = await response.json()
      return data.user
    }
    return null
  } catch (error) {
    console.error('Stytch session validation error:', error)
    return null
  }
}

export async function middleware(request: NextRequest) {
  const session = await auth();
  const authMode = process.env.AUTH_MODE || 'standalone';
  
  if (session) {
    return NextResponse.next();
  }

  // Check for external session (integrated mode only)
  if (authMode === 'integrated') {
    const cookieName = process.env.EXTERNAL_SESSION_COOKIE;
    const validatorType = process.env.EXTERNAL_SESSION_VALIDATOR;
    
    if (cookieName && validatorType) {
      const externalSession = request.cookies.get(cookieName);
      
      if (externalSession) {
        const validator = getValidator(validatorType);
        const user = await validator.validateSession(externalSession.value);
        
        if (user) {
          const signInUrl = new URL('/api/auth/external-signin', request.url);
          signInUrl.searchParams.set('token', externalSession.value);
          signInUrl.searchParams.set('return_to', request.url);
          return NextResponse.redirect(signInUrl);
        }
      }
    }
  }

  // Route protection logic
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth/') || 
                     request.nextUrl.pathname.startsWith('/api/auth/');

  if (authMode === 'integrated') {
    // In integrated mode: ALL routes are protected
    const externalLoginUrl = process.env.EXTERNAL_LOGIN_URL;
    if (externalLoginUrl) {
      const loginUrl = new URL(externalLoginUrl);
      loginUrl.searchParams.set('return_to', request.url);
      return NextResponse.redirect(loginUrl);
    }
  } else {
    // In standalone mode: protect only specific routes (exclude auth pages)
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                            request.nextUrl.pathname.startsWith('/protected');
    
    if (isProtectedRoute && !isAuthRoute) {
      const signInUrl = new URL('/api/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // In integrated mode: match all routes
    // In standalone mode: match all except auth routes  
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};

export const { ... } = NextAuth({
  providers: [GitHub, StytchProvider],
  pages: {
    // Disable sign-in page completely in integrated mode
    signIn: process.env.AUTH_MODE === 'integrated' ? undefined : '/auth/signin',
    error: '/auth/error',
  },
  // ... rest
});

export class StytchValidator implements ExternalSessionValidator {
  async validateSession(token: string) {
    // Stytch-specific validation logic
  }
}

export function getValidator(type: string): ExternalSessionValidator {
  switch (type) {
    case 'stytch': return new StytchValidator();
    // case 'firebase': return new FirebaseValidator();
    default: throw new Error(`Unknown validator: ${type}`);
  }
}
