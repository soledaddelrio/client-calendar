export type ScheduleBlock = {
  client: 'A' | 'B'
  start: string
  end: string
  type: 'possession'
}

export const sampleSchedule: ScheduleBlock[] = [
  {
    client: 'A',
    start: '2026-07-09',
    end: '2026-07-10',
    type: 'possession',
  },
  {
    client: 'B',
    start: '2026-07-10',
    end: '2026-07-13',
    type: 'possession',
  },
]