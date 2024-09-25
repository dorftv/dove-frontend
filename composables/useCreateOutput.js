export const useCreateOutput = () => {
  const baseCreate = useCreateEntity('outputs');
  const { addOutput } = useDoveConfig();

  const encoderOptions = reactive({
    audio_encoder: [],
    video_encoder: [],
    mux: []
  });
  const visibleEncoderFields = ref({});

  const toggleEncoderFields = (fieldName) => {
    visibleEncoderFields.value[fieldName] = !visibleEncoderFields.value[fieldName];
  };

  const isEncoderFieldsVisible = (fieldName) => {
    return visibleEncoderFields.value[fieldName] || false;
  };

  const resetVisibleEncoderFields = () => {
    visibleEncoderFields.value = {};
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

  const getEncoderOptions = (field) => {
    if (!encoderOptions[field.name]) {
      return [];
    }

    if (Array.isArray(field.options) && field.options.length > 0) {
      // Filter and sort encoder options based on field.options
      return field.options
        .map(optionName => encoderOptions[field.name].find(encoder => encoder.name === optionName))
        .filter(Boolean); // Remove any undefined entries
    }

    return encoderOptions[field.name];
  };


  const initializeEncoderField = (type, field) => {
    if (isEncoderField(field.name)) {
      const availableOptions = getEncoderOptions(field);
      if (availableOptions.length > 0) {
        const defaultEncoderName = availableOptions[0].name;
        const defaultEncoderElement = availableOptions[0].element;


        if (!baseCreate.formData[type.key]) {
          baseCreate.formData[type.key] = {};
        }
        baseCreate.formData[type.key][field.name] = {
          name: defaultEncoderName,
          element: defaultEncoderElement
        };
      }
    }
  };

  const initializeEncoderFields = () => {
    baseCreate.types.value.forEach((type) => {
      if (type.fields) {
        (Array.isArray(type.fields) ? type.fields : Object.values(type.fields)).forEach((field) => {
          if (isEncoderField(field.name)) {
            const availableOptions = getEncoderOptions(field);
            if (availableOptions.length > 0) {
              updateEncoderField(type.key, field.name, availableOptions[0].name);
            }
          }
        });
      }
    });
  };

  const updateEncoderField = (itemKey, fieldName, value) => {
    const selectedEncoder = getEncoderOptions({ name: fieldName, options: [value] })[0];
    if (selectedEncoder) {
      if (!baseCreate.formData[itemKey]) {
        baseCreate.formData[itemKey] = {};
      }
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

  watch(() => baseCreate.isOpen.value, (newIsOpen) => {
    if (!newIsOpen) {
      resetVisibleEncoderFields();
    }
  });
  onMounted(() => {
    initializeForm();
  });
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
    toggleEncoderFields,
    isEncoderFieldsVisible,
  };
};
