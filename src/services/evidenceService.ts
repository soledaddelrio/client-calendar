import { db } from "./database";
import type { ActivityRecord } from "../types/activity";

export async function getActivities(): Promise<ActivityRecord[]> {
  return db.activities.orderBy("eventAt").toArray();
}

export async function getActivitiesByDate(
  date: string,
): Promise<ActivityRecord[]> {
  const start = `${date}T00:00`;
  const end = `${date}T23:59:59`;

  return db.activities
    .where("eventAt")
    .between(start, end, true, true)
    .toArray();
}

export async function getActivity(
  id: string,
): Promise<ActivityRecord | undefined> {
  return db.activities.get(id);
}

export async function addActivity(
  activity: ActivityRecord,
): Promise<void> {
  await db.activities.add(activity);
}

export async function updateActivity(
  activity: ActivityRecord,
): Promise<void> {
  await db.activities.put(activity);
}

export async function deleteActivity(
  id: string,
): Promise<void> {
  await db.activities.delete(id);
}