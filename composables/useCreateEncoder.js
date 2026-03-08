export const useCreateEncoder = () => {
  const isOpen = ref(false);
  const notify = useNotify();
  const { mixers } = useEntities();
  const doveConfig = useDoveConfig();

  const encoderType = ref('video');
  const selectedResolution = ref(null);
  const formData = reactive({
    element: '',
    options: '',
    profile: '',
    name: '',
    src: null,
  });

  const encoderConfigs = reactive({ video: [], audio: [] });

  const resolutionOptions = computed(() => doveConfig.resolutionOptions.value);
  const defaultResolution = computed(() => doveConfig.defaultResolution.value);

  const availSrc = computed(() =>
    (mixers.value || []).map(m => ({ name: m.name, value: m.uid }))
  );

  const fetchEncoderConfigs = async () => {
    try {
      const data = await $fetch('/api/config/encoder');
      encoderConfigs.video = data.video || [];
      encoderConfigs.audio = data.audio || [];
    } catch (error) {
      notify.error('Failed to load encoder configs');
    }
  };

  const elementOptions = computed(() =>
    encoderConfigs[encoderType.value] || []
  );

  const selectedElementConfig = computed(() =>
    elementOptions.value.find(e => e.element === formData.element) || null
  );

  const onElementChange = (value) => {
    const element = typeof value === 'object' ? value.element : value;
    formData.element = element;
    const config = encoderConfigs[encoderType.value].find(e => e.element === element);
    if (config) {
      formData.options = config.fields?.options?.default || '';
      formData.profile = config.fields?.profile?.default || '';
    }
  };

  const onTypeChange = () => {
    formData.element = '';
    formData.options = '';
    formData.profile = '';
    // Auto-select first element
    const opts = elementOptions.value;
    if (opts.length > 0) {
      onElementChange(opts[0].element);
    }
  };

  const submitCreate = async () => {
    const codec = encoderType.value === 'video' ? codecFromElement(formData.element) : '';

    const dimensions = selectedResolution.value
      ? doveConfig.getResolutionDimensions(selectedResolution.value)
      : null;

    const body = {
      type: encoderType.value,
      element: formData.element,
      options: formData.options || '',
      codec,
      src: formData.src || null,
      width: dimensions?.width || null,
      height: dimensions?.height || null,
      framerate: null,
    };

    if (encoderType.value === 'video' && formData.profile) {
      body.profile = formData.profile;
    }

    if (formData.name) {
      body.name = formData.name;
    }

    isOpen.value = false;
    try {
      return await $fetch('/api/encoders', { method: 'PUT', body });
    } catch (error) {
      notify.error('Failed to create encoder');
    }
  };

  const toggle = () => {
    isOpen.value = !isOpen.value;
  };

  const resetForm = () => {
    formData.element = '';
    formData.options = '';
    formData.profile = '';
    formData.name = '';
    formData.src = availSrc.value[0]?.value || null;
    selectedResolution.value = defaultResolution.value;
    encoderType.value = 'video';
    onTypeChange();
  };

  watch(isOpen, (val) => {
    if (!val) {
      resetForm();
      document.activeElement?.blur();
    }
  });

  watch(defaultResolution, (val) => {
    if (val && !selectedResolution.value) selectedResolution.value = val;
  }, { immediate: true });

  onMounted(async () => {
    await doveConfig.fetchConfig();
    await fetchEncoderConfigs();
    if (defaultResolution.value) selectedResolution.value = defaultResolution.value;
    if (availSrc.value.length > 0) formData.src = availSrc.value[0].value;
    onTypeChange();
  });

  return {
    isOpen,
    toggle,
    encoderType,
    formData,
    availSrc,
    resolutionOptions,
    selectedResolution,
    elementOptions,
    selectedElementConfig,
    onElementChange,
    onTypeChange,
    submitCreate,
  };
};
