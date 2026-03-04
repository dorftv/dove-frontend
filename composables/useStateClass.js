export function useStateClass() {
  const stateClass = (state) => {
    if (!state) return 'state-null';
    return `state-${state.toLowerCase()}`;
  };

  const stateIcon = (state) => {
    const icons = {
      PLAYING: 'ph:play-circle',
      PAUSED: 'ph:pause-circle',
      NULL: 'ph:stop-circle',
      READY: 'ph:circle-dashed',
      EOS: 'ph:stop',
      ERROR: 'ph:warning-circle',
      BUFFERING: 'ph:spinner',
    };
    return icons[state] || 'ph:circle';
  };

  const stateBadgeClass = (state) => {
    const classes = {
      PLAYING: 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-400',
      PAUSED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-400',
      NULL: 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
      READY: 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
      EOS: 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-400',
      ERROR: 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-400',
      BUFFERING: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-400',
    };
    return classes[state] || 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
  };

  const stateDotClass = (state) => {
    const classes = {
      PLAYING: 'bg-green-500',
      PAUSED: 'bg-orange-400',
      NULL: 'bg-gray-400 dark:bg-gray-500',
      READY: 'bg-gray-400 dark:bg-gray-500',
      EOS: 'bg-red-500',
      ERROR: 'bg-red-500',
      BUFFERING: 'bg-orange-400',
    };
    return classes[state] || 'bg-gray-400';
  };

  const volumeIcon = (volume, mute = false) => {
    if (mute || volume === 0) return 'ph:speaker-x';
    if (volume < 50) return 'ph:speaker-low';
    return 'ph:speaker-high';
  };

  return { stateClass, stateIcon, stateBadgeClass, stateDotClass, volumeIcon };
}
