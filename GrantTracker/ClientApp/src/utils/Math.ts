

export function mod(n: number, m: number): number {
  return ((n % m) + m) % m
}

export function minutesToTimeSpan(minutes: number): string {
  return `${Math.floor(minutes / 60)} hours, ${minutes % 60} minutes`
}