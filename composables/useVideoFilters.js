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
  chromakey: {
    label: 'Chroma Key', category: 'overlay',
    params: {},
  },
pixelate: {
    label: 'Pixelate', category: 'effects',
    params: {
      block_width: { min: 0.001, max: 0.5, step: 0.001, default: 0.022, label: 'Width' },
      block_height: { min: 0.001, max: 0.5, step: 0.001, default: 0.029, label: 'Height' },
    },
  },
  cartoon: {
    label: 'Cartoon', category: 'effects',
    params: {
      triplevel: { min: 0, max: 1, step: 0.01, default: 1.0, label: 'Tri Level' },
      diffspace: { min: 0, max: 0.1, step: 0.001, default: 0.004, label: 'Diff Space' },
    },
  },
  glow: {
    label: 'Glow', category: 'effects',
    params: {
      blur: { min: 0, max: 1, step: 0.01, default: 0.5 },
    },
  },
  vignette: {
    label: 'Vignette', category: 'effects',
    params: {
      aspect: { min: 0, max: 1, step: 0.01, default: 0.5 },
      clearcenter: { min: 0, max: 1, step: 0.01, default: 0.0, label: 'Clear Center' },
      soft: { min: 0, max: 1, step: 0.01, default: 0.6 },
    },
  },
  grain: {
    label: 'Film Grain', category: 'effects',
    params: {
      grain_amount: { min: 0, max: 1, step: 0.01, default: 0.1, label: 'Amount' },
      blur_amount: { min: 0, max: 1, step: 0.01, default: 0.5, label: 'Blur' },
      dust_amount: { min: 0, max: 1, step: 0.01, default: 0.0, label: 'Dust' },
      flicker: { min: 0, max: 1, step: 0.01, default: 0.0 },
    },
  },
  glitch: {
    label: 'Glitch', category: 'effects',
    params: {
      glitch_frequency: { min: 0, max: 1, step: 0.01, default: 0.5, label: 'Frequency' },
      block_height: { min: 0, max: 1, step: 0.01, default: 0.5, label: 'Block Height' },
      shift_intensity: { min: 0, max: 1, step: 0.01, default: 0.5, label: 'Shift' },
      color_glitching_intensity: { min: 0, max: 1, step: 0.01, default: 0.5, label: 'Color Glitch' },
    },
  },
  scanlines: {
    label: 'Scanlines', category: 'effects',
    params: {},
  },
  sobel: {
    label: 'Sobel Edge', category: 'effects',
    params: {},
  },
  colorhalftone: {
    label: 'Color Halftone', category: 'color',
    params: {
      dot_radius: { min: 0, max: 1, step: 0.01, default: 0.4, label: 'Dot Radius' },
      cyan_angle: { min: 0, max: 1, step: 0.01, default: 0.3, label: 'Cyan Angle' },
      magenta_angle: { min: 0, max: 1, step: 0.01, default: 0.45, label: 'Magenta Angle' },
      yellow_angle: { min: 0, max: 1, step: 0.01, default: 0.25, label: 'Yellow Angle' },
    },
  },
};

const VIDEO_FILTER_CATEGORIES = Object.freeze({
  color: { label: 'Color', icon: 'ph:palette' },
  transform: { label: 'Transform', icon: 'ph:arrows-out-cardinal' },
  effects: { label: 'Effects', icon: 'ph:sparkle' },
  overlay: { label: 'Overlay', icon: 'ph:eraser' },
});

/**
 * Video filters composable — same API as useAudioFilters,
 * reads/writes video_filters field instead of audio_filters.
 */
export function useVideoFilters(opts) {
  return useFilters('video_filters', VIDEO_FILTER_TYPES, VIDEO_FILTER_CATEGORIES, opts);
}
