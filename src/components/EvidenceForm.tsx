import { useState } from "react";
import type {
  ActivityClient,
  ActivityRecord,
  ActivityType,
  EvidenceCategory,
} from "../types/activity";
import {
  addActivity,
  updateActivity,
} from "../services/evidenceService";

interface EvidenceFormProps {
  selectedDate: string;
  existingActivity?: ActivityRecord;
  onSaved: () => void;
  onCancel: () => void;
}

type ExchangeStatus =
  | "completed"
  | "late"
  | "missed"
  | "cancelled"
  | "changed";

type CommunicationMethod =
  | "sms"
  | "email"
  | "whatsapp"
  | "phone-call"
  | "voicemail"
  | "parenting-app"
  | "in-person"
  | "other";

type ExpenseStatus =
  | "paid"
  | "unpaid"
  | "partially-paid"
  | "disputed";

type ReimbursementStatus =
  | "not-applicable"
  | "not-requested"
  | "requested"
  | "partially-reimbursed"
  | "reimbursed"
  | "disputed";

const categories: Array<{
  value: EvidenceCategory;
  label: string;
  icon: string;
}> = [
  { value: "exchange", label: "Exchange", icon: "📍" },
  {
    value: "communication",
    label: "Communication",
    icon: "💬",
  },
  { value: "expense", label: "Expense", icon: "💰" },
  { value: "photo", label: "Photo", icon: "📷" },
  { value: "document", label: "Document", icon: "📄" },
  { value: "school", label: "School", icon: "🏫" },
  { value: "medical", label: "Medical", icon: "🩺" },
  { value: "note", label: "General Note", icon: "📝" },
];

export default function EvidenceForm({
  selectedDate,
  existingActivity,
  onSaved,
  onCancel,
}: EvidenceFormProps) {
  const existingDetails = existingActivity?.details as
    | {
        exchange?: Record<string, unknown>;
        communication?: Record<string, unknown>;
        expense?: Record<string, unknown>;
      }
    | undefined;

  const exchange = existingDetails?.exchange;
  const communication = existingDetails?.communication;
  const expense = existingDetails?.expense;

  const initialCategory =
    existingActivity?.category ??
    getLegacyCategory(existingActivity);

  const legacyCommunication =
    parseLegacyCommunication(existingActivity?.notes);

  const [category, setCategory] =
    useState<EvidenceCategory>(initialCategory);

  const [type, setType] = useState<ActivityType>(
    existingActivity?.type ?? "pickup",
  );

  const [time, setTime] = useState(
    existingActivity
      ? getTimeFromEventAt(existingActivity.eventAt)
      : "18:00",
  );

  const [notes, setNotes] = useState(
    initialCategory === "communication" &&
      !communication
      ? legacyCommunication.details
      : existingActivity?.notes ?? "",
  );

  const [relatedClient, setRelatedClient] =
    useState<ActivityClient>(
      existingActivity?.client ?? "client-b",
    );

  // Exchange
  const [scheduledFrom, setScheduledFrom] =
    useState<ActivityClient>(
      readClient(exchange?.scheduledFrom, "client-a"),
    );

  const [scheduledTo, setScheduledTo] =
    useState<ActivityClient>(
      readClient(exchange?.scheduledTo, "client-b"),
    );

  const [actualPerformedBy, setActualPerformedBy] =
    useState<ActivityClient>(
      readClient(
        exchange?.actualPerformedBy,
        existingActivity?.client ?? "client-b",
      ),
    );

  const [actualReceivedBy, setActualReceivedBy] =
    useState<ActivityClient>(
      readClient(exchange?.actualReceivedBy, "client-a"),
    );

  const [exchangeStatus, setExchangeStatus] =
    useState<ExchangeStatus>(
      readExchangeStatus(
        exchange?.status,
        getStatusFromType(existingActivity?.type),
      ),
    );

  const [scheduledTime, setScheduledTime] = useState(
    readString(exchange?.scheduledTime, time),
  );

  const [actualTime, setActualTime] = useState(
    readString(exchange?.actualTime, time),
  );

  const [delayMinutes, setDelayMinutes] = useState(
    readNumberString(exchange?.delayMinutes),
  );

  const [location, setLocation] = useState(
    readString(exchange?.location),
  );

  // Communication
  const [communicationMethod, setCommunicationMethod] =
    useState<CommunicationMethod>(
      readCommunicationMethod(
        communication?.method,
        legacyCommunication.method,
      ),
    );

  const [communicationFrom, setCommunicationFrom] =
    useState<ActivityClient>(
      readClient(
        communication?.from,
        existingActivity?.client ?? "client-b",
      ),
    );

  const [communicationTo, setCommunicationTo] =
    useState<ActivityClient>(
      readClient(
        communication?.to,
        oppositeClient(
          existingActivity?.client ?? "client-b",
        ),
      ),
    );

  const [communicationSubject, setCommunicationSubject] =
    useState(
      readString(
        communication?.subject,
        legacyCommunication.subject,
      ),
    );

  const [requiresResponse, setRequiresResponse] = useState(
    readBoolean(communication?.requiresResponse),
  );

  const [responseReceived, setResponseReceived] = useState(
    readBoolean(communication?.responseReceived),
  );

  // Expense
  const [amount, setAmount] = useState(
    readNumberString(expense?.amount),
  );

  const [currency, setCurrency] = useState(
    readString(expense?.currency, "USD"),
  );

  const [paidBy, setPaidBy] = useState<ActivityClient>(
    readClient(
      expense?.paidBy,
      existingActivity?.client ?? "client-a",
    ),
  );

  const [expenseFor, setExpenseFor] = useState(
    readString(expense?.expenseFor),
  );

  const [merchant, setMerchant] = useState(
    readString(expense?.merchant),
  );

  const [expenseStatus, setExpenseStatus] =
    useState<ExpenseStatus>(
      readExpenseStatus(expense?.status),
    );

  const [reimbursementStatus, setReimbursementStatus] =
    useState<ReimbursementStatus>(
      readReimbursementStatus(
        expense?.reimbursementStatus ??
          expense?.reimbursement,
      ),
    );

  function handleCategoryChange(
    newCategory: EvidenceCategory,
  ) {
    setCategory(newCategory);

    if (newCategory === "exchange") {
      setType("pickup");
    } else {
      setType("note");
    }
  }

  function getPrimaryClient(): ActivityClient {
    if (category === "exchange") {
      return actualPerformedBy;
    }

    if (category === "communication") {
      return communicationFrom;
    }

    if (category === "expense") {
      return paidBy;
    }

    return relatedClient;
  }

  function buildDetails(): ActivityRecord["details"] {
    const previous =
      (existingActivity?.details as Record<string, unknown>) ??
      {};

    if (category === "exchange") {
      return {
        ...previous,
        exchange: {
          scheduledFrom,
          scheduledTo,
          actualPerformedBy,
          actualReceivedBy,
          status: exchangeStatus,
          scheduledTime,
          actualTime:
            exchangeStatus === "missed"
              ? undefined
              : actualTime,
          delayMinutes:
            delayMinutes.trim() === ""
              ? undefined
              : Number(delayMinutes),
          location: location.trim() || undefined,
        },
      } as ActivityRecord["details"];
    }

    if (category === "communication") {
      return {
        ...previous,
        communication: {
          method: communicationMethod,
          from: communicationFrom,
          to: communicationTo,
          subject:
            communicationSubject.trim() || undefined,
          requiresResponse,
          responseReceived:
            requiresResponse
              ? responseReceived
              : false,
        },
      } as ActivityRecord["details"];
    }

    if (category === "expense") {
      return {
        ...previous,
        expense: {
          amount:
            amount.trim() === ""
              ? undefined
              : Number(amount),
          currency,
          paidBy,
          expenseFor: expenseFor.trim() || undefined,
          merchant: merchant.trim() || undefined,
          status: expenseStatus,
          reimbursementStatus,
        },
      } as ActivityRecord["details"];
    }

    return existingActivity?.details;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const now = new Date().toISOString();

    const activity: ActivityRecord = {
      id:
        existingActivity?.id ??
        crypto.randomUUID(),
      category,
      eventAt: `${selectedDate}T${time}`,
      sourceAt: existingActivity?.sourceAt,
      createdAt:
        existingActivity?.createdAt ?? now,
      updatedAt: now,
      type:
        category === "exchange"
          ? type
          : "note",
      client: getPrimaryClient(),
      notes: notes.trim(),
      details: buildDetails(),
      entryMethod:
        existingActivity?.entryMethod ?? "live",
      sourceType: existingActivity?.sourceType,
      sourceFiles:
        existingActivity?.sourceFiles ?? [],
      isApproximate:
        existingActivity?.isApproximate ?? false,
      reviewStatus:
        existingActivity?.reviewStatus ?? "confirmed",
    };

    if (existingActivity) {
      await updateActivity(activity);
    } else {
      await addActivity(activity);
    }

    onSaved();
  }

  return (
    <form
      className="evidence-form"
      onSubmit={handleSubmit}
    >
      <h3>
        {existingActivity
          ? "Edit Evidence"
          : "Add Evidence"}
      </h3>

      <div className="evidence-type-grid">
        {categories.map((item) => (
          <EvidenceCategoryButton
            key={item.value}
            active={category === item.value}
            icon={item.icon}
            label={item.label}
            onClick={() =>
              handleCategoryChange(item.value)
            }
          />
        ))}
      </div>

      {category === "exchange" && (
        <div className="exchange-fields">
          <h4>Exchange Details</h4>

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
              <option value="pickup">Pickup</option>
              <option value="dropoff">Drop-off</option>
              <option value="missed-exchange">
                Missed exchange
              </option>
              <option value="late-pickup">
                Late pickup
              </option>
              <option value="early-dropoff">
                Early drop-off
              </option>
              <option value="note">Note</option>
            </select>
          </label>

          <div className="evidence-form-section">
            <h5>Scheduled</h5>

            <ClientField
              label="Scheduled from"
              client={scheduledFrom}
              setClient={setScheduledFrom}
            />

            <ClientField
              label="Scheduled to"
              client={scheduledTo}
              setClient={setScheduledTo}
            />

            <TimeField
              label="Scheduled time"
              time={scheduledTime}
              setTime={setScheduledTime}
            />
          </div>

          <div className="evidence-form-section">
            <h5>Actual</h5>

            <ClientField
              label="Performed by"
              client={actualPerformedBy}
              setClient={setActualPerformedBy}
            />

            <ClientField
              label="Received by"
              client={actualReceivedBy}
              setClient={setActualReceivedBy}
            />

            <label>
              Status
              <select
                value={exchangeStatus}
                onChange={(event) =>
                  setExchangeStatus(
                    event.target.value as ExchangeStatus,
                  )
                }
              >
                <option value="completed">
                  Completed
                </option>
                <option value="late">Late</option>
                <option value="missed">Missed</option>
                <option value="cancelled">
                  Cancelled
                </option>
                <option value="changed">Changed</option>
              </select>
            </label>

            {exchangeStatus !== "missed" && (
              <TimeField
                label="Actual time"
                time={actualTime}
                setTime={setActualTime}
              />
            )}

            <label>
              Delay in minutes
              <input
                type="number"
                min="0"
                step="1"
                value={delayMinutes}
                onChange={(event) =>
                  setDelayMinutes(event.target.value)
                }
                placeholder="0"
              />
            </label>

            <label>
              Location
              <input
                type="text"
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value)
                }
                placeholder="School, residence, park..."
              />
            </label>
          </div>

          <TimeField
            label="Timeline time"
            time={time}
            setTime={setTime}
          />

          <NotesField
            notes={notes}
            setNotes={setNotes}
            label="Notes"
            placeholder="Describe what happened factually."
          />
        </div>
      )}

      {category === "communication" && (
        <div className="communication-fields">
          <h4>Communication Details</h4>

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
              <option value="sms">
                SMS / Text message
              </option>
              <option value="email">Email</option>
              <option value="whatsapp">
                WhatsApp
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
              <option value="other">Other</option>
            </select>
          </label>

          <ClientField
            label="From"
            client={communicationFrom}
            setClient={setCommunicationFrom}
          />

          <ClientField
            label="To"
            client={communicationTo}
            setClient={setCommunicationTo}
          />

          <TimeField
            label="Communication time"
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

          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={requiresResponse}
              onChange={(event) =>
                setRequiresResponse(
                  event.target.checked,
                )
              }
            />
            Response required
          </label>

          {requiresResponse && (
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={responseReceived}
                onChange={(event) =>
                  setResponseReceived(
                    event.target.checked,
                  )
                }
              />
              Response received
            </label>
          )}

          <NotesField
            notes={notes}
            setNotes={setNotes}
            label="Details"
            placeholder="Record what was said, requested, agreed, refused, or left unanswered."
          />
        </div>
      )}

      {category === "expense" && (
        <div className="expense-fields">
          <h4>Expense Details</h4>

          <label>
            Amount
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              placeholder="0.00"
              required
            />
          </label>

          <label>
            Currency
            <select
              value={currency}
              onChange={(event) =>
                setCurrency(event.target.value)
              }
            >
              <option value="USD">USD</option>
              <option value="CRC">CRC</option>
              <option value="EUR">EUR</option>
            </select>
          </label>

          <ClientField
            label="Paid by"
            client={paidBy}
            setClient={setPaidBy}
          />

          <label>
            Expense for
            <input
              type="text"
              value={expenseFor}
              onChange={(event) =>
                setExpenseFor(event.target.value)
              }
              placeholder="Tuition, medical, activity..."
              required
            />
          </label>

          <label>
            Merchant or provider
            <input
              type="text"
              value={merchant}
              onChange={(event) =>
                setMerchant(event.target.value)
              }
              placeholder="School, doctor, store..."
            />
          </label>

          <label>
            Payment status
            <select
              value={expenseStatus}
              onChange={(event) =>
                setExpenseStatus(
                  event.target.value as ExpenseStatus,
                )
              }
            >
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="partially-paid">
                Partially paid
              </option>
              <option value="disputed">
                Disputed
              </option>
            </select>
          </label>

          <label>
            Reimbursement
            <select
              value={reimbursementStatus}
              onChange={(event) =>
                setReimbursementStatus(
                  event.target
                    .value as ReimbursementStatus,
                )
              }
            >
              <option value="not-applicable">
                Not applicable
              </option>
              <option value="not-requested">
                Not requested
              </option>
              <option value="requested">
                Requested
              </option>
              <option value="partially-reimbursed">
                Partially reimbursed
              </option>
              <option value="reimbursed">
                Reimbursed
              </option>
              <option value="disputed">
                Disputed
              </option>
            </select>
          </label>

          <TimeField
            label="Expense time"
            time={time}
            setTime={setTime}
          />

          <NotesField
            notes={notes}
            setNotes={setNotes}
            label="Notes"
            placeholder="Add payment, reimbursement, or dispute details."
          />
        </div>
      )}

      {category !== "exchange" &&
        category !== "communication" &&
        category !== "expense" && (
          <div className="general-evidence-fields">
            <h4>
              {getCategoryLabel(category)} Details
            </h4>

            <ClientField
              label="Related to"
              client={relatedClient}
              setClient={setRelatedClient}
            />

            <TimeField
              label="Event time"
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
          {existingActivity
            ? "Save Changes"
            : "Save Evidence"}
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
  label: string;
  client: ActivityClient;
  setClient: (client: ActivityClient) => void;
}

function ClientField({
  label,
  client,
  setClient,
}: ClientFieldProps) {
  return (
    <label>
      {label}
      <select
        value={client}
        onChange={(event) =>
          setClient(
            event.target.value as ActivityClient,
          )
        }
      >
        <option value="client-a">
          Parent 1
        </option>
        <option value="client-b">
          Parent 2
        </option>
      </select>
    </label>
  );
}

interface TimeFieldProps {
  label: string;
  time: string;
  setTime: (time: string) => void;
}

function TimeField({
  label,
  time,
  setTime,
}: TimeFieldProps) {
  return (
    <label>
      {label}
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

function getTimeFromEventAt(eventAt: string) {
  const time = eventAt.split("T")[1];
  return time?.slice(0, 5) || "18:00";
}

function getLegacyCategory(
  activity?: ActivityRecord,
): EvidenceCategory {
  if (!activity) {
    return "exchange";
  }

  return activity.type === "note"
    ? "note"
    : "exchange";
}

function getStatusFromType(
  type?: ActivityType,
): ExchangeStatus {
  if (type === "missed-exchange") {
    return "missed";
  }

  if (
    type === "late-pickup" ||
    type === "early-dropoff"
  ) {
    return "late";
  }

  return "completed";
}

function oppositeClient(
  client: ActivityClient,
): ActivityClient {
  return client === "client-a"
    ? "client-b"
    : "client-a";
}

function parseLegacyCommunication(
  notes = "",
): {
  method: CommunicationMethod;
  subject: string;
  details: string;
} {
  const methodMatch = notes.match(
    /^Communication method:\s*(.+)$/m,
  );

  const subjectMatch = notes.match(
    /^Subject:\s*(.+)$/m,
  );

  const detailsMatch = notes.match(
    /^Details:\s*([\s\S]*)$/m,
  );

  return {
    method: readCommunicationMethod(
      methodMatch?.[1],
      "sms",
    ),
    subject:
      subjectMatch?.[1]?.trim() ?? "",
    details:
      detailsMatch?.[1]?.trim() ?? notes,
  };
}

function readString(
  value: unknown,
  fallback = "",
) {
  return typeof value === "string"
    ? value
    : fallback;
}

function readBoolean(value: unknown) {
  return typeof value === "boolean"
    ? value
    : false;
}

function readNumberString(value: unknown) {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? String(value)
    : "";
}

function readClient(
  value: unknown,
  fallback: ActivityClient,
): ActivityClient {
  return value === "client-a" ||
    value === "client-b"
    ? value
    : fallback;
}

function readExchangeStatus(
  value: unknown,
  fallback: ExchangeStatus,
): ExchangeStatus {
  const valid: ExchangeStatus[] = [
    "completed",
    "late",
    "missed",
    "cancelled",
    "changed",
  ];

  return valid.includes(
    value as ExchangeStatus,
  )
    ? (value as ExchangeStatus)
    : fallback;
}

function readCommunicationMethod(
  value: unknown,
  fallback: CommunicationMethod,
): CommunicationMethod {
  const normalized =
    typeof value === "string"
      ? value
          .trim()
          .toLowerCase()
          .replaceAll(" ", "-")
      : "";

  if (
    normalized === "text-message" ||
    normalized === "sms"
  ) {
    return "sms";
  }

  if (normalized === "email") {
    return "email";
  }

  if (normalized === "whatsapp") {
    return "whatsapp";
  }

  if (normalized === "phone-call") {
    return "phone-call";
  }

  if (normalized === "voicemail") {
    return "voicemail";
  }

  if (normalized === "parenting-app") {
    return "parenting-app";
  }

  if (normalized === "in-person") {
    return "in-person";
  }

  if (normalized === "other") {
    return "other";
  }

  return fallback;
}

function readExpenseStatus(
  value: unknown,
): ExpenseStatus {
  const valid: ExpenseStatus[] = [
    "paid",
    "unpaid",
    "partially-paid",
    "disputed",
  ];

  return valid.includes(value as ExpenseStatus)
    ? (value as ExpenseStatus)
    : "paid";
}

function readReimbursementStatus(
  value: unknown,
): ReimbursementStatus {
  const valid: ReimbursementStatus[] = [
    "not-applicable",
    "not-requested",
    "requested",
    "partially-reimbursed",
    "reimbursed",
    "disputed",
  ];

  return valid.includes(
    value as ReimbursementStatus,
  )
    ? (value as ReimbursementStatus)
    : "not-requested";
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