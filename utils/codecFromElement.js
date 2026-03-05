export function codecFromElement(element) {
  if (element.includes('264')) return 'h264';
  if (element.includes('265')) return 'h265';
  return '';
}
