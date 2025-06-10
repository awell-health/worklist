# How to Set Up Cross-Application Authentication

This guide walks you through implementing the cross-application authentication system using Stytch and NextAuth.

## Prerequisites

- Access to Stytch dashboard
- NextAuth.js already configured in your application
- Applications sharing the same domain or subdomain

## Step 1: Install Required Dependencies

```bash
pnpm add stytch
```

## Step 2: Configure Environment Variables

Create or update your `.env.local` file:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Stytch Configuration  
STYTCH_PROJECT_ID=your-stytch-project-id
STYTCH_SECRET=your-stytch-secret-key
STYTCH_ENVIRONMENT=test

# GitHub OAuth (optional fallback)
GITHUB_ID=your-github-oauth-app-id
GITHUB_SECRET=your-github-oauth-app-secret
```

## Step 3: Configure Stytch Project

1. **Log into Stytch Dashboard**
   - Navigate to your project settings
   - Go to the OAuth section

2. **Add Redirect URLs**
   ```
   http://localhost:3000/api/auth/callback/stytch
   https://yourdomain.com/api/auth/callback/stytch
   ```

3. **Configure Session Settings**
   - Set session duration as needed
   - Enable the cookie settings for cross-domain if needed

## Step 4: Update NextAuth Configuration

Your `auth.ts` should include the Stytch provider:

```typescript
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import type { Provider } from 'next-auth/providers';

// Custom Stytch provider
const StytchProvider: Provider = {
  id: 'stytch',
  name: 'Stytch',
  type: 'oauth',
  wellKnown: 'https://test.stytch.com/v1/public/.well-known/jwks_uri',
  authorization: {
    url: 'https://test.stytch.com/v1/oauth/authorize',
    params: {
      scope: 'openid email profile',
      response_type: 'code',
    },
  },
  token: 'https://test.stytch.com/v1/oauth/token',
  userinfo: 'https://test.stytch.com/v1/oauth/userinfo',
  client: {
    token_endpoint_auth_method: 'client_secret_post',
  },
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
    };
  },
};

export const { handlers: { GET, POST }, signIn, signOut, auth } = NextAuth({
  providers: [GitHub, StytchProvider],
  // ... rest of configuration
});
```

## Step 5: Test the Configuration

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Test OAuth flow**
   - Navigate to `/api/auth/signin`
   - Try signing in with Stytch
   - Verify the user session is created

3. **Check session data**
   - Visit `/dashboard` or a protected route
   - Confirm user information displays correctly

## Step 6: Configure Cross-Application Setup

1. **Ensure Domain Configuration**
   - Both applications must be on the same domain/subdomain
   - Or implement URL-based token passing

2. **Update Cookie Settings**
   - Verify Stytch cookies are accessible across applications
   - Check `sameSite` and `domain` cookie attributes

3. **Test Cross-App Flow**
   - Sign in to Application A
   - Click link to Application B  
   - Verify automatic authentication

## Troubleshooting

### Common Issues

**"Invalid redirect URI"**
- Check Stytch dashboard redirect URLs
- Ensure exact match with your callback URL

**"Session not found"**
- Verify environment variables are correct
- Check cookie domain settings

**"CORS errors"**
- Update Stytch CORS settings
- Check your application's CORS configuration

### Debug Steps

1. **Check browser network tab**
   - Look for failed requests to Stytch endpoints
   - Verify cookies are being sent

2. **Review server logs**
   - Check for authentication errors
   - Look for Stytch API responses

3. **Validate environment variables**
   ```bash
   echo $STYTCH_PROJECT_ID
   echo $STYTCH_SECRET
   ```

## Next Steps

- Set up [authentication troubleshooting](/guides/troubleshooting/auth)
- Configure [user permissions](/guides/admin/configure-permissions)
- Review [authentication architecture](/explanation/architecture/authentication) for design decisions

## Security Considerations

- Always use HTTPS in production
- Regularly rotate Stytch secrets
- Monitor authentication logs for suspicious activity
- Implement proper session timeout policies 