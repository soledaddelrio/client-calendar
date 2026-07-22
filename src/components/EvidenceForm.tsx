import { useState } from "react";
import type {
  ActivityClient,
  ActivityRecord,
  ActivityType,
} from "../types/activity";
import { addActivity } from "../services/evidenceService";

interface EvidenceFormProps {
  selectedDate: string;
  onSaved: () => void;
  onCancel: () => void;
}

export default function EvidenceForm({
  selectedDate,
  onSaved,
  onCancel,
}: EvidenceFormProps) {
      const [category, setCategory] = useState("exchange");
  const [type, setType] = useState<ActivityType>("pickup");
  const [client, setClient] = useState<ActivityClient>("client-b");
  const [time, setTime] = useState("18:00");
  const [notes, setNotes] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const now = new Date().toISOString();

    const activity: ActivityRecord = {
      id: crypto.randomUUID(),
      eventAt: `${selectedDate}T${time}`,
      createdAt: now,
      updatedAt: now,
      type,
      client,
      notes,
      entryMethod: "live",
      sourceFiles: [],
      isApproximate: false,
      reviewStatus: "confirmed",
    };

    addActivity(activity);
    onSaved();
  }

  return (
<form className="evidence-form" onSubmit={handleSubmit}>
  
  <h3>Add Evidence</h3>

<div className="evidence-type-grid">
  <button
    type="button"
    className={category === "exchange" ? "evidence-type-card active" : "evidence-type-card"}
    onClick={() => setCategory("exchange")}
  >
    <span className="evidence-type-icon">📍</span>
    <span>Exchange</span>
  </button>

  <button
    type="button"
    className={category === "communication" ? "evidence-type-card active" : "evidence-type-card"}
    onClick={() => setCategory("communication")}
  >
    <span className="evidence-type-icon">💬</span>
    <span>Communication</span>
  </button>

  <button
    type="button"
    className={category === "expense" ? "evidence-type-card active" : "evidence-type-card"}
    onClick={() => setCategory("expense")}
  >
    <span className="evidence-type-icon">💰</span>
    <span>Expense</span>
  </button>

  <button
    type="button"
    className={category === "photo" ? "evidence-type-card active" : "evidence-type-card"}
    onClick={() => setCategory("photo")}
  >
    <span className="evidence-type-icon">📷</span>
    <span>Photo</span>
  </button>

  <button
    type="button"
    className={category === "document" ? "evidence-type-card active" : "evidence-type-card"}
    onClick={() => setCategory("document")}
  >
    <span className="evidence-type-icon">📄</span>
    <span>Document</span>
  </button>

  <button
    type="button"
    className={category === "school" ? "evidence-type-card active" : "evidence-type-card"}
    onClick={() => setCategory("school")}
  >
    <span className="evidence-type-icon">🏫</span>
    <span>School</span>
  </button>

  <button
    type="button"
    className={category === "medical" ? "evidence-type-card active" : "evidence-type-card"}
    onClick={() => setCategory("medical")}
  >
    <span className="evidence-type-icon">🩺</span>
    <span>Medical</span>
  </button>

  <button
    type="button"
    className={category === "note" ? "evidence-type-card active" : "evidence-type-card"}
    onClick={() => setCategory("note")}
  >
    <span className="evidence-type-icon">📝</span>
    <span>General Note</span>
  </button>
</div>

{category === "exchange" && (
  <div className="exchange-fields">
    <label>
      Activity
      <select
        value={type}
        onChange={(event) =>
          setType(event.target.value as ActivityType)
        }
      >
        <option value="pickup">Pickup</option>
        <option value="dropoff">Drop-off</option>
        <option value="missed-exchange">Missed exchange</option>
        <option value="late-pickup">Late pickup</option>
        <option value="early-dropoff">Early drop-off</option>
        <option value="note">Note</option>
      </select>
    </label>

    <label>
      Client
      <select
        value={client}
        onChange={(event) =>
          setClient(event.target.value as ActivityClient)
        }
      >
        <option value="client-a">Client A</option>
        <option value="client-b">Client B</option>
      </select>
    </label>

    <label>
      Event time
      <input
        type="time"
        value={time}
        onChange={(event) => setTime(event.target.value)}
        required
      />
    </label>

    <label>
      Notes
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows={4}
      />
    </label>
  </div>
)}

      <div className="record-activity-actions">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>

        <button type="submit">
          Save Activity
        </button>
      </div>
    </form>
  );
}