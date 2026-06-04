/**
 * Runtime API configuration helpers.
 *
 * Unlike `lib/http.ts`, these functions perform lazy validation so the app
 * can load even when the API URL is missing.  Call them when you actually
 * need to know whether the backend is reachable.
 */

const ENV_KEY = 'VITE_YGO_API_BASE_URL'

/** Returns `true` when the environment variable is set and non-empty. */
export function isApiConfigured(): boolean {
  const value = import.meta.env[ENV_KEY] as string | undefined
  return typeof value === 'string' && value.length > 0
}

/**
 * Returns the configured base URL.
 *
 * Throws a user-friendly error **at call time** (not module load time) when
 * the variable is missing, so React ErrorBoundary can catch it.
 */
export function getApiBaseUrl(): string {
  const value = import.meta.env[ENV_KEY] as string | undefined

  if (!value) {
    const err = new Error(
      'API no configurada: falta VITE_YGO_API_BASE_URL. ' +
        'Consulta la documentaci\u00f3n del proyecto para configurar las variables de entorno.'
    )
    // Tag the error so ErrorBoundary can show a specific message
    ;(err as Error & { code?: string }).code = 'ERR_API_NOT_CONFIGURED'
    throw err
  }

  return value
}
