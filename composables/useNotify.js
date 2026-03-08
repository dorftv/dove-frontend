export function useNotify() {
  const toast = useToast();

  return {
    success: (msg) => toast.add({ title: msg, color: 'success', duration: 3000 }),
    error: (msg) => toast.add({ title: msg, color: 'error', duration: 3000 }),
    warn: (msg) => toast.add({ title: msg, color: 'warning', duration: 3000 }),
  };
}
