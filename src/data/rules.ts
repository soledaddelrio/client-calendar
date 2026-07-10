import type { ScheduleRule } from '../types/rules'

export const rules: ScheduleRule[] = [
  {
    type: 'everyOtherWeekend',
    frequency: 'biweekly',
    weekday: 5,
    startTime: '18:00',
    endTime: '18:00',
    client: 'B',
    startDate: '2026-07-10',
    occurrences: 12,
  },
]