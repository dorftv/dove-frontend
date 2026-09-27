/** $fetch wrapper for DOVE API calls — auth rides on the session cookie. */
export function useApiFetch(url, opts = {}) {
  return $fetch(url, opts)
}
