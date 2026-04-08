/**
 * Encoder entity selection and inline creation for output forms.
 *
 * Handles: compatible encoder filtering, select options, inline new-encoder
 * sub-form, and API creation. Used by useCreateOutput.
 *
 * @param {Ref} encoderOptions - Reactive encoder config (audio_encoder, video_encoder arrays)
 * @param {Object} formData - Reactive form data keyed by output type
 * @param {Ref} types - Available output types
 */
export function useInlineEncoder(encoderOptions, formData, types) {
  const { encoders } = useEntities();
  const notify = useNotify();

  const getCompatibleEncoders = (typeKey, fieldName) => {
    const type = types.value.find(t => t.key === typeKey);
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

    const formSrc = formData[typeKey]?.src;
    const formWidth = formData[typeKey]?.width;
    const formHeight = formData[typeKey]?.height;

    return encoders.value.filter(enc => {
      if (enc.type !== encoderType) return false;
      if (allowedElements.size > 0 && !allowedElements.has(enc.element)) return false;
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
    const type = types.value.find(t => t.key === typeKey);
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
    if (!formData[typeKey]) formData[typeKey] = {};
    formData[typeKey][`_new_${fieldName}`] = {
      element: first.element,
      options: first.fields?.options?.default || '',
      profile: first.fields?.profile?.default || '',
    };
  };

  const onEncoderSelect = (typeKey, fieldName, value) => {
    const resolved = typeof value === 'object' ? value.value : value;
    formData[typeKey][fieldName] = resolved;
    if (resolved === '__new__' && !formData[typeKey][`_new_${fieldName}`]) {
      initNewEncoder(typeKey, fieldName);
    }
  };

  const onNewEncoderElementChange = (typeKey, fieldName, value) => {
    const element = typeof value === 'object' ? value.element : value;
    const category = fieldName === 'video_encoder' ? 'video_encoder' : 'audio_encoder';
    const encType = encoderOptions[category].find(t => t.element === element);
    if (!encType) return;

    formData[typeKey][`_new_${fieldName}`] = {
      element,
      options: encType.fields?.options?.default || '',
      profile: encType.fields?.profile?.default || '',
    };
  };

  const createEncoderInline = async (typeKey, fieldName) => {
    const newData = formData[typeKey]?.[`_new_${fieldName}`];
    if (!newData) return null;

    const codec = fieldName === 'video_encoder' ? codecFromElement(newData.element) : '';

    const body = {
      type: fieldName === 'video_encoder' ? 'video' : 'audio',
      element: newData.element,
      options: newData.options || '',
      codec,
      src: formData[typeKey]?.src || null,
      width: formData[typeKey]?.width || null,
      height: formData[typeKey]?.height || null,
      framerate: formData[typeKey]?.framerate || null,
    };

    if (fieldName === 'video_encoder' && newData.profile) {
      body.profile = newData.profile;
    }

    try {
      const result = await $fetch('/api/encoders', { method: 'PUT', body });
      return result.uid;
    } catch (error) {
      const detail = error?.data?.detail;
      notify.error(typeof detail === 'string' ? detail : 'Failed to create encoder');
      return null;
    }
  };

  return {
    getCompatibleEncoders,
    getEncoderSelectOptions,
    getCompatibleEncoderTypes,
    onEncoderSelect,
    onNewEncoderElementChange,
    createEncoderInline,
  };
}
