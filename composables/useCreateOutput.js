export const useCreateOutput = () => {
  const baseCreate = useCreateEntity('outputs');
  const { addOutput } = useDoveConfig();

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
  };
};
