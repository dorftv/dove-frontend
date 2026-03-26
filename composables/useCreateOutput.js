export const useCreateOutput = () => {
  const baseCreate = useCreateEntity('outputs');
  const { addOutput } = useDoveConfig();
  const { encoders } = useEntities();
  const notify = useNotify();

  const encoderOptions = reactive({
    audio_encoder: [],
    video_encoder: [],
    mux: []
  });

  const muxFieldsVisible = ref(false);

  const fetchEncoderOptions = async () => {
    try {
      const data = await $fetch('/api/config/encoder');
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

  // --- Encoder entity helpers (video/audio) ---

  const getCompatibleEncoders = (typeKey, fieldName) => {
    const type = baseCreate.types.value.find(t => t.key === typeKey);
    if (!type) return [];

    const field = Array.isArray(type.fields)
      ? type.fields.find(f => f.name === fieldName)
      : type.fields?.[fieldName];
    if (!field) return [];

    const encoderType = fieldName === 'video_encoder' ? 'video' : 'audio';

    // Build name→element map from encoder config
    const nameToElement = {};
    for (const enc of (encoderOptions[fieldName] || [])) {
      nameToElement[enc.name] = enc.element;
    }

    // Allowed elements from the output type's field options
    const allowedElements = new Set(
      (field.options || []).map(name => nameToElement[name]).filter(Boolean)
    );

    const formSrc = baseCreate.formData[typeKey]?.src;
    const formWidth = baseCreate.formData[typeKey]?.width;
    const formHeight = baseCreate.formData[typeKey]?.height;

    return encoders.value.filter(enc => {
      if (enc.type !== encoderType) return false;
      if (allowedElements.size > 0 && !allowedElements.has(enc.element)) return false;
      // Only filter by src/dimensions when both sides have a value
      if (formSrc && enc.src && String(enc.src) !== String(formSrc)) return false;
      if (formWidth && enc.width && Number(enc.width) !== Number(formWidth)) return false;
      if (formHeight && enc.height && Number(enc.height) !== Number(formHeight)) return false;
      return true;
    });
  };

  const getEncoderSelectOptions = (typeKey, fieldName) => {
    const compatible = getCompatibleEncoders(typeKey, fieldName);
    const options = compatible.map(enc => ({
      label: `${enc.element} (${enc.name})`,
      value: enc.uid,
    }));
    options.push({ label: '+ Create new encoder', value: '__new__' });
    return options;
  };

  const getCompatibleEncoderTypes = (typeKey, fieldName) => {
    const type = baseCreate.types.value.find(t => t.key === typeKey);
    if (!type) return [];

    const field = Array.isArray(type.fields)
      ? type.fields.find(f => f.name === fieldName)
      : type.fields?.[fieldName];
    if (!field) return [];

    const category = fieldName === 'video_encoder' ? 'video_encoder' : 'audio_encoder';
    const allTypes = encoderOptions[category] || [];

    if (Array.isArray(field.options) && field.options.length > 0) {
      return field.options
        .map(name => allTypes.find(t => t.name === name))
        .filter(Boolean);
    }
    return allTypes;
  };

  const initNewEncoder = (typeKey, fieldName) => {
    const compatTypes = getCompatibleEncoderTypes(typeKey, fieldName);
    if (compatTypes.length === 0) return;

    const first = compatTypes[0];
    if (!baseCreate.formData[typeKey]) baseCreate.formData[typeKey] = {};
    baseCreate.formData[typeKey][`_new_${fieldName}`] = {
      element: first.element,
      options: first.fields?.options?.default || '',
      profile: first.fields?.profile?.default || '',
    };
  };

  const onEncoderSelect = (typeKey, fieldName, value) => {
    const resolved = typeof value === 'object' ? value.value : value;
    baseCreate.formData[typeKey][fieldName] = resolved;
    if (resolved === '__new__' && !baseCreate.formData[typeKey][`_new_${fieldName}`]) {
      initNewEncoder(typeKey, fieldName);
    }
  };

  const onNewEncoderElementChange = (typeKey, fieldName, value) => {
    const element = typeof value === 'object' ? value.element : value;
    const category = fieldName === 'video_encoder' ? 'video_encoder' : 'audio_encoder';
    const encType = encoderOptions[category].find(t => t.element === element);
    if (!encType) return;

    const key = `_new_${fieldName}`;
    baseCreate.formData[typeKey][key] = {
      element,
      options: encType.fields?.options?.default || '',
      profile: encType.fields?.profile?.default || '',
    };
  };

  const createEncoderInline = async (typeKey, fieldName) => {
    const newData = baseCreate.formData[typeKey]?.[`_new_${fieldName}`];
    if (!newData) return null;

    const codec = fieldName === 'video_encoder' ? codecFromElement(newData.element) : '';

    const body = {
      type: fieldName === 'video_encoder' ? 'video' : 'audio',
      element: newData.element,
      options: newData.options || '',
      codec,
      src: baseCreate.formData[typeKey]?.src || null,
      width: baseCreate.formData[typeKey]?.width || null,
      height: baseCreate.formData[typeKey]?.height || null,
      framerate: baseCreate.formData[typeKey]?.framerate || null,
    };

    if (fieldName === 'video_encoder' && newData.profile) {
      body.profile = newData.profile;
    }

    try {
      const result = await $fetch('/api/encoders', { method: 'PUT', body });
      return result.uid;
    } catch (error) {
      notify.error('Failed to create encoder');
      return null;
    }
  };

  const submitCreate = async (itemType) => {
    const body = { ...baseCreate.formData[itemType] };

    for (const fieldName of ['video_encoder', 'audio_encoder']) {
      if (body[fieldName] === '__new__') {
        const uid = await createEncoderInline(itemType, fieldName);
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
      return await $fetch(path, { method: 'PUT', body });
    } catch (error) {
      notify.error('Failed to create output');
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
    submitCreate,
    addOutput,
    encoderOptions,
    isEncoderField,
    hasEncoderFields,
    getEncoderOptions,
    getCompatibleEncoders,
    getEncoderSelectOptions,
    getCompatibleEncoderTypes,
    onEncoderSelect,
    onNewEncoderElementChange,
    // Mux
    toggleMuxFields,
    isMuxFieldsVisible,
    updateMuxField,
    getSelectedMux,
    getMuxValue,
    setMuxValue,
  };
};
