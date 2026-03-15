export function useCreateDialog() {
  const openDialog = useState('create-dialog-open', () => null);

  const toggle = (type) => {
    openDialog.value = openDialog.value === type ? null : type;
  };

  const close = () => {
    openDialog.value = null;
  };

  return { openDialog, toggle, close };
}
