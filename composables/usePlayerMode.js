import { useStorage } from '@vueuse/core';

const MODES = ['auto', 'webrtc', 'hls'];

let mode = null;

export function usePlayerMode() {
  if (!mode) {
    mode = useStorage('preview-mode', 'auto');
  }

  if (!MODES.includes(mode.value)) {
    mode.value = 'auto';
  }

  const cycle = () => {
    const idx = MODES.indexOf(mode.value);
    mode.value = MODES[(idx + 1) % MODES.length];
  };

  return { previewMode: mode, cycle, MODES };
}
