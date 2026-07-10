import type { ScheduleBlock } from '../types/schedule'
import { rules } from './rules'
import { buildRule } from '../rules/factory'

export function buildSchedule(): ScheduleBlock[] {
  return rules.flatMap(buildRule)
}