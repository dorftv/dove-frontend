export default function usePreviewEnabled() {
  const { inputPreview } = useUserState();
  const enabledInputs = ref({});

  const isInputEnabled = (uid) => {
    return !!enabledInputs.value[uid];
  };

  const toggleInputEnabled = (uid) => {
    enabledInputs.value[uid] = !enabledInputs.value[uid];
    return enabledInputs.value[uid];
  };

  const shouldShowPreview = (uid) => {
    return inputPreview.value || isInputEnabled(uid);
  };

  return {
    inputPreview,
    isInputEnabled,
    toggleInputEnabled,
    shouldShowPreview,
  };
}
