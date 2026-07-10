import type { ScheduleRule } from '../types/rules'
import type { ScheduleBlock } from '../types/schedule'
import { everyOtherWeekend } from './everyOtherWeekend'
import { everyWeek } from './everyWeek'

export function buildRule(rule: ScheduleRule): ScheduleBlock[] {
  switch (rule.type) {
    case 'everyOtherWeekend':
      return everyOtherWeekend(
        new Date(rule.startDate),
        rule.occurrences,
        rule.client
      )

    case 'everyWeek':
      return everyWeek(
        new Date(rule.startDate),
        rule.occurrences,
        1,
        rule.client
      )

    default:
      return []
  }
}