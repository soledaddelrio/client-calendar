type DayPanelProps = {
  selectedDate: string | null
  onClose: () => void
}

export default function DayPanel({
  selectedDate,
  onClose,
}: DayPanelProps) {
  if (!selectedDate) {
    return null
  }

  return (
    <div className="day-panel-backdrop">
      <aside className="day-panel">
        <div className="day-panel-handle" />

        <div className="day-panel-header">
          <h2>{selectedDate}</h2>

          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close selected day"
          >
            ×
          </button>
        </div>

        <div className="day-panel-row">
          <span>Ordered</span>
          <strong>—</strong>
        </div>

        <div className="day-panel-row">
          <span>Actual</span>
          <strong>Not recorded</strong>
        </div>

        <div className="day-panel-row">
          <span>Notes</span>
          <strong>No notes</strong>
        </div>

        <button type="button" className="primary-button">
          Edit
        </button>
      </aside>
    </div>
  )
}