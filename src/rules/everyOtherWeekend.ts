import type { ScheduleBlock } from '../types/schedule'
import { addDays, formatDate } from '../utils/dateUtils'

export function everyOtherWeekend(
  firstFriday: Date,
  occurrences: number,
  client: 'A' | 'B'
): ScheduleBlock[] {
  const blocks: ScheduleBlock[] = []

  for (let i = 0; i < occurrences; i++) {
    const friday = addDays(firstFriday, i * 14)
    const monday = addDays(friday, 3)

    blocks.push({
      client,
      start: formatDate(friday),
      end: formatDate(monday),
      type: 'possession',
    })
  }

  return blocks
}