export default defineNuxtPlugin(() => {
  const params = new URLSearchParams(window.location.search)
  const urlToken = params.get('token')

  if (urlToken) {
    localStorage.setItem('dove-api-token', urlToken)
    params.delete('token')
    const clean = params.toString()
    const newUrl = window.location.pathname + (clean ? '?' + clean : '') + window.location.hash
    window.history.replaceState({}, '', newUrl)
  }

  const token = localStorage.getItem('dove-api-token')

  return {
    provide: {
      apiToken: token,
    },
  }
})
