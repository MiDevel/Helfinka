import axios from 'axios'

import { API_BASE_URL } from '@/lib/config'

type AuthTokenGetter = () => string | null

type UnauthorizedHandler = () => void

let authTokenGetter: AuthTokenGetter | null = null
let unauthorizedHandler: UnauthorizedHandler | null = null

export const api = axios.create({
  baseURL: API_BASE_URL,
})

export function setAuthTokenGetter(getter: AuthTokenGetter | null) {
  authTokenGetter = getter
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler
}

api.interceptors.request.use((config) => {
  const token = authTokenGetter?.() ?? null

  if (token) {
    if (!config.headers) {
      // eslint-disable-next-line no-param-reassign
      config.headers = {} as typeof config.headers
    }

    ;(config.headers as Record<string, string>).Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status

    if (status === 401 || status === 403) {
      unauthorizedHandler?.()
    }

    return Promise.reject(error)
  }
)
