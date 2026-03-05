const STORAGE_KEY = 'preview-mode';
const MODES = ['auto', 'webrtc', 'hls'];

const mode = ref(null);

export function usePreviewMode() {
  // Initialize once from localStorage
  if (mode.value === null) {
    const stored = localStorage.getItem(STORAGE_KEY);
    mode.value = MODES.includes(stored) ? stored : 'auto';
  }

  watch(mode, (v) => localStorage.setItem(STORAGE_KEY, v));

  const cycle = () => {
    const idx = MODES.indexOf(mode.value);
    mode.value = MODES[(idx + 1) % MODES.length];
  };

  return { previewMode: mode, cycle, MODES };
}
