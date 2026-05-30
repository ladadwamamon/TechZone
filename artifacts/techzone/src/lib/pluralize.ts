export function pluralize(n: number, singular: string, plural: string): string {
  if (n === 0) return `0 ${plural}`;
  if (n === 1) return `1 ${singular}`;
  if (n === 2) return `${singular}ان`;
  if (n >= 3 && n <= 10) return `${n} ${plural}`;
  return `${n} ${singular}`;
}
