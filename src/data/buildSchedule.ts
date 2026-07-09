import type { ScheduleBlock } from '../types/schedule'
import { everyOtherWeekend } from '../rules'

export function buildSchedule(): ScheduleBlock[] {
  const firstFriday = new Date('2026-07-10')

  return [
    ...everyOtherWeekend(firstFriday, 12, 'B'),
  ]
}