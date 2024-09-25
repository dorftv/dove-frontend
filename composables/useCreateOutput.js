export const useCreateOutput = () => {
  const baseCreate = useCreateEntity('outputs');
  const { addOutput } = useDoveConfig();

  const encoderOptions = reactive({
    audio_encoder: [],
    video_encoder: [],
    mux: []
  });

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

  const getEncoderOptions = (field) => {
    return encoderOptions[field.name] || [];
  };

  const initializeEncoderFields = () => {
    baseCreate.types.value.forEach((type) => {
      if (!baseCreate.formData[type.key]) {
        baseCreate.formData[type.key] = {};
      }
      type.fields.forEach((field) => {
        if (isEncoderField(field.name)) {
          const options = getEncoderOptions(field);
          if (options.length > 0) {
            baseCreate.formData[type.key][field.name] = {
              name: options[0].name,
              element: options[0].name,
              ...Object.fromEntries(
                Object.entries(options[0].fields || {})
                  .filter(([key, subField]) => !subField.hidden)
                  .map(([key, subField]) => [key, subField.default])
              )
            };
          }
        }
      });
    });
  };

  const updateEncoderField = (itemKey, fieldName, value) => {
    const selectedEncoder = encoderOptions[fieldName].find(encoder => encoder.name === value);
    if (selectedEncoder) {
      baseCreate.formData[itemKey][fieldName] = {
        name: value,
        element: value,
        ...Object.fromEntries(
          Object.entries(selectedEncoder.fields || {})
            .filter(([key, field]) => !field.hidden)
            .map(([key, field]) => [key, field.default])
        )
      };
    }
  };

  const getSelectedEncoder = (itemKey, fieldName) => {
    const selectedEncoderName = baseCreate.formData[itemKey][fieldName]?.name;
    return encoderOptions[fieldName].find(encoder => encoder.name === selectedEncoderName);
  };

  const getEncoderValue = (itemKey, fieldName, subFieldName) => {
    return baseCreate.formData[itemKey]?.[fieldName]?.[subFieldName];
  };

  const setEncoderValue = (itemKey, fieldName, subFieldName, value) => {
    if (!baseCreate.formData[itemKey]) baseCreate.formData[itemKey] = {};
    if (!baseCreate.formData[itemKey][fieldName]) baseCreate.formData[itemKey][fieldName] = {};
    baseCreate.formData[itemKey][fieldName][subFieldName] = value;
  };

  watch(() => baseCreate.types.value, (newTypes) => {
    if (newTypes.length > 0) {
      initializeEncoderFields();
    }
  }, { immediate: true });

  fetchEncoderOptions();

  return {
    ...baseCreate,
    addOutput,
    encoderOptions,
    isEncoderField,
    getEncoderOptions,
    updateEncoderField,
    getSelectedEncoder,
    getEncoderValue,
    setEncoderValue,
  };
};
