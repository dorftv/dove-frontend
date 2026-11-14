// A moment in unix seconds as "14:05", or with its date when it is not today: "13.11. 14:05"
export function sinceText(seconds) {
  const at = new Date(seconds * 1000);
  const time = at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  if (at.toDateString() === new Date().toDateString()) return time;
  return `${at.toLocaleDateString([], { day: '2-digit', month: '2-digit' })} ${time}`;
}
