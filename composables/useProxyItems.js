export function useProxyItems() {
  const proxyItems = ref({});

  async function fetchItems(proxyType) {
    const { data, error } = await useFetch(`/proxy/${proxyType}`).json();

    if (error.value) {
      console.error('Failed to fetch items:', error.value);
      proxyItems.value[proxyType] = [];
    } else {
      proxyItems.value[proxyType] = data.value;
    }
  }

  function handleProxyName(itemLabel, fieldName, proxyType, selectedValue, formData) {
    const selectedItem = proxyItems.value[proxyType]?.find(item => item.url === selectedValue);
    if (selectedItem) {
      formData[itemLabel][fieldName] = selectedItem.name;
    }
  }

  return {
    proxyItems,
    fetchItems,
    handleProxyName,
  };
}
