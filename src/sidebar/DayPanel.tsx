import type { ScheduleBlock } from '../types/schedule'
import { previousDay, nextDay } from '../utils/dateUtils'

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
  if (!selectedDate) {
    return null
  }

  return (
<div
  className="day-panel-backdrop"
  onClick={onClose}
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
    {new Date(selectedDate).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
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
    : 'No assignment'}
</strong>
</section>

<section className="info-card">
  <span className="info-label">Actual</span>
  <strong className="info-value">Pending</strong>
</section>

<section className="info-card">
  <span className="info-label">Notes</span>
  <strong className="info-value">0 notes</strong>
</section>

        <button type="button" className="primary-button">
          Record Activity
        </button>
      </aside>
    </div>
  )
}