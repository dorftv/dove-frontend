export function useTimeFormatter(seconds) {
  return computed(() => {
    const val = seconds.value;
    if (val == null || val === 0) return '00:00';

    const hrs = Math.floor(val / 3600);
    const mins = Math.floor((val % 3600) / 60);
    const secs = val % 60;

    const pad = (num) => (num < 10 ? '0' : '') + num;
    let formattedTime = `${pad(secs)}`;

    if (mins > 0 || hrs > 0) {
      formattedTime = `${pad(mins)}:${formattedTime}`;
    } else {
      formattedTime = `00:${formattedTime}`;
    }

    if (hrs > 0) {
      formattedTime = `${pad(hrs)}:${formattedTime}`;
    }

    return formattedTime;
  });
}