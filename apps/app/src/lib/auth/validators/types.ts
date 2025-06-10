export interface ExternalSessionValidator {
  validateSession(
    token: string,
  ): Promise<{ id: string; email: string; name?: string } | null>
}

export interface ExternalUser {
  id: string
  email: string
  name?: string
}
