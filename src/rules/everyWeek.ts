import type { ScheduleBlock } from '../types/schedule'
import { addDays, formatDate } from '../utils/dateUtils'

export function everyWeek(
  firstOccurrence: Date,
  occurrences: number,
  durationDays: number,
  client: 'A' | 'B'
): ScheduleBlock[] {
  const blocks: ScheduleBlock[] = []

  for (let i = 0; i < occurrences; i++) {
    const start = addDays(firstOccurrence, i * 7)
    const end = addDays(start, durationDays)

    blocks.push({
      client,
      start: formatDate(start),
      end: formatDate(end),
      type: 'possession',
    })
  }

  return blocks
}