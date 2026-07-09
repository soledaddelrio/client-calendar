export type Client = 'A' | 'B'

export type ScheduleType =
  | 'possession'
  | 'exchange'
  | 'holiday'
  | 'exception'

export type ScheduleBlock = {
  client: Client
  start: string
  end: string
  type: ScheduleType
}