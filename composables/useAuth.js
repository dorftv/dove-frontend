export function useAuth() {
  const user = useState('auth-user', () => null)
  const authEnabled = useState('auth-enabled', () => false)
  const authChecked = useState('auth-checked', () => false)

  const isAuthenticated = computed(() => !authEnabled.value || !!user.value)

  const hasRole = (role) => {
    if (!authEnabled.value) return true
    if (!user.value) return false
    return user.value.roles.includes('admin') || user.value.roles.includes(role)
  }

  // Reactive role checks for use in templates
  const canUser = computed(() => hasRole('user'))
  const canSupervisor = computed(() => hasRole('supervisor'))
  const canOutputs = computed(() => hasRole('outputs'))
  const canAdmin = computed(() => hasRole('admin'))
  // Lock bypass: admin role when auth enabled, ?unlocked=true when auth disabled.
  const canBypassLock = computed(() => {
    if (authEnabled.value) return user.value?.roles?.includes('admin')
    if (typeof window === 'undefined') return false
    return new URLSearchParams(window.location.search).get('unlocked') === 'true'
  })

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('dove-api-token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const data = await $fetch('/auth/me', { headers })
      authEnabled.value = data.auth_enabled
      if (data.authenticated) {
        user.value = data
      } else {
        user.value = null
        // Clear invalid stored token so OIDC can take over
        if (localStorage.getItem('dove-api-token')) {
          localStorage.removeItem('dove-api-token')
        }
      }
    } catch {
      user.value = null
      // Clear stored token on auth failure
      if (localStorage.getItem('dove-api-token')) {
        localStorage.removeItem('dove-api-token')
      }
    }
    authChecked.value = true
  }

  const login = () => {
    if (localStorage.getItem('dove-api-token')) {
      console.error('API token auth failed')
      return
    }
    const origin = window.location.origin
    window.location.href = `/auth/login?redirect_base=${encodeURIComponent(origin)}`
  }

  const logout = () => {
    const origin = window.location.origin
    window.location.href = `/auth/logout?redirect_base=${encodeURIComponent(origin)}`
  }

  return { user, authEnabled, authChecked, isAuthenticated, hasRole, canUser, canSupervisor, canOutputs, canAdmin, canBypassLock, checkAuth, login, logout }
}
