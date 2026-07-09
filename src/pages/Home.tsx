import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import Calendar from '../components/Calendar'


export default function Home() {
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
  <Calendar />
</section>

      <BottomNav />
    </div>
  )
}
