import { useEffect, useState } from "react";
import type { ActivityRecord } from "../types/activity";
import type { ScheduleBlock } from "../types/schedule";
import {
  previousDay,
  nextDay,
} from "../utils/dateUtils";
import {
  deleteActivity,
  getActivitiesByDate,
} from "../services/evidenceService";
import EvidenceForm from "../components/EvidenceForm";

type DayPanelProps = {
  selectedDate: string | null;
  selectedBlock?: ScheduleBlock;
  onClose: () => void;
  onSelectDate: (date: string) => void;
};

type FormActivity =
  | ActivityRecord
  | "new"
  | null;

export default function DayPanel({
  selectedDate,
  selectedBlock,
  onClose,
  onSelectDate,
}: DayPanelProps) {
  const [formActivity, setFormActivity] =
    useState<FormActivity>(null);

  const [activities, setActivities] =
    useState<ActivityRecord[]>([]);

  const [isLoading, setIsLoading] =
    useState(false);

  const editingActivity =
    formActivity === "new" ||
    formActivity === null
      ? undefined
      : formActivity;

  useEffect(() => {
    setFormActivity(null);
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedDate) {
      setActivities([]);
      return;
    }

    const activeDate = selectedDate;
    let isCurrent = true;

    async function loadActivities() {
      setIsLoading(true);

      try {
        const savedActivities =
          await getActivitiesByDate(activeDate);

        if (isCurrent) {
          setActivities(savedActivities);
        }
      } catch (error) {
        console.error(
          "Unable to load evidence:",
          error,
        );

        if (isCurrent) {
          setActivities([]);
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void loadActivities();

    return () => {
      isCurrent = false;
    };
  }, [selectedDate]);

  if (!selectedDate) {
    return null;
  }

  const activeDate = selectedDate;

  async function refreshActivities() {
    const savedActivities =
      await getActivitiesByDate(activeDate);

    setActivities(savedActivities);
  }

  async function handleSaved() {
    await refreshActivities();
    setFormActivity(null);
  }

  async function handleDelete(
    activity: ActivityRecord,
  ) {
    const confirmed = window.confirm(
      "Delete this evidence record? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    await deleteActivity(activity.id);
    await refreshActivities();

    if (editingActivity?.id === activity.id) {
      setFormActivity(null);
    }
  }

  const notesCount = activities.filter(
    (activity) => activity.notes.trim(),
  ).length;

  const sortedActivities = activities
    .slice()
    .sort(
      (activityA, activityB) =>
        new Date(activityA.eventAt).getTime() -
        new Date(activityB.eventAt).getTime(),
    );

  return (
    <div
      className="day-panel-backdrop"
      onClick={onClose}
    >
      <aside
        className="day-panel"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="day-panel-handle" />

        <div className="day-panel-header">
          <button
            type="button"
            className="icon-button"
            onClick={() =>
              onSelectDate(
                previousDay(activeDate),
              )
            }
            aria-label="Previous day"
          >
            ←
          </button>

          <h2>
            {new Date(
              `${activeDate}T12:00:00`,
            ).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h2>

          <button
            type="button"
            className="icon-button"
            onClick={() =>
              onSelectDate(nextDay(activeDate))
            }
            aria-label="Next day"
          >
            →
          </button>
        </div>

        <section className="info-card">
          <span className="info-label">
            Ordered
          </span>

          <strong className="info-value">
            {selectedBlock
              ? `Client ${selectedBlock.client}`
              : "No assignment"}
          </strong>
        </section>

        <section className="info-card">
          <span className="info-label">
            Actual
          </span>

          <strong className="info-value">
            {isLoading
              ? "Loading..."
              : activities.length > 0
                ? `${activities.length} recorded`
                : "Pending"}
          </strong>
        </section>

        <section className="info-card">
          <span className="info-label">
            Notes
          </span>

          <strong className="info-value">
            {isLoading
              ? "Loading..."
              : `${notesCount} notes`}
          </strong>
        </section>

        <section className="evidence-timeline">
          <h3>Evidence Timeline</h3>

          {isLoading ? (
            <p className="empty-timeline">
              Loading evidence...
            </p>
          ) : sortedActivities.length === 0 ? (
            <p className="empty-timeline">
              No evidence recorded for this day.
            </p>
          ) : (
            sortedActivities.map(
              (activity) => (
                <article
                  key={activity.id}
                  className={`evidence-item evidence-item-${activity.category}`}
                >
                  <div className="evidence-time">
                    {formatTime(activity.eventAt)}
                  </div>

                  <div className="evidence-content">
                    <div className="evidence-heading">
                      <div>
                        <strong className="evidence-title">
                          {formatActivityType(
                            activity.type,
                          )}
                        </strong>

                        <span className="evidence-category-text">
                          {formatCategory(
                            activity.category,
                          )}
                        </span>
                      </div>

                      <div className="evidence-actions">
                        <button
                          type="button"
                          className="evidence-icon-button"
                          aria-label="Edit evidence"
                          title="Edit"
                          onClick={() => {
                            setFormActivity(
                              activity,
                            );
                          }}
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          className="evidence-icon-button evidence-delete-icon"
                          aria-label="Delete evidence"
                          title="Delete"
                          onClick={() => {
                            void handleDelete(
                              activity,
                            );
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <ActivitySummary
                      activity={activity}
                    />

                    {activity.notes.trim() && (
                      <p className="evidence-notes">
                        {activity.notes}
                      </p>
                    )}
                  </div>
                </article>
              ),
            )
          )}
        </section>

        {formActivity !== null ? (
          <EvidenceForm
            key={
              editingActivity?.id ??
              "new-evidence"
            }
            selectedDate={activeDate}
            existingActivity={
              editingActivity
            }
            onSaved={() => {
              void handleSaved();
            }}
            onCancel={() => {
              setFormActivity(null);
            }}
          />
        ) : (
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setFormActivity("new");
            }}
          >
            Add Evidence
          </button>
        )}
      </aside>
    </div>
  );
}

function ActivitySummary({
  activity,
}: {
  activity: ActivityRecord;
}) {
  const exchange =
    activity.details?.exchange;

  const communication =
    activity.details?.communication;

  const expense =
    activity.details?.expense;

  if (
    activity.category === "exchange" &&
    exchange
  ) {
    return (
      <div className="evidence-summary">
        {exchange.scheduledFrom &&
          exchange.scheduledTo && (
            <p>
              <span>Scheduled:</span>{" "}
              {formatClient(
                exchange.scheduledFrom,
              )}{" "}
              →{" "}
              {formatClient(
                exchange.scheduledTo,
              )}
            </p>
          )}

        {exchange.actualPerformedBy && (
          <p>
            <span>Actual:</span>{" "}
            {formatClient(
              exchange.actualPerformedBy,
            )}{" "}
            performed the exchange
          </p>
        )}

        {exchange.status && (
          <p>
            <span>Status:</span>{" "}
            {formatText(exchange.status)}
          </p>
        )}

        {typeof exchange.delayMinutes ===
          "number" &&
          exchange.delayMinutes > 0 && (
            <p>
              <span>Delay:</span>{" "}
              {exchange.delayMinutes} minutes
            </p>
          )}

        {exchange.location && (
          <p>
            <span>Location:</span>{" "}
            {exchange.location}
          </p>
        )}
      </div>
    );
  }

  if (
    activity.category ===
      "communication" &&
    communication
  ) {
    return (
      <div className="evidence-summary">
        {communication.from && (
          <p>
            <span>From:</span>{" "}
            {formatClient(
              communication.from,
            )}
          </p>
        )}

        {communication.to && (
          <p>
            <span>To:</span>{" "}
            {formatClient(communication.to)}
          </p>
        )}

        {communication.method && (
          <p>
            <span>Method:</span>{" "}
            {formatText(
              communication.method,
            )}
          </p>
        )}

        {communication.subject && (
          <p>
            <span>Subject:</span>{" "}
            {communication.subject}
          </p>
        )}
      </div>
    );
  }

  if (
    activity.category === "expense" &&
    expense
  ) {
    return (
      <div className="evidence-summary">
        {typeof expense.amount ===
          "number" && (
          <p className="evidence-amount">
            {formatCurrency(
              expense.amount,
              expense.currency,
            )}
          </p>
        )}

        {expense.paidBy && (
          <p>
            <span>Paid by:</span>{" "}
            {formatClient(expense.paidBy)}
          </p>
        )}

        {expense.expenseFor && (
          <p>
            <span>For:</span>{" "}
            {expense.expenseFor}
          </p>
        )}

        {expense.expenseStatus && (
          <p>
            <span>Status:</span>{" "}
            {formatText(
              expense.expenseStatus,
            )}
          </p>
        )}

        {expense.reimbursementStatus && (
          <p>
            <span>Reimbursement:</span>{" "}
            {formatText(
              expense.reimbursementStatus,
            )}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="evidence-summary">
      <p>
        <span>Related to:</span>{" "}
        {formatClient(activity.client)}
      </p>
    </div>
  );
}

function formatTime(eventAt: string) {
  return new Date(
    eventAt,
  ).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatActivityType(
  type: ActivityRecord["type"],
) {
  return formatText(type);
}

function formatCategory(
  category: ActivityRecord["category"],
) {
  return category === "note"
    ? "General note"
    : formatText(category);
}

function formatClient(
  client: ActivityRecord["client"],
) {
  return client === "client-a"
    ? "Client A"
    : "Client B";
}

function formatText(value: string) {
  return value
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatCurrency(
  amount: number,
  currency = "USD",
) {
  try {
    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency,
      },
    ).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}