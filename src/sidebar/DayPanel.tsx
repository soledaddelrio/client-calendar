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

  const isRecording = formActivity !== null;

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

  async function handleSaved() {
    const savedActivities =
      await getActivitiesByDate(activeDate);

    setActivities(savedActivities);
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

    const savedActivities =
      await getActivitiesByDate(activeDate);

    setActivities(savedActivities);

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
              No evidence recorded for this
              day.
            </p>
          ) : (
            sortedActivities.map(
              (activity) => (
                <article
                  key={activity.id}
                  className="evidence-item"
                >
                  <div className="evidence-time">
                    {new Date(
                      activity.eventAt,
                    ).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "numeric",
                        minute: "2-digit",
                      },
                    )}
                  </div>

                  <div className="evidence-content">
                    <strong className="evidence-title">
                      {activity.type
                        .replaceAll("-", " ")
                        .replace(
                          /\b\w/g,
                          (letter) =>
                            letter.toUpperCase(),
                        )}
                    </strong>

                    <span className="evidence-client">
                      {activity.client ===
                      "client-a"
                        ? "Client A"
                        : "Client B"}
                    </span>

                    <div className="evidence-actions">
                      <button
                        type="button"
                        className="evidence-edit-button"
                        onClick={() => {
                          setFormActivity(
                            activity,
                          );
                        }}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="evidence-delete-button"
                        onClick={() => {
                          void handleDelete(
                            activity,
                          );
                        }}
                      >
                        Delete
                      </button>
                    </div>

                    {activity.notes.trim() && (
                      <p>{activity.notes}</p>
                    )}
                  </div>
                </article>
              ),
            )
          )}
        </section>




        {isRecording ? (
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