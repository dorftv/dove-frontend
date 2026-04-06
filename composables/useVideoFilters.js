import { useFilters } from './useFilters';

const VIDEO_FILTER_TYPES = {
  balance: {
    label: 'Color Balance', category: 'color',
    params: {
      brightness: { min: -1, max: 1, step: 0.01, default: 0 },
      contrast: { min: 0, max: 2, step: 0.01, default: 1 },
      saturation: { min: 0, max: 2, step: 0.01, default: 1 },
      hue: { min: -1, max: 1, step: 0.01, default: 0 },
    },
  },
  flip: {
    label: 'Flip / Rotate', category: 'transform',
    params: {
      direction: { type: 'select', options: [
        { label: 'None', value: 0 },
        { label: 'Clockwise 90', value: 1 },
        { label: 'Rotate 180', value: 2 },
        { label: 'Counter-Clockwise 90', value: 3 },
        { label: 'Horizontal Flip', value: 4 },
        { label: 'Vertical Flip', value: 5 },
      ], default: 0 },
    },
  },
  crop: {
    label: 'Crop', category: 'transform',
    params: {
      top: { min: 0, max: 500, step: 1, default: 0, unit: 'px' },
      bottom: { min: 0, max: 500, step: 1, default: 0, unit: 'px' },
      left: { min: 0, max: 500, step: 1, default: 0, unit: 'px' },
      right: { min: 0, max: 500, step: 1, default: 0, unit: 'px' },
    },
  },
  coloreffects: {
    label: 'Color Effect', category: 'color',
    params: {
      preset: { type: 'select', options: [
        { label: 'None', value: 0 },
        { label: 'Heat', value: 1 },
        { label: 'Sepia', value: 2 },
        { label: 'Xray', value: 3 },
        { label: 'X-Pro', value: 4 },
        { label: 'Yellowblue', value: 5 },
      ], default: 0 },
    },
  },
  blur: {
    label: 'Blur', category: 'effects',
    params: { sigma: { min: 0.1, max: 10, step: 0.1, default: 1.2 } },
  },
};

const VIDEO_FILTER_CATEGORIES = Object.freeze({
  color: { label: 'Color', icon: 'ph:palette' },
  transform: { label: 'Transform', icon: 'ph:arrows-out-cardinal' },
  effects: { label: 'Effects', icon: 'ph:sparkle' },
});

/**
 * Video filters composable — same API as useAudioFilters,
 * reads/writes video_filters field instead of audio_filters.
 */
export function useVideoFilters(opts) {
  return useFilters('video_filters', VIDEO_FILTER_TYPES, VIDEO_FILTER_CATEGORIES, opts);
}
