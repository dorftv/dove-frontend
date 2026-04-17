/** Wrapper around $fetch that injects the API token auth header. */
export function useApiFetch(url, opts = {}) {
  const token = localStorage.getItem('dove-api-token')
  if (token) {
    opts.headers = { ...opts.headers, Authorization: `Bearer ${token}` }
  }
  return $fetch(url, opts)
}

/** Returns auth headers object for native fetch() calls (WHEP/WHIP). */
export function useAuthHeaders() {
  const token = localStorage.getItem('dove-api-token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}
