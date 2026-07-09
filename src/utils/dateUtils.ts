export function toDate(date: string): Date {
  return new Date(`${date}T00:00:00`)
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}