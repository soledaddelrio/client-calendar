import { useState } from "react";
import type {
  ActivityClient,
  ActivityRecord,
  ActivityType,
  EvidenceCategory,
} from "../types/activity";
import { addActivity } from "../services/evidenceService";

interface EvidenceFormProps {
  selectedDate: string;
  onSaved: () => void;
  onCancel: () => void;
}

type CommunicationMethod =
  | "text-message"
  | "email"
  | "phone-call"
  | "voicemail"
  | "parenting-app"
  | "in-person"
  | "other";

type CommunicationDirection =
  | "received"
  | "sent"
  | "conversation"
  | "no-response";

export default function EvidenceForm({
  selectedDate,
  onSaved,
  onCancel,
}: EvidenceFormProps) {
  const [category, setCategory] =
    useState<EvidenceCategory>("exchange");

  const [type, setType] =
    useState<ActivityType>("pickup");

  const [client, setClient] =
    useState<ActivityClient>("client-b");

  const [time, setTime] = useState("18:00");
  const [notes, setNotes] = useState("");

  const [communicationMethod, setCommunicationMethod] =
    useState<CommunicationMethod>("text-message");

  const [communicationDirection, setCommunicationDirection] =
    useState<CommunicationDirection>("received");

  const [communicationSubject, setCommunicationSubject] =
    useState("");

  function handleCategoryChange(
    newCategory: EvidenceCategory,
  ) {
    setCategory(newCategory);
    setNotes("");

    if (newCategory === "exchange") {
      setType("pickup");
    } else {
      setType("note");
    }
  }

  function buildNotes() {
    if (category !== "communication") {
      return notes.trim();
    }

    const details = [
      `Communication method: ${formatLabel(
        communicationMethod,
      )}`,
      `Direction: ${formatLabel(
        communicationDirection,
      )}`,
    ];

    if (communicationSubject.trim()) {
      details.push(
        `Subject: ${communicationSubject.trim()}`,
      );
    }

    if (notes.trim()) {
      details.push(`Details: ${notes.trim()}`);
    }

    return details.join("\n");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const now = new Date().toISOString();

    const activity: ActivityRecord = {
      id: crypto.randomUUID(),
      category,
      eventAt: `${selectedDate}T${time}`,
      createdAt: now,
      updatedAt: now,
      type:
        category === "exchange"
          ? type
          : "note",
      client,
      notes: buildNotes(),
      entryMethod: "live",
      sourceFiles: [],
      isApproximate: false,
      reviewStatus: "confirmed",
    };

    await addActivity(activity);
    onSaved();
  }

  return (
    <form
      className="evidence-form"
      onSubmit={handleSubmit}
    >
      <h3>Add Evidence</h3>

      <div className="evidence-type-grid">
        <EvidenceCategoryButton
          active={category === "exchange"}
          icon="📍"
          label="Exchange"
          onClick={() =>
            handleCategoryChange("exchange")
          }
        />

        <EvidenceCategoryButton
          active={category === "communication"}
          icon="💬"
          label="Communication"
          onClick={() =>
            handleCategoryChange("communication")
          }
        />

        <EvidenceCategoryButton
          active={category === "expense"}
          icon="💰"
          label="Expense"
          onClick={() =>
            handleCategoryChange("expense")
          }
        />

        <EvidenceCategoryButton
          active={category === "photo"}
          icon="📷"
          label="Photo"
          onClick={() =>
            handleCategoryChange("photo")
          }
        />

        <EvidenceCategoryButton
          active={category === "document"}
          icon="📄"
          label="Document"
          onClick={() =>
            handleCategoryChange("document")
          }
        />

        <EvidenceCategoryButton
          active={category === "school"}
          icon="🏫"
          label="School"
          onClick={() =>
            handleCategoryChange("school")
          }
        />

        <EvidenceCategoryButton
          active={category === "medical"}
          icon="🩺"
          label="Medical"
          onClick={() =>
            handleCategoryChange("medical")
          }
        />

        <EvidenceCategoryButton
          active={category === "note"}
          icon="📝"
          label="General Note"
          onClick={() =>
            handleCategoryChange("note")
          }
        />
      </div>

      {category === "exchange" && (
        <div className="exchange-fields">
          <label>
            Activity
            <select
              value={type}
              onChange={(event) =>
                setType(
                  event.target.value as ActivityType,
                )
              }
            >
              <option value="pickup">
                Pickup
              </option>

              <option value="dropoff">
                Drop-off
              </option>

              <option value="missed-exchange">
                Missed exchange
              </option>

              <option value="late-pickup">
                Late pickup
              </option>

              <option value="early-dropoff">
                Early drop-off
              </option>

              <option value="note">
                Note
              </option>
            </select>
          </label>

          <ClientField
            client={client}
            setClient={setClient}
          />

          <TimeField
            time={time}
            setTime={setTime}
          />

          <NotesField
            notes={notes}
            setNotes={setNotes}
            label="Notes"
          />
        </div>
      )}

      {category === "communication" && (
        <div className="communication-fields">
          <label>
            Method
            <select
              value={communicationMethod}
              onChange={(event) =>
                setCommunicationMethod(
                  event.target
                    .value as CommunicationMethod,
                )
              }
            >
              <option value="text-message">
                Text message
              </option>

              <option value="email">
                Email
              </option>

              <option value="phone-call">
                Phone call
              </option>

              <option value="voicemail">
                Voicemail
              </option>

              <option value="parenting-app">
                Parenting app
              </option>

              <option value="in-person">
                In person
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </label>

          <label>
            Direction
            <select
              value={communicationDirection}
              onChange={(event) =>
                setCommunicationDirection(
                  event.target
                    .value as CommunicationDirection,
                )
              }
            >
              <option value="received">
                Received
              </option>

              <option value="sent">
                Sent
              </option>

              <option value="conversation">
                Conversation
              </option>

              <option value="no-response">
                No response
              </option>
            </select>
          </label>

          <ClientField
            client={client}
            setClient={setClient}
          />

          <TimeField
            time={time}
            setTime={setTime}
          />

          <label>
            Subject
            <input
              type="text"
              value={communicationSubject}
              onChange={(event) =>
                setCommunicationSubject(
                  event.target.value,
                )
              }
              placeholder="Brief reason for the communication"
            />
          </label>

          <NotesField
            notes={notes}
            setNotes={setNotes}
            label="Details"
            placeholder="Record what was said, requested, agreed, refused, or left unanswered."
          />
        </div>
      )}

      {category !== "exchange" &&
        category !== "communication" && (
          <div className="general-evidence-fields">
            <ClientField
              client={client}
              setClient={setClient}
            />

            <TimeField
              time={time}
              setTime={setTime}
            />

            <NotesField
              notes={notes}
              setNotes={setNotes}
              label="Details"
              placeholder={`Describe this ${getCategoryLabel(
                category,
              ).toLowerCase()} evidence.`}
            />
          </div>
        )}

      <div className="record-activity-actions">
        <button
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button type="submit">
          Save Evidence
        </button>
      </div>
    </form>
  );
}

interface EvidenceCategoryButtonProps {
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}

function EvidenceCategoryButton({
  active,
  icon,
  label,
  onClick,
}: EvidenceCategoryButtonProps) {
  return (
    <button
      type="button"
      className={
        active
          ? "evidence-type-card active"
          : "evidence-type-card"
      }
      onClick={onClick}
    >
      <span className="evidence-type-icon">
        {icon}
      </span>

      <span>{label}</span>
    </button>
  );
}

interface ClientFieldProps {
  client: ActivityClient;
  setClient: (
    client: ActivityClient,
  ) => void;
}

function ClientField({
  client,
  setClient,
}: ClientFieldProps) {
  return (
    <label>
      Client
      <select
        value={client}
        onChange={(event) =>
          setClient(
            event.target.value as ActivityClient,
          )
        }
      >
        <option value="client-a">
          Client A
        </option>

        <option value="client-b">
          Client B
        </option>
      </select>
    </label>
  );
}

interface TimeFieldProps {
  time: string;
  setTime: (time: string) => void;
}

function TimeField({
  time,
  setTime,
}: TimeFieldProps) {
  return (
    <label>
      Event time
      <input
        type="time"
        value={time}
        onChange={(event) =>
          setTime(event.target.value)
        }
        required
      />
    </label>
  );
}

interface NotesFieldProps {
  notes: string;
  setNotes: (notes: string) => void;
  label: string;
  placeholder?: string;
}

function NotesField({
  notes,
  setNotes,
  label,
  placeholder,
}: NotesFieldProps) {
  return (
    <label>
      {label}
      <textarea
        value={notes}
        onChange={(event) =>
          setNotes(event.target.value)
        }
        rows={4}
        placeholder={placeholder}
      />
    </label>
  );
}

function formatLabel(value: string) {
  return value
    .split("-")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function getCategoryLabel(
  category: EvidenceCategory,
) {
  const labels: Record<
    EvidenceCategory,
    string
  > = {
    exchange: "Exchange",
    communication: "Communication",
    expense: "Expense",
    photo: "Photo",
    document: "Document",
    school: "School",
    medical: "Medical",
    note: "General Note",
  };

  return labels[category];
}