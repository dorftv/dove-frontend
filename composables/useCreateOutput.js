export const useCreateOutput = () => {
  const baseCreate = useCreateEntity('outputs');
  const { addOutput } = useDoveConfig();
  const notify = useNotify();

  const encoderOptions = reactive({
    audio_encoder: [],
    video_encoder: [],
    mux: []
  });

  const muxFieldsVisible = ref(false);

  const inlineEncoder = useInlineEncoder(encoderOptions, baseCreate.formData, baseCreate.types);

  const fetchEncoderOptions = async () => {
    try {
      const data = await useApiFetch('/api/config/encoder');
      encoderOptions.audio_encoder = data.audio || [];
      encoderOptions.video_encoder = data.video || [];
      encoderOptions.mux = data.mux || [];
    } catch (error) {
      console.error('Error fetching encoder options:', error);
      notify.error('Failed to load encoder options');
    }
  };

  const isEncoderField = (fieldName) => ['audio_encoder', 'video_encoder', 'mux'].includes(fieldName);

  const hasEncoderFields = (type) => {
    if (!type.fields) return false;
    const fields = Array.isArray(type.fields) ? type.fields : Object.values(type.fields);
    return fields.some(field => isEncoderField(field.name));
  };

  // Filter encoder configs by output type's allowed options (used for mux)
  const getEncoderOptions = (field) => {
    if (!encoderOptions[field.name]) return [];
    if (Array.isArray(field.options) && field.options.length > 0) {
      return field.options
        .map(optionName => encoderOptions[field.name].find(encoder => encoder.name === optionName))
        .filter(Boolean);
    }
    return encoderOptions[field.name];
  };

  // --- Mux helpers (inline pattern) ---

  const toggleMuxFields = () => { muxFieldsVisible.value = !muxFieldsVisible.value; };
  const isMuxFieldsVisible = () => muxFieldsVisible.value;

  const updateMuxField = (typeKey, rawValue) => {
    const value = typeof rawValue === 'object' ? rawValue.name : rawValue;
    const selected = encoderOptions.mux.find(e => e.name === value);
    if (selected) {
      if (!baseCreate.formData[typeKey]) baseCreate.formData[typeKey] = {};
      baseCreate.formData[typeKey].mux = { name: value, element: selected.element };
    }
  };

  const getSelectedMux = (typeKey) => {
    const name = baseCreate.formData[typeKey]?.mux?.name;
    if (!name) return null;
    return encoderOptions.mux.find(e => e.name === name);
  };

  const getMuxValue = (typeKey, subField) => {
    return baseCreate.formData[typeKey]?.mux?.[subField] || '';
  };

  const setMuxValue = (typeKey, subField, value) => {
    if (!baseCreate.formData[typeKey]) baseCreate.formData[typeKey] = {};
    if (!baseCreate.formData[typeKey].mux) baseCreate.formData[typeKey].mux = {};
    baseCreate.formData[typeKey].mux[subField] = value;
  };

  const submitCreate = async (itemType) => {
    const body = { ...baseCreate.formData[itemType] };

    for (const fieldName of ['video_encoder', 'audio_encoder']) {
      if (body[fieldName] === '__new__') {
        const uid = await inlineEncoder.createEncoderInline(itemType, fieldName);
        if (!uid) return;
        body[fieldName] = uid;
      } else if (!body[fieldName]) {
        delete body[fieldName];
      }
      delete body[`_new_${fieldName}`];
    }

    const path = `/api/outputs/${itemType}`;
    baseCreate.isOpen.value = false;
    try {
      return await useApiFetch(path, { method: 'PUT', body });
    } catch (error) {
      const detail = error?.data?.detail;
      notify.error(typeof detail === 'string' ? detail : 'Failed to create output');
    }
  };

  // Initialize mux defaults
  const initializeMuxDefaults = () => {
    baseCreate.types.value.forEach((type) => {
      if (!type.fields) return;
      const fields = Array.isArray(type.fields) ? type.fields : Object.values(type.fields);
      fields.forEach((field) => {
        if (field.name === 'mux') {
          const opts = getEncoderOptions(field);
          if (opts.length > 0) {
            if (!baseCreate.formData[type.key]) baseCreate.formData[type.key] = {};
            baseCreate.formData[type.key].mux = {
              name: opts[0].name,
              element: opts[0].element,
            };
          }
        }
      });
    });
  };

  const initializeForm = async () => {
    await fetchEncoderOptions();
    initializeMuxDefaults();
  };

  watch(() => baseCreate.types.value, (newTypes) => {
    if (newTypes.length > 0) initializeForm();
  }, { immediate: true });

  watch(() => baseCreate.availSrc.value, (newAvailSrc) => {
    if (newAvailSrc.length > 0) {
      baseCreate.types.value.forEach((type) => {
        if (baseCreate.formData[type.key] && !baseCreate.formData[type.key].src) {
          baseCreate.formData[type.key].src = newAvailSrc[0].value;
        }
      });
    }
  }, { immediate: true });

  watch(() => baseCreate.isOpen.value, (newIsOpen) => {
    muxFieldsVisible.value = false;
    if (!newIsOpen) {
      initializeMuxDefaults();
    }
  });

  onMounted(() => initializeForm());

  return {
    ...baseCreate,
    ...inlineEncoder,
    submitCreate,
    addOutput,
    encoderOptions,
    isEncoderField,
    hasEncoderFields,
    getEncoderOptions,
    // Mux
    toggleMuxFields,
    isMuxFieldsVisible,
    updateMuxField,
    getSelectedMux,
    getMuxValue,
    setMuxValue,
  };
};
