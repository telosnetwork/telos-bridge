export function formatRemainingTime(seconds?: number): string {
  if (seconds === undefined) return '--';
  if (seconds <= 4) return 'Finishing...';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ss = String(s).padStart(2, '0');
  if (m > 0) {
    return m + 'm ' + ss + 's';
  }
  return ss + 's';
}
