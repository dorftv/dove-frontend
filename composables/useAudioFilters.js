import { useFilters } from './useFilters';

const AUDIO_FILTER_TYPES = {
  // --- Dynamics ---
  compressor: {
    label: 'Compressor',
    category: 'dynamics',
    params: {
      attack_threshold: { min: 0.001, max: 1, step: 0.001, default: 0.12589, label: 'Threshold' },
      attack_time: { min: 1, max: 500, step: 1, default: 20, unit: 'ms', label: 'Attack' },
      release_time: { min: 10, max: 1000, step: 5, default: 150, unit: 'ms', label: 'Release' },
      ratio: { min: 1, max: 20, step: 0.1, default: 2.5 },
      makeup_gain: { min: 0, max: 4, step: 0.01, default: 1.2589, label: 'Makeup Gain' },
    },
  },
  expander: {
    label: 'Expander',
    category: 'dynamics',
    params: {
      attack_threshold: { min: 0.001, max: 1, step: 0.001, default: 0.01, label: 'Threshold' },
      attack_time: { min: 1, max: 200, step: 1, default: 5, unit: 'ms', label: 'Attack' },
      release_time: { min: 10, max: 1000, step: 5, default: 100, unit: 'ms', label: 'Release' },
      hold_time: { min: 0, max: 500, step: 1, default: 0, unit: 'ms', label: 'Hold' },
      ratio: { min: 1, max: 20, step: 0.1, default: 2.0 },
      makeup_gain: { min: 0, max: 4, step: 0.01, default: 1.0, label: 'Makeup Gain' },
    },
  },
  gate: {
    label: 'Gate',
    category: 'dynamics',
    params: {
      curve_threshold: { min: 0.001, max: 1, step: 0.001, default: 0.01, label: 'Threshold' },
      attack: { min: 1, max: 200, step: 1, default: 10, unit: 'ms', label: 'Attack' },
      release: { min: 10, max: 1000, step: 5, default: 100, unit: 'ms', label: 'Release' },
      hold_time: { min: 0, max: 500, step: 1, default: 50, unit: 'ms', label: 'Hold' },
      reduction: { min: 0.001, max: 1, step: 0.01, default: 0.001, label: 'Reduction' },
      makeup_gain: { min: 0, max: 4, step: 0.01, default: 1.0, label: 'Makeup Gain' },
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
  denoise: {
    label: 'Denoise',
    category: 'effects',
    params: {
      vad_threshold: { min: 0, max: 1, step: 0.01, default: 0.0, label: 'VAD' },
    },
  },
};

// Encoder-only filters. audioloudnorm has a 3s lookahead — unsuitable for live
// input/mixer/slot chains but perfect for encoder output chains where matching
// video delay is auto-applied by the backend.
const ENCODER_FILTER_TYPES = Object.freeze({
  loudnorm: {
    label: 'Loudness Norm',
    category: 'mastering',
    params: {
      target: { min: -40, max: -5, step: 0.5, default: -24, unit: 'LUFS' },
      range: { min: 1, max: 50, step: 0.5, default: 7, unit: 'LU' },
      peak: { min: -9, max: 0, step: 0.1, default: -2, unit: 'dBTP' },
      offset: { min: -99, max: 99, step: 0.1, default: 0, unit: 'dB' },
    },
  },
});

const AUDIO_FILTER_CATEGORIES = Object.freeze({
  dynamics: { label: 'Dynamics', icon: 'ph:chart-bar' },
  eq: { label: 'EQ / Filter', icon: 'ph:equalizer' },
  spatial: { label: 'Spatial', icon: 'ph:arrows-out-line-horizontal' },
  effects: { label: 'Effects', icon: 'ph:sparkle' },
});

const ENCODER_FILTER_CATEGORIES = Object.freeze({
  ...AUDIO_FILTER_CATEGORIES,
  mastering: { label: 'Mastering', icon: 'ph:broadcast' },
});

/**
 * Audio filters composable supporting four modes:
 *   - Input mode:    useAudioFilters({ input: () => inputObj })
 *   - Mixer mode:    useAudioFilters({ mixer: () => mixerObj })
 *   - Slot mode:     useAudioFilters({ mixer: () => mixerObj, slotIndex: () => index })
 *   - Encoder mode:  useAudioFilters({ encoder: () => encoderObj })
 *     (encoder mode adds the 'loudnorm' filter which is not available on other entities)
 *
 * Legacy call signature preserved: useAudioFilters(() => inputObj)
 */
export function useAudioFilters(opts) {
  const isEncoder = opts && typeof opts === 'object' && !!opts.encoder;
  const types = isEncoder
    ? { ...AUDIO_FILTER_TYPES, ...ENCODER_FILTER_TYPES }
    : AUDIO_FILTER_TYPES;
  const categories = isEncoder ? ENCODER_FILTER_CATEGORIES : AUDIO_FILTER_CATEGORIES;
  return {
    ...useFilters('audio_filters', types, categories, opts),
  };
}
