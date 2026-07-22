import Dexie, { type Table } from "dexie";
import type { ActivityRecord } from "../types/activity";

class EvidenceDatabase extends Dexie {
  activities!: Table<ActivityRecord, string>;

  constructor() {
    super("ClientCalendarDatabase");

    this.version(1).stores({
      activities:
        "id, eventAt, type, client, createdAt, updatedAt, reviewStatus",
    });
  }
}

export const db = new EvidenceDatabase();
