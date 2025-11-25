const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined

if (!API_BASE_URL && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn('VITE_API_BASE_URL is not set. Auth and API requests will fail until it is configured.')
}

export { API_BASE_URL }
