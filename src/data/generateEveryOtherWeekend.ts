import type { ScheduleBlock } from '../types/schedule'
import { addDays, formatDate } from '../utils/dateUtils'

export function generateEveryOtherWeekend(
  firstFriday: Date,
  numberOfWeekends: number,
  client: 'A' | 'B'
): ScheduleBlock[] {
  const weekends: ScheduleBlock[] = []

  for (let i = 0; i < numberOfWeekends; i++) {
    const friday = addDays(firstFriday, i * 14)
    const monday = addDays(friday, 3)

    weekends.push({
      client,
      start: formatDate(friday),
      end: formatDate(monday),
      type: 'possession',
    })
  }

  return weekends
}