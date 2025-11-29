import type { JwtPayload } from '@/types/auth'
import type { User } from '@/types/user'

const STORAGE_KEY = 'helfinka_auth'

export interface StoredAuth {
  token: string
  user: User
}

export function saveAuth(auth: StoredAuth) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
  } catch {
    // Ignore storage errors
  }
}

export function loadAuth(): StoredAuth | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) return null

    const parsed = JSON.parse(raw) as StoredAuth

    if (!parsed.token || !parsed.user) return null

    return parsed
  } catch {
    return null
  }
}

export function clearAuth() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore storage errors
  }
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payloadPart] = token.split('.')

    if (!payloadPart) return null

    const json = atob(payloadPart)

    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token)

  if (!payload?.exp) return true

  const expiresAtMs = payload.exp * 1000

  return Date.now() >= expiresAtMs
}
