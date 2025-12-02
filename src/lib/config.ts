// Base URL for the production API stage.
const PROD_API_BASE_URL = 'https://e4i00azm6h.execute-api.us-east-2.amazonaws.com/prod'

// Base URL for the development API stage.
const DEV_API_BASE_URL = 'https://4397wtmg4a.execute-api.us-east-2.amazonaws.com/dev'

// Vite exposes the current mode via import.meta.env.MODE.
// - npm run dev   -> MODE = 'development'   -> use DEV API
// - npm run prod  -> MODE = 'prod-local'    -> use PROD API (local dev server)
// - npm run build -> MODE = 'production'    -> use PROD API (deployed bundle)
const mode = import.meta.env.MODE

const API_BASE_URL =
  mode === 'prod-local' || mode === 'production' ? PROD_API_BASE_URL : DEV_API_BASE_URL

export { API_BASE_URL, PROD_API_BASE_URL, DEV_API_BASE_URL }