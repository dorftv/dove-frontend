
export default function useOutputTypes() {
  const types = ref([])
  const isLoading = ref(true)
  const fetchError = ref(null)

  const { data, pending, error } = useFetch('/api/outputs/types')

  watch(data, (newData) => {
    if (Array.isArray(newData)) {
      types.value = newData
    } else if (newData && typeof newData === "object") {
      types.value = Object.values(newData)
    } else {
      types.value = []
    }
  })

  watch(pending, (newPending) => {
    isLoading.value = newPending
  })

  watch(error, (newError) => {
    fetchError.value = newError
  })

  return { types, isLoading, fetchError }
}
