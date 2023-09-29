export function formatAddress(address: string, maxLength = 10) {
  const size = Math.round(maxLength / 2);
  if (address.length <= size * 2) return address;
  const start = address.slice(0, size);
  const end = address.substring(address.length - size);
  return start + '...' + end;
}
