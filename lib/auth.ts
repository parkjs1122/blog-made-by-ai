import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
const JWT_EXPIRATION = '7d' // 7 days

export interface JWTPayload {
  username: string
  isAdmin: boolean
  iat?: number
  exp?: number
}

/**
 * Create a JWT token for authenticated admin
 */
export async function createToken(username: string): Promise<string> {
  const token = await new SignJWT({ username, isAdmin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET)

  return token
}

/**
 * Verify and decode JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Verify admin credentials
 */
export function verifyCredentials(username: string, password: string): boolean {
  const adminUsername = process.env.ADMIN_USERNAME
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminUsername || !adminPassword) {
    console.error('Admin credentials not configured in environment variables')
    return false
  }

  return username === adminUsername && password === adminPassword
}
