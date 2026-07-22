import { useState } from "react";
import type {
  ActivityClient,
  ActivityRecord,
  ActivityType,
  CommunicationMethod,
  EvidenceCategory,
  ExchangeStatus,
  ExpenseStatus,
  ReimbursementStatus,
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

const categories: Array<{
  value: EvidenceCategory;
  label: string;
  icon: string;
}> = [
  {
    value: "exchange",
    label: "Exchange",
    icon: "📍",
  },
  {
    value: "communication",
    label: "Communication",
    icon: "💬",
  },
  {
    value: "expense",
    label: "Expense",
    icon: "💰",
  },
  {
    value: "photo",
    label: "Photo",
    icon: "📷",
  },
  {
    value: "document",
    label: "Document",
    icon: "📄",
  },
  {
    value: "school",
    label: "School",
    icon: "🏫",
  },
  {
    value: "medical",
    label: "Medical",
    icon: "🩺",
  },
  {
    value: "note",
    label: "General Note",
    icon: "📝",
  },
];

export default function EvidenceForm({
  selectedDate,
  existingActivity,
  onSaved,
  onCancel,
}: EvidenceFormProps) {
  const initialCategory =
    existingActivity?.category ??
    getLegacyCategory(existingActivity);

  const existingExchange =
    existingActivity?.details?.exchange;

  const existingCommunication =
    existingActivity?.details?.communication;

  const existingExpense =
    existingActivity?.details?.expense;

  const legacyCommunication =
    parseLegacyCommunication(
      existingActivity?.notes,
    );

  const [category, setCategory] =
    useState<EvidenceCategory>(
      initialCategory,
    );

  const [type, setType] =
    useState<ActivityType>(
      existingActivity?.type ?? "pickup",
    );

  const [time, setTime] = useState(
    existingActivity
      ? getTimeFromEventAt(
          existingActivity.eventAt,
        )
      : "18:00",
  );

  const [notes, setNotes] = useState(
    getInitialNotes(existingActivity),
  );

  // Exchange
  const [
    scheduledFrom,
    setScheduledFrom,
  ] = useState<ActivityClient>(
    existingExchange?.scheduledFrom ??
      "client-a",
  );

  const [scheduledTo, setScheduledTo] =
    useState<ActivityClient>(
      existingExchange?.scheduledTo ??
        "client-b",
    );

  const [
    actualPerformedBy,
    setActualPerformedBy,
  ] = useState<ActivityClient>(
    existingExchange?.actualPerformedBy ??
      existingActivity?.client ??
      "client-b",
  );

  const [
    actualReceivedBy,
    setActualReceivedBy,
  ] = useState<ActivityClient>(
    existingExchange?.actualReceivedBy ??
      "client-b",
  );

  const [
    exchangeStatus,
    setExchangeStatus,
  ] = useState<ExchangeStatus>(
    existingExchange?.status ??
      getStatusFromType(
        existingActivity?.type,
      ),
  );

  const [
    scheduledTime,
    setScheduledTime,
  ] = useState(
    existingExchange?.scheduledTime ??
      time,
  );

  const [actualTime, setActualTime] =
    useState(
      existingExchange?.actualTime ??
        time,
    );

  const [
    delayMinutes,
    setDelayMinutes,
  ] = useState(
    existingExchange?.delayMinutes?.toString() ??
      "",
  );

  const [location, setLocation] =
    useState(
      existingExchange?.location ?? "",
    );

  // Communication
  const [
    communicationFrom,
    setCommunicationFrom,
  ] = useState<ActivityClient>(
    existingCommunication?.from ??
      getLegacyCommunicationFrom(
        legacyCommunication.direction,
        existingActivity?.client,
      ),
  );

  const [
    communicationTo,
    setCommunicationTo,
  ] = useState<ActivityClient>(
    existingCommunication?.to ??
      oppositeClient(
        getLegacyCommunicationFrom(
          legacyCommunication.direction,
          existingActivity?.client,
        ),
      ),
  );

  const [
    communicationMethod,
    setCommunicationMethod,
  ] = useState<CommunicationMethod>(
    existingCommunication?.method ??
      legacyCommunication.method,
  );

  const [
    communicationSubject,
    setCommunicationSubject,
  ] = useState(
    existingCommunication?.subject ??
      legacyCommunication.subject,
  );

  const [
    requiresResponse,
    setRequiresResponse,
  ] = useState(
    existingCommunication?.requiresResponse ??
      false,
  );

  const [
    responseReceived,
    setResponseReceived,
  ] = useState(
    existingCommunication?.responseReceived ??
      false,
  );

  // Expense
  const [amount, setAmount] = useState(
    existingExpense?.amount?.toString() ??
      "",
  );

  const [currency, setCurrency] =
    useState(
      existingExpense?.currency ?? "USD",
    );

  const [paidBy, setPaidBy] =
    useState<ActivityClient>(
      existingExpense?.paidBy ??
        existingActivity?.client ??
        "client-a",
    );

  const [expenseFor, setExpenseFor] =
    useState(
      existingExpense?.expenseFor ?? "",
    );

  const [merchant, setMerchant] =
    useState(
      existingExpense?.merchant ?? "",
    );

  const [
    expenseStatus,
    setExpenseStatus,
  ] = useState<ExpenseStatus>(
    existingExpense?.expenseStatus ??
      "paid",
  );

  const [
    reimbursementStatus,
    setReimbursementStatus,
  ] = useState<ReimbursementStatus>(
    existingExpense?.reimbursementStatus ??
      "not-requested",
  );

  const [
    reimbursementAmount,
    setReimbursementAmount,
  ] = useState(
    existingExpense?.reimbursementAmount?.toString() ??
      "",
  );

  const [dueDate, setDueDate] =
    useState(
      existingExpense?.dueDate ?? "",
    );

  // Other categories
  const [relatedClient, setRelatedClient] =
    useState<ActivityClient>(
      existingActivity?.client ??
        "client-b",
    );

  function handleCategoryChange(
    newCategory: EvidenceCategory,
  ) {
    setCategory(newCategory);

    if (newCategory === "exchange") {
      setType("pickup");
      return;
    }

    if (
      newCategory === "communication"
    ) {
      setType(
        getCommunicationActivityType(
          communicationMethod,
        ),
      );
      return;
    }

    if (newCategory === "expense") {
      setType("expense");
      return;
    }

    if (newCategory === "photo") {
      setType("photo");
      return;
    }

    if (newCategory === "document") {
      setType("document");
      return;
    }

    if (newCategory === "school") {
      setType("school-event");
      return;
    }

    if (newCategory === "medical") {
      setType("medical-event");
      return;
    }

    setType("note");
  }

  function buildActivityType(): ActivityType {
    if (category === "exchange") {
      return type;
    }

    if (
      category === "communication"
    ) {
      return getCommunicationActivityType(
        communicationMethod,
      );
    }

    if (category === "expense") {
      return "expense";
    }

    if (category === "photo") {
      return "photo";
    }

    if (category === "document") {
      return "document";
    }

    if (category === "school") {
      return "school-event";
    }

    if (category === "medical") {
      return "medical-event";
    }

    return "note";
  }

  function getPrimaryClient(): ActivityClient {
    if (category === "exchange") {
      return actualPerformedBy;
    }

    if (
      category === "communication"
    ) {
      return communicationFrom;
    }

    if (category === "expense") {
      return paidBy;
    }

    return relatedClient;
  }

  function buildDetails(): ActivityRecord["details"] {
    if (category === "exchange") {
      return {
        ...existingActivity?.details,
        exchange: {
          scheduledFrom,
          scheduledTo,
          actualPerformedBy,
          actualReceivedBy,
          status: exchangeStatus,
          scheduledTime,
          actualTime,
          delayMinutes:
            delayMinutes.trim() === ""
              ? undefined
              : Number(delayMinutes),
          location:
            location.trim() ||
            undefined,
        },
      };
    }

    if (
      category === "communication"
    ) {
      return {
        ...existingActivity?.details,
        communication: {
          from: communicationFrom,
          to: communicationTo,
          method: communicationMethod,
          subject:
            communicationSubject.trim() ||
            undefined,
          requiresResponse,
          responseReceived,
        },
      };
    }

    if (category === "expense") {
      return {
        ...existingActivity?.details,
        expense: {
          amount:
            amount.trim() === ""
              ? undefined
              : Number(amount),
          currency,
          paidBy,
          expenseFor:
            expenseFor.trim() ||
            undefined,
          merchant:
            merchant.trim() ||
            undefined,
          expenseStatus,
          reimbursementStatus,
          reimbursementAmount:
            reimbursementAmount.trim() ===
            ""
              ? undefined
              : Number(
                  reimbursementAmount,
                ),
          dueDate:
            dueDate || undefined,
        },
      };
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
      sourceAt:
        existingActivity?.sourceAt,
      createdAt:
        existingActivity?.createdAt ??
        now,
      updatedAt: now,
      type: buildActivityType(),
      client: getPrimaryClient(),
      notes: notes.trim(),
      details: buildDetails(),
      entryMethod:
        existingActivity?.entryMethod ??
        "live",
      sourceType:
        existingActivity?.sourceType,
      sourceFiles:
        existingActivity?.sourceFiles ??
        [],
      isApproximate:
        existingActivity?.isApproximate ??
        false,
      reviewStatus:
        existingActivity?.reviewStatus ??
        "confirmed",
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
            active={
              category === item.value
            }
            icon={item.icon}
            label={item.label}
            onClick={() =>
              handleCategoryChange(
                item.value,
              )
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
                  event.target
                    .value as ActivityType,
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
            </select>
          </label>

          <div className="evidence-form-section">
            <h5>Scheduled</h5>

            <ClientField
              label="From"
              client={scheduledFrom}
              setClient={setScheduledFrom}
            />

            <ClientField
              label="To"
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
              setClient={
                setActualPerformedBy
              }
            />

            <ClientField
              label="Received by"
              client={actualReceivedBy}
              setClient={
                setActualReceivedBy
              }
            />

            <label>
              Status
              <select
                value={exchangeStatus}
                onChange={(event) =>
                  setExchangeStatus(
                    event.target
                      .value as ExchangeStatus,
                  )
                }
              >
                <option value="completed">
                  Completed
                </option>

                <option value="late">
                  Late
                </option>

                <option value="missed">
                  Missed
                </option>

                <option value="cancelled">
                  Cancelled
                </option>

                <option value="changed">
                  Changed
                </option>
              </select>
            </label>

            <TimeField
              label="Actual time"
              time={actualTime}
              setTime={setActualTime}
            />

            <label>
              Delay in minutes
              <input
                type="number"
                min="0"
                step="1"
                value={delayMinutes}
                onChange={(event) =>
                  setDelayMinutes(
                    event.target.value,
                  )
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
                  setLocation(
                    event.target.value,
                  )
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

      {category ===
        "communication" && (
        <div className="communication-fields">
          <h4>Communication Details</h4>

          <label>
            Method
            <select
              value={communicationMethod}
              onChange={(event) => {
                const method =
                  event.target
                    .value as CommunicationMethod;

                setCommunicationMethod(
                  method,
                );

                setType(
                  getCommunicationActivityType(
                    method,
                  ),
                );
              }}
            >
              <option value="sms">
                SMS / Text message
              </option>

              <option value="email">
                Email
              </option>

              <option value="whatsapp">
                WhatsApp
              </option>

              <option value="phone-call">
                Phone call
              </option>

              <option value="in-person">
                In person
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </label>

          <ClientField
            label="From"
            client={communicationFrom}
            setClient={
              setCommunicationFrom
            }
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
                checked={
                  responseReceived
                }
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
                setAmount(
                  event.target.value,
                )
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
                setCurrency(
                  event.target.value,
                )
              }
            >
              <option value="USD">
                USD
              </option>

              <option value="CRC">
                CRC
              </option>

              <option value="EUR">
                EUR
              </option>
            </select>
          </label>

          <ClientField
            label="Paid by"
            client={paidBy}
            setClient={setPaidBy}
          />

          <label>
            Expense for
            <select
              value={expenseFor}
              onChange={(event) =>
                setExpenseFor(
                  event.target.value,
                )
              }
              required
            >
              <option value="">
                Select category
              </option>

              <option value="Tuition">
                Tuition
              </option>

              <option value="School">
                School
              </option>

              <option value="Medical">
                Medical
              </option>

              <option value="Activities">
                Activities
              </option>

              <option value="Clothing">
                Clothing
              </option>

              <option value="Travel">
                Travel
              </option>

              <option value="Food">
                Food
              </option>

              <option value="Insurance">
                Insurance
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </label>

          <label>
            Merchant or provider
            <input
              type="text"
              value={merchant}
              onChange={(event) =>
                setMerchant(
                  event.target.value,
                )
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
                  event.target
                    .value as ExpenseStatus,
                )
              }
            >
              <option value="paid">
                Paid
              </option>

              <option value="unpaid">
                Unpaid
              </option>

              <option value="partially-paid">
                Partially paid
              </option>

              <option value="reimbursement-requested">
                Reimbursement requested
              </option>

              <option value="reimbursed">
                Reimbursed
              </option>

              <option value="disputed">
                Disputed
              </option>
            </select>
          </label>

          <label>
            Reimbursement
            <select
              value={
                reimbursementStatus
              }
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

          <label>
            Reimbursement amount
            <input
              type="number"
              min="0"
              step="0.01"
              value={
                reimbursementAmount
              }
              onChange={(event) =>
                setReimbursementAmount(
                  event.target.value,
                )
              }
              placeholder="0.00"
            />
          </label>

          <label>
            Due date
            <input
              type="date"
              value={dueDate}
              onChange={(event) =>
                setDueDate(
                  event.target.value,
                )
              }
            />
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
        category !==
          "communication" &&
        category !== "expense" && (
          <div className="general-evidence-fields">
            <h4>
              {getCategoryLabel(
                category,
              )}{" "}
              Details
            </h4>

            <ClientField
              label="Related to"
              client={relatedClient}
              setClient={
                setRelatedClient
              }
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
  setClient: (
    client: ActivityClient,
  ) => void;
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
            event.target
              .value as ActivityClient,
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

function getInitialNotes(
  activity?: ActivityRecord,
) {
  if (!activity) {
    return "";
  }

  if (
    activity.category ===
      "communication" &&
    !activity.details?.communication
  ) {
    return parseLegacyCommunication(
      activity.notes,
    ).details;
  }

  return activity.notes;
}

function getTimeFromEventAt(
  eventAt: string,
) {
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

function getLegacyCommunicationFrom(
  direction: string,
  client?: ActivityClient,
): ActivityClient {
  if (client) {
    return client;
  }

  return direction === "sent"
    ? "client-a"
    : "client-b";
}

function getCommunicationActivityType(
  method: CommunicationMethod,
): ActivityType {
  if (method === "email") {
    return "email";
  }

  if (method === "phone-call") {
    return "phone-call";
  }

  if (
    method === "sms" ||
    method === "whatsapp"
  ) {
    return "text-message";
  }

  return "note";
}

function parseLegacyCommunication(
  notes = "",
): {
  method: CommunicationMethod;
  direction: string;
  subject: string;
  details: string;
} {
  const methodMatch = notes.match(
    /^Communication method:\s*(.+)$/m,
  );

  const directionMatch = notes.match(
    /^Direction:\s*(.+)$/m,
  );

  const subjectMatch = notes.match(
    /^Subject:\s*(.+)$/m,
  );

  const detailsMatch = notes.match(
    /^Details:\s*([\s\S]*)$/m,
  );

  return {
    method:
      toCommunicationMethod(
        methodMatch?.[1],
      ),
    direction:
      directionMatch?.[1]
        ?.trim()
        .toLowerCase() ?? "received",
    subject:
      subjectMatch?.[1]?.trim() ??
      "",
    details:
      detailsMatch?.[1]?.trim() ??
      notes,
  };
}

function toCommunicationMethod(
  value?: string,
): CommunicationMethod {
  const normalized = value
    ?.trim()
    .toLowerCase()
    .replaceAll(" ", "-");

  if (
    normalized === "text-message" ||
    normalized === "sms"
  ) {
    return "sms";
  }

  if (
    normalized === "parenting-app" ||
    normalized === "whatsapp"
  ) {
    return "whatsapp";
  }

  if (normalized === "email") {
    return "email";
  }

  if (
    normalized === "phone-call" ||
    normalized === "voicemail"
  ) {
    return "phone-call";
  }

  if (normalized === "in-person") {
    return "in-person";
  }

  return "other";
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