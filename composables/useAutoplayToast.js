/**
 * Shared autoplay-blocked toast handler.
 * Shows a "click to enable audio" toast once, then unmutes program on first click.
 */
export function useAutoplayToast() {
  const toast = useToast();
  const { programMixer } = useEntities();
  const { setMutedState } = useMutedState();

  const shown = useState('autoplay-toast-shown', () => false);

  const handleAutoplayBlocked = (uid) => {
    setMutedState(uid, true);

    if (shown.value) return;
    shown.value = true;

    const pmUid = programMixer.value?.uid;
    const t = toast.add({
      title: 'Audio blocked by browser',
      description: 'Click anywhere to enable audio',
      color: 'warning',
    });
    document.addEventListener('click', () => {
      if (pmUid) setMutedState(pmUid, false);
      document.querySelectorAll('video, media-player').forEach(v => {
        if (v.paused) v.play().catch(() => {});
      });
      toast.remove(t.id);
    }, { once: true });
  };

  return { handleAutoplayBlocked };
}
