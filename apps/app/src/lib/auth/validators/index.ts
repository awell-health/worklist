import { StytchValidator } from './stytch'
import type { ExternalSessionValidator } from './types'

export function getValidator(type: string): ExternalSessionValidator {
  switch (type.toLowerCase()) {
    case 'stytch':
      return new StytchValidator()
    // Future validators can be added here:
    // case 'firebase': return new FirebaseValidator();
    // case 'auth0': return new Auth0Validator();
    default:
      throw new Error(`Unknown external session validator: ${type}`)
  }
}

export * from './types'
