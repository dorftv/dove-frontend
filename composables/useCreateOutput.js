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


  const initializeEncoderField = (type, field) => {
    if (isEncoderField(field.name) && Array.isArray(field.options) && field.options.length > 0) {
      const defaultEncoderName = field.options[0];
      const defaultEncoder = encoderOptions[field.name].find(encoder => encoder.name === defaultEncoderName);

      if (defaultEncoder) {
        if (!baseCreate.formData[type.key]) {
          baseCreate.formData[type.key] = {};
        }
        baseCreate.formData[type.key][field.name] = {
          name: defaultEncoderName,
          element: defaultEncoderName,
          ...Object.fromEntries(
            Object.entries(defaultEncoder.fields || {})
              .filter(([key, subField]) => !subField.hidden)
              .map(([key, subField]) => [key, subField.default])
          )
        };
      }
    }
  };


  const initializeEncoderFields = () => {
    baseCreate.types.value.forEach((type) => {
      if (type.fields) {
        if (Array.isArray(type.fields)) {
          type.fields.forEach((field) => {
            initializeEncoderField(type, field);
          });
        } else if (typeof type.fields === 'object') {
          Object.values(type.fields).forEach((field) => {
            initializeEncoderField(type, field);
          });
        }
      }
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
    const selectedEncoderName = baseCreate.formData[itemKey]?.[fieldName]?.name;
    if (!selectedEncoderName) {
      // If the encoder hasn't been initialized yet, return the first option
      const type = baseCreate.types.value.find(type => type.key === itemKey);
      if (type && type.fields) {
        const field = Array.isArray(type.fields)
          ? type.fields.find(f => f.name === fieldName)
          : type.fields[fieldName];

        if (field && Array.isArray(field.options) && field.options.length > 0) {
          return encoderOptions[fieldName].find(encoder => encoder.name === field.options[0]);
        }
      }
      return null;
    }
    return encoderOptions[fieldName].find(encoder => encoder.name === selectedEncoderName);
  };


  const getEncoderValue = (itemKey, fieldName, subFieldName) => {
    if (!baseCreate.formData[itemKey] || !baseCreate.formData[itemKey][fieldName]) {
      // If the encoder hasn't been initialized yet, return the first option
      const type = baseCreate.types.value.find(type => type.key === itemKey);
      if (type && type.fields) {
        const field = Array.isArray(type.fields)
          ? type.fields.find(f => f.name === fieldName)
          : type.fields[fieldName];

        if (field && Array.isArray(field.options) && field.options.length > 0) {
          return subFieldName === 'name' ? field.options[0] : '';
        }
      }
      return '';
    }
    return baseCreate.formData[itemKey][fieldName][subFieldName];
  };

  const setEncoderValue = (itemKey, fieldName, subFieldName, value) => {
    if (!baseCreate.formData[itemKey]) baseCreate.formData[itemKey] = {};
    if (!baseCreate.formData[itemKey][fieldName]) baseCreate.formData[itemKey][fieldName] = {};
    baseCreate.formData[itemKey][fieldName][subFieldName] = value;
  };

  const initializeForm = async () => {
    await fetchEncoderOptions();
    initializeEncoderFields();
  };

  watch(() => baseCreate.types.value, (newTypes) => {
    if (newTypes.length > 0) {
      initializeForm();
    }
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
    initializeForm,
  };
};
