import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { sampleSchedule } from '../data/sampleSchedule'

const sampleEvents = sampleSchedule.map((block) => ({
  start: block.start,
  end: block.end,
  display: 'background',
  backgroundColor:
    block.client === 'A'
      ? '#77d4f9'
      : '#F8D88A',
}))

export default function Calendar() {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      height="auto"
      events={sampleEvents}
    />
  )
}