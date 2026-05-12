export default defineNuxtPlugin(async (nuxtApp) => {
  const params = new URLSearchParams(window.location.search)
  const urlToken = params.get('token')

  let mounted = false
  nuxtApp.hook('app:mounted', () => { mounted = true })

  const surfaceError = (msg) => {
    console.error(msg)
    const showToast = () => { try { useToast().add({ title: msg, color: 'error', duration: 5000 }) } catch {} }
    // Toast provider isn't available until <UApp> mounts — queue if not mounted yet.
    if (mounted) showToast()
    else nuxtApp.hook('app:mounted', showToast)
  }

  if (urlToken) {
    // Strip from URL first so it doesn't leak via history/referer regardless of validation outcome.
    params.delete('token')
    const clean = params.toString()
    const newUrl = window.location.pathname + (clean ? '?' + clean : '') + window.location.hash
    window.history.replaceState({}, '', newUrl)

    const existing = localStorage.getItem('dove-api-token')
    if (existing && existing !== urlToken) {
      // Refuse silent identity swap — login links are for fresh sessions, not overwriting an active one.
      surfaceError('Already logged in — sign out first to use a different login link')
    } else {
      try {
        const data = await $fetch('/auth/me', {
          headers: { Authorization: `Bearer ${urlToken}` },
          credentials: 'omit',
        })
        if (data.authenticated || data.auth_enabled === false) {
          localStorage.setItem('dove-api-token', urlToken)
        } else {
          surfaceError('Login link is invalid or expired')
        }
      } catch (e) {
        surfaceError('Could not verify login link: ' + (e?.message || 'network error'))
      }
    }
  }

  const token = localStorage.getItem('dove-api-token')

  return {
    provide: {
      apiToken: token,
    },
  }
})
