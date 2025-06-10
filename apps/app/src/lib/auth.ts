import NextAuth from 'next-auth'
import type { Provider } from 'next-auth/providers'
import GitHub from 'next-auth/providers/github'

// Custom Stytch provider
const StytchProvider: Provider = {
  id: 'stytch',
  name: 'Stytch',
  type: 'oauth',
  wellKnown: 'https://test.stytch.com/v1/public/.well-known/jwks_uri', // Use your Stytch environment
  authorization: {
    url: 'https://test.stytch.com/v1/oauth/authorize', // Use your Stytch environment
    params: {
      scope: 'openid email profile',
      response_type: 'code',
    },
  },
  token: 'https://test.stytch.com/v1/oauth/token', // Use your Stytch environment
  userinfo: 'https://test.stytch.com/v1/oauth/userinfo', // Use your Stytch environment
  client: {
    token_endpoint_auth_method: 'client_secret_post',
  },
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
    }
  },
}

export const {
  handlers: { GET, POST },
  signIn,
  signOut,
  auth,
} = NextAuth({
  providers: [GitHub, StytchProvider],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign-in for validated Stytch users
      if (account?.provider === 'stytch') {
        // Additional validation can be added here
        return true
      }

      // Allow other providers (GitHub, etc.)
      return true
    },
    async session({ session, token }) {
      // Enhance session with additional user data
      if (token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user, account }) {
      // Store user ID in token for session callback
      if (user) {
        token.sub = user.id
      }

      // Handle Stytch-specific token data
      if (account?.provider === 'stytch') {
        token.provider = 'stytch'
      }

      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
})
