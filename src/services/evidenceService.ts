import type { ActivityRecord } from "../types/activity";

const activities: ActivityRecord[] = [];

export function getActivities(): ActivityRecord[] {
  return activities;
}

export function getActivitiesByDate(date: string): ActivityRecord[] {
  return activities.filter(activity =>
    activity.eventAt.startsWith(date)
  );
}

export function getActivity(id: string): ActivityRecord | undefined {
  return activities.find(activity => activity.id === id);
}

export function addActivity(activity: ActivityRecord): void {
  activities.push(activity);
}

export function updateActivity(updated: ActivityRecord): void {
  const index = activities.findIndex(a => a.id === updated.id);

  if (index >= 0) {
    activities[index] = updated;
  }
}

export function deleteActivity(id: string): void {
  const index = activities.findIndex(a => a.id === id);

  if (index >= 0) {
    activities.splice(index, 1);
  }
}