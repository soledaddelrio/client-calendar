import Header from '../components/Header'
import BottomNav from '../components/BottomNav'

export default function Home() {
  return (
    <div className="app-shell">
      <Header />

      <main className="home-page">
        <section className="card">
          <p className="eyebrow">Today</p>
          <h2>With Mom</h2>
          <p>Wednesday</p>
        </section>

        <section className="card">
          <p className="eyebrow">Next exchange</p>
          <h2>Friday at 6:00 PM</h2>
          <p>Pickup begins Parent B weekend.</p>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}