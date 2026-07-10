export type RuleType =
  | 'everyOtherWeekend'
  | 'everyWeek'

export type ScheduleRule = {
  type: RuleType
  frequency: 'weekly' | 'biweekly'
  weekday: number
  startTime: string
  endTime: string
  client: 'A' | 'B'
  startDate: string
occurrences: number
}