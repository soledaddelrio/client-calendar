import type { ScheduleBlock } from '../types/schedule'

export function findScheduleForDate(
  date: string,
  schedule: ScheduleBlock[]
): ScheduleBlock | undefined {
  return schedule.find((block) => {
    return date >= block.start && date < block.end
  })
}