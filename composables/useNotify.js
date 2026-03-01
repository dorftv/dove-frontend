export default function useNotify() {
  const toast = useToast();

  return {
    success: (msg) => toast.add({ severity: 'success', summary: msg, life: 3000 }),
    error: (msg) => toast.add({ severity: 'error', summary: msg, life: 3000 }),
    warn: (msg) => toast.add({ severity: 'warn', summary: msg, life: 3000 }),
  };
}
