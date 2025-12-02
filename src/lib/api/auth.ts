import { api } from '@/lib/api/client'
import { loginRequestSchema, loginResponseSchema, type LoginRequest, type LoginResponse } from '@/types/auth'

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const body = loginRequestSchema.parse(payload)

  const response = await api.post('/auth/login', body)

  return loginResponseSchema.parse(response.data)
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout')
  } catch {
    // Ignore logout errors; we still clear local auth state.
  }
}

interface HelloResponse {
  message: string
}

export async function hello(): Promise<HelloResponse> {
  const response = await api.get<HelloResponse>('/hello')

  return response.data
}

export interface ApiVersionInfo {
  version: string
  environment: string
  built: string
}

export async function getApiVersion(): Promise<ApiVersionInfo> {
  const response = await api.get<ApiVersionInfo>('/version')

  return response.data
}
