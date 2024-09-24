
export const useCreateOutput = () => {
  const baseCreate = useCreateEntity('outputs');
  const { addOutput } = useDoveConfig();

  const encoderOptions = reactive({
    audio_encoder: [],
    video_encoder: [],
    mux: []
  });

  const getEncoderOptions = (field) => {
    const options = encoderOptions[field.name] || [];
    return options.filter(option => field.options.includes(option.name));
  };

  const fetchEncoderOptions = async () => {
    try {
      const response = await fetch('/api/config/encoder');
      const data = await response.json();
      encoderOptions.audio_encoder = data.audio || [];
      encoderOptions.video_encoder = data.video || [];
      encoderOptions.mux = data.mux || [];
    } catch (error) {
      console.error('Error fetching encoder options:', error);
    }
  };

  const isEncoderField = (fieldName) => ['audio_encoder', 'video_encoder', 'mux'].includes(fieldName);

  const getSelectedEncoder = (itemKey, fieldName) => {
    const selectedEncoderName = baseCreate.formData[itemKey][fieldName];
    return encoderOptions[fieldName].find(encoder => encoder.name === selectedEncoderName);
  };

  const updateEncoderOptions = (itemKey, fieldName) => {
    const selectedEncoder = getSelectedEncoder(itemKey, fieldName);
    if (selectedEncoder) {
      if (!baseCreate.formData[itemKey][fieldName]) {
        baseCreate.formData[itemKey][fieldName] = {};
      }
      baseCreate.formData[itemKey][fieldName] = {
        ...baseCreate.formData[itemKey][fieldName],
        ...selectedEncoder,
      };
      Object.keys(selectedEncoder.fields || {}).forEach(fieldKey => {
        const field = selectedEncoder.fields[fieldKey];
        if (!field.hidden) {
          baseCreate.formData[itemKey][fieldName][fieldKey] = field.default;
        }
      });
    }
  };

  const initializeEncoderFields = () => {
    baseCreate.types.value.forEach((type) => {
      if (!baseCreate.formData[type.key]) {
        baseCreate.formData[type.key] = {};
      }
      if (Array.isArray(type.fields)) {
        type.fields.forEach((field) => {
          if (isEncoderField(field.name) && Array.isArray(field.options) && field.options.length > 0) {
            // Initialize the encoder field with a default value
            baseCreate.formData[type.key][field.name] = {
              name: field.options[0],
              element: field.options[0],
              // Add other default properties as needed
            };
            // Trigger updateEncoderOptions to set default values for encoder fields
            updateEncoderOptions(type.key, field.name);
          }
        });
      }
    });
  };
  const getEncoderValue = (itemKey, fieldName, subFieldName) => {
    if (!baseCreate.formData[itemKey]) {
      baseCreate.formData[itemKey] = {};
    }
    if (!baseCreate.formData[itemKey][fieldName]) {
      baseCreate.formData[itemKey][fieldName] = {};
    }
    return baseCreate.formData[itemKey][fieldName][subFieldName];
  };

  const setEncoderValue = (itemKey, fieldName, subFieldName, value) => {
    if (!baseCreate.formData[itemKey]) {
      baseCreate.formData[itemKey] = {};
    }
    if (!baseCreate.formData[itemKey][fieldName]) {
      baseCreate.formData[itemKey][fieldName] = {};
    }
    baseCreate.formData[itemKey][fieldName][subFieldName] = value;
  };


  watch(() => baseCreate.types.value, (newTypes) => {
    if (newTypes.length > 0) {
      initializeEncoderFields();
    }
  }, { immediate: true });

  onMounted(async () => {
    await fetchEncoderOptions();
    initializeEncoderFields();
  });

  return {
    ...baseCreate,
    addOutput,
    encoderOptions,
    isEncoderField,
    getSelectedEncoder,
    updateEncoderOptions,
    getEncoderOptions,
    getEncoderValue,
    setEncoderValue,
  };
};
