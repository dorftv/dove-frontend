export function useNodeCG() {
  const { inputsNodeCG } = useEntities();
  const container = ref(null);
  const iframeHeight = ref('600px');
  const activeTab = ref(0);  // PrimeVue uses integer index for active tab

  const adjustHeight = () => {
    if (container.value) {
      const windowHeight = window.innerHeight;
      const containerTop = container.value.getBoundingClientRect().top;
      const newHeight = windowHeight - containerTop - 20;
      iframeHeight.value = `${newHeight}px`;
    }
  };

  const initializeHeight = () => {
    nextTick(() => {
      adjustHeight();
    });
  };

  onMounted(() => {
    initializeHeight();
    adjustHeight();
    window.addEventListener('resize', adjustHeight);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', adjustHeight);
  });

  watch(activeTab, () => {
    initializeHeight();
  });

  return {
    inputsNodeCG,
    container,
    iframeHeight,
    activeTab,
    adjustHeight,
  };
}
