import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { buildSchedule } from '../data/buildSchedule'
import { COLORS } from '../constants/colors'


const schedule = buildSchedule()

const sampleEvents = schedule.map((block) => ({
  start: block.start,
  end: block.end,
  display: 'background',
  backgroundColor:
  block.client === 'A'
    ? COLORS.clientA
    : COLORS.clientB,
}))

type CalendarProps = {
  onDateClick?: (date: string) => void
}

export default function Calendar({
  onDateClick,
}: CalendarProps) {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      height="auto"
      events={sampleEvents}
      dateClick={(info) => onDateClick?.(info.dateStr)}
    />
  )
}