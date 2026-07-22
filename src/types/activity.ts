export type ActivityType =
  | "pickup"
  | "dropoff"
  | "missed-exchange"
  | "late-pickup"
  | "early-dropoff"
  | "note";

export type ActivityClient = "client-a" | "client-b";

export type EntryMethod =
  | "live"
  | "historical-import"
  | "manual-reconstruction";

export type SourceType =
  | "sms"
  | "email"
  | "whatsapp"
  | "calendar"
  | "photo"
  | "document";

export type ReviewStatus =
  | "draft"
  | "confirmed"
  | "needs-review";

export interface ActivityRecord {
  id: string;

  eventAt: string;
  sourceAt?: string;

  createdAt: string;
  updatedAt: string;

  type: ActivityType;
  client: ActivityClient;
  notes: string;

  entryMethod: EntryMethod;
  sourceType?: SourceType;
  sourceFiles: string[];

  isApproximate: boolean;
  reviewStatus: ReviewStatus;
}