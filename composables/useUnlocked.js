// useUnlocked.js

export const useLocked = () => {
  const route = useRoute()

  const isUnlocked = computed(() => {
    if (!route.query.unlocked) return false
    
    return route.query.unlocked === 'true'
  })

  return {
    isUnlocked
  }
}