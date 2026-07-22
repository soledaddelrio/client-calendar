import { useEffect, useState } from "react"
import type { ScheduleBlock } from "../types/schedule"
import { previousDay, nextDay } from "../utils/dateUtils"
import { getActivitiesByDate } from "../services/evidenceService"
import RecordActivityForm from "../components/EvidenceForm"

type DayPanelProps = {
  selectedDate: string | null
  selectedBlock?: ScheduleBlock
  onClose: () => void
  onSelectDate: (date: string) => void
}

export default function DayPanel({
  selectedDate,
  selectedBlock,
  onClose,
  onSelectDate,
}: DayPanelProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
  setIsRecording(false)
}, [selectedDate])

  if (!selectedDate) {
    return null
  }

  const activities = getActivitiesByDate(selectedDate)

  function handleSaved() {
    setIsRecording(false)
    setRefreshKey((current) => current + 1)
  }

  return (
    <div
      className="day-panel-backdrop"
      onClick={onClose}
      data-refresh-key={refreshKey}
    >
      <aside
        className="day-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="day-panel-handle" />

        <div className="day-panel-header">
          <button
            type="button"
            className="icon-button"
            onClick={() => onSelectDate(previousDay(selectedDate))}
            aria-label="Previous day"
          >
            ←
          </button>

          <h2>
            {new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h2>

          <button
            type="button"
            className="icon-button"
            onClick={() => onSelectDate(nextDay(selectedDate))}
            aria-label="Next day"
          >
            →
          </button>
        </div>

        <section className="info-card">
          <span className="info-label">Ordered</span>
          <strong className="info-value">
            {selectedBlock
              ? `Client ${selectedBlock.client}`
              : "No assignment"}
          </strong>
        </section>

        <section className="info-card">
          <span className="info-label">Actual</span>
          <strong className="info-value">
            {activities.length > 0
              ? `${activities.length} recorded`
              : "Pending"}
          </strong>
        </section>

        <section className="info-card">
          <span className="info-label">Notes</span>
          <strong className="info-value">
            {activities.filter((activity) => activity.notes.trim()).length} notes
          </strong>
        </section>

        <section className="evidence-timeline">
  <h3>Evidence Timeline</h3>

  {activities.length === 0 ? (
    <p className="empty-timeline">
      No evidence recorded for this day.
    </p>
  ) : (
    activities
      .slice()
      .sort(
        (a, b) =>
          new Date(a.eventAt).getTime() -
          new Date(b.eventAt).getTime()
      )
      .map((activity) => (
        <article key={activity.id} className="evidence-item">
          <div className="evidence-time">
            {new Date(activity.eventAt).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </div>

          <div className="evidence-content">
            <strong className="evidence-title">
              {activity.type
                .replaceAll("-", " ")
                .replace(/\b\w/g, (letter) => letter.toUpperCase())}
            </strong>

            <span className="evidence-client">
              {activity.client === "client-a"
                ? "Client A"
                : "Client B"}
            </span>

            {activity.notes.trim() && (
              <p>{activity.notes}</p>
            )}
          </div>
        </article>
      ))
  )}
</section>

        {isRecording ? (
          <RecordActivityForm
            selectedDate={selectedDate}
            onSaved={handleSaved}
            onCancel={() => setIsRecording(false)}
          />
        ) : (
          <button
            type="button"
            className="primary-button"
            onClick={() => setIsRecording(true)}
          >
Add Evidence
          </button>
        )}
      </aside>
    </div>
  )
}