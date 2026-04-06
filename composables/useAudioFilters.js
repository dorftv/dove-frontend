import { useFilters } from './useFilters';

const AUDIO_FILTER_TYPES = {
  // --- Dynamics ---
  compressor: {
    label: 'Compressor',
    category: 'dynamics',
    params: {
      threshold: { min: 0, max: 1, step: 0.01, default: 1.0 },
      ratio: { min: 1, max: 20, step: 0.1, default: 1.0 },
      characteristics: { type: 'select', options: ['soft-knee', 'hard-knee'], default: 'soft-knee' },
    },
  },
  expander: {
    label: 'Expander/Gate',
    category: 'dynamics',
    params: {
      threshold: { min: 0, max: 1, step: 0.01, default: 1.0 },
      ratio: { min: 1, max: 20, step: 0.1, default: 1.0 },
    },
  },
  limiter: {
    label: 'Limiter',
    category: 'dynamics',
    params: {},
  },
  amplify: {
    label: 'Gain',
    category: 'dynamics',
    params: {
      amplification: { min: 0, max: 4, step: 0.01, default: 1.0, unit: 'x' },
    },
  },
  // --- EQ / Filter ---
  highpass: {
    label: 'High Pass',
    category: 'eq',
    params: {
      cutoff: { min: 20, max: 2000, default: 80, unit: 'Hz' },
      poles: { min: 2, max: 8, step: 2, default: 4 },
    },
  },
  lowpass: {
    label: 'Low Pass',
    category: 'eq',
    params: {
      cutoff: { min: 200, max: 20000, default: 8000, unit: 'Hz' },
      poles: { min: 2, max: 8, step: 2, default: 4 },
    },
  },
  eq3: {
    label: '3-Band EQ',
    category: 'eq',
    params: {
      band0: { min: -24, max: 12, default: 0, unit: 'dB', label: 'Low' },
      band1: { min: -24, max: 12, default: 0, unit: 'dB', label: 'Mid' },
      band2: { min: -24, max: 12, default: 0, unit: 'dB', label: 'High' },
    },
  },
  eq10: {
    label: '10-Band EQ',
    category: 'eq',
    params: {
      band0: { min: -24, max: 12, default: 0 },
      band1: { min: -24, max: 12, default: 0 },
      band2: { min: -24, max: 12, default: 0 },
      band3: { min: -24, max: 12, default: 0 },
      band4: { min: -24, max: 12, default: 0 },
      band5: { min: -24, max: 12, default: 0 },
      band6: { min: -24, max: 12, default: 0 },
      band7: { min: -24, max: 12, default: 0 },
      band8: { min: -24, max: 12, default: 0 },
      band9: { min: -24, max: 12, default: 0 },
    },
  },
  // --- Spatial ---
  pan: {
    label: 'Pan',
    category: 'spatial',
    params: {
      panorama: { min: -1, max: 1, step: 0.01, default: 0.0, label: 'L/R' },
    },
  },
  invert: {
    label: 'Phase Invert',
    category: 'spatial',
    params: {
      degree: { min: 0, max: 1, step: 0.01, default: 1.0 },
    },
  },
  // --- Effects ---
  echo: {
    label: 'Echo/Delay',
    category: 'effects',
    params: {
      delay: { min: 1, max: 1000, step: 1, default: 250, unit: 'ms' },
      intensity: { min: 0, max: 1, step: 0.01, default: 0.5 },
      feedback: { min: 0, max: 0.9, step: 0.01, default: 0.0 },
    },
  },
};

const AUDIO_FILTER_CATEGORIES = Object.freeze({
  dynamics: { label: 'Dynamics', icon: 'ph:chart-bar' },
  eq: { label: 'EQ / Filter', icon: 'ph:equalizer' },
  spatial: { label: 'Spatial', icon: 'ph:arrows-out-line-horizontal' },
  effects: { label: 'Effects', icon: 'ph:sparkle' },
});

const EQ10_BANDS = Object.freeze(['31', '62', '125', '250', '500', '1k', '2k', '4k', '8k', '16k']);

/**
 * Audio filters composable supporting three modes:
 *   - Input mode:  useAudioFilters({ input: () => inputObj })
 *   - Mixer mode:  useAudioFilters({ mixer: () => mixerObj })
 *   - Slot mode:   useAudioFilters({ mixer: () => mixerObj, slotIndex: () => index })
 *
 * Legacy call signature preserved: useAudioFilters(() => inputObj)
 */
export function useAudioFilters(opts) {
  return {
    ...useFilters('audio_filters', AUDIO_FILTER_TYPES, AUDIO_FILTER_CATEGORIES, opts),
    EQ10_BANDS,
  };
}
