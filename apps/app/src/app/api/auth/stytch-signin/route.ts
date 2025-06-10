import { signIn } from '@/lib/auth'
import { type NextRequest, NextResponse } from 'next/server'

// Stytch session validation function
async function validateStytchSession(
  sessionToken: string,
): Promise<{ id: string; email: string; name?: string } | null> {
  try {
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
      return {
        id: data.user.user_id,
        email: data.user.emails[0]?.email,
        name: data.user.name?.first_name
          ? `${data.user.name.first_name} ${data.user.name.last_name || ''}`.trim()
          : undefined,
      }
    }
    return null
  } catch (error) {
    console.error('Stytch session validation error:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const stytchToken = searchParams.get('stytch_token')
  const returnTo = searchParams.get('return_to') || '/'

  if (!stytchToken) {
    return NextResponse.redirect(new URL('/api/auth/signin', request.url))
  }

  // Validate Stytch session
  const stytchUser = await validateStytchSession(stytchToken)

  if (!stytchUser) {
    return NextResponse.redirect(new URL('/api/auth/signin', request.url))
  }

  try {
    // Create NextAuth session using the validated Stytch user data
    // This approach creates a session by programmatically signing in the user
    await signIn('stytch', {
      redirect: false,
      user: JSON.stringify(stytchUser),
    })

    return NextResponse.redirect(new URL(returnTo, request.url))
  } catch (error) {
    console.error('NextAuth session creation error:', error)
    return NextResponse.redirect(new URL('/api/auth/signin', request.url))
  }
}
