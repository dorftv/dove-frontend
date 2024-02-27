export default function useTimeFormatter(seconds) {
  if (seconds == null) {
    return '';
  }
  const timeFormatted = computed(() => {
      const hrs = Math.floor(seconds.value / 3600)
      const mins = Math.floor((seconds.value % 3600) / 60)
      const secs = seconds.value % 60

      const pad = (num) => (num < 10 ? '0' : '') + num
      let formattedTime = `${pad(secs)}`
      
      if (mins > 0 || hrs > 0) formattedTime = `${pad(mins)}:${formattedTime}`
      if (hrs > 0) formattedTime = `${pad(hrs)}:${formattedTime}`

      return formattedTime
  })

  return timeFormatted
}