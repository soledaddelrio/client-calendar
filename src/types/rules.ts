export type ScheduleRule = {
  frequency: 'weekly' | 'biweekly'
  weekday: number
  startTime: string
  endTime: string
  client: 'A' | 'B'
}