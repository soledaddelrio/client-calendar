import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { buildSchedule } from '../data/buildSchedule'
import { COLORS } from '../constants/colors'
import { useEffect, useRef } from 'react'


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
  selectedDate?: string | null
  onDateClick?: (date: string) => void
}

export default function Calendar({
  selectedDate,
  onDateClick,
}: CalendarProps) {

  const calendarRef = useRef<FullCalendar>(null)

useEffect(() => {
  if (!selectedDate) return

  const api = calendarRef.current?.getApi()
  api?.gotoDate(selectedDate)
}, [selectedDate])

  return (
    <FullCalendar
      ref={calendarRef}
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      height="auto"
      events={sampleEvents}
      dateClick={(info) => onDateClick?.(info.dateStr)}
      dayCellClassNames={(arg) => {
  if (!selectedDate) return [];

  const cellDate = [
    arg.date.getFullYear(),
    String(arg.date.getMonth() + 1).padStart(2, "0"),
    String(arg.date.getDate()).padStart(2, "0"),
  ].join("-");

  return cellDate === selectedDate ? ["selected-day"] : [];
}}

    />
  )
}