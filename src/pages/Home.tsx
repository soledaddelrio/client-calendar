import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import Calendar from '../components/Calendar'
import { useState } from 'react'
import DayPanel from '../sidebar/DayPanel'
import { buildSchedule } from '../data/buildSchedule'
import { findScheduleForDate } from '../utils/findScheduleForDate'


export default function Home() {
    const [selectedDate, setSelectedDate] = useState<string | null>(null)

    const schedule = buildSchedule()

const selectedBlock =
  selectedDate
    ? findScheduleForDate(selectedDate, schedule)
    : undefined

  return (
    <div className="app-shell">
      <Header />

      <main className="home-page">
        <section className="card">
          <p className="eyebrow">Today</p>
          <h2>Assigned to Client A</h2>
          <p>Wednesday</p>
        </section>

        <section className="card">
          <p className="eyebrow">Next exchange</p>
          <h2>Friday at 6:00 PM</h2>
          <p>Transfer to Client B schedule.</p>
        </section>
      </main>

<section className="card">
<Calendar
  selectedDate={selectedDate}
  onDateClick={setSelectedDate}
/>
</section>

<DayPanel
  selectedDate={selectedDate}
  selectedBlock={selectedBlock}
  onClose={() => setSelectedDate(null)}
  onSelectDate={setSelectedDate}
/>
      <BottomNav />
    </div>
  )
}
