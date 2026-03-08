export function useProxyItems() {
  const proxyItems = ref({});

  async function fetchItems(proxyType) {
    try {
      const data = await $fetch(`/proxy/${proxyType}`);
      proxyItems.value[proxyType] = data;
    } catch (err) {
      console.error('Failed to fetch items:', err);
      proxyItems.value[proxyType] = [];
    }
  }

  function handleProxyName(itemLabel, fieldName, proxyType, selectedValue, formData) {
    const selectedItem = proxyItems.value[proxyType]?.find(item => item.url === selectedValue);
    if (selectedItem && !formData[itemLabel]['name']) {
      formData[itemLabel]['name'] = selectedItem.name;
    }
  }

  return {
    proxyItems,
    fetchItems,
    handleProxyName,
  };
}
