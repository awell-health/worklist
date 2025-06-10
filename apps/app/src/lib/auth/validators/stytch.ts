import type { ExternalSessionValidator, ExternalUser } from './types'

export class StytchValidator implements ExternalSessionValidator {
  async validateSession(sessionToken: string): Promise<ExternalUser | null> {
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
}
