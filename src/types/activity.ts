export type EvidenceCategory =
  | "exchange"
  | "communication"
  | "expense"
  | "photo"
  | "document"
  | "school"
  | "medical"
  | "note";

export type ActivityType =
  | "pickup"
  | "dropoff"
  | "missed-exchange"
  | "late-pickup"
  | "early-dropoff"
  | "text-message"
  | "email"
  | "phone-call"
  | "expense"
  | "school-event"
  | "medical-event"
  | "photo"
  | "document"
  | "note";

export type ActivityClient =
  | "client-a"
  | "client-b";

export type EntryMethod =
  | "live"
  | "historical-import"
  | "manual-reconstruction";

export type SourceType =
  | "sms"
  | "email"
  | "whatsapp"
  | "phone-call"
  | "calendar"
  | "photo"
  | "document"
  | "receipt"
  | "other";

export type ReviewStatus =
  | "draft"
  | "confirmed"
  | "needs-review";

export type ExchangeStatus =
  | "completed"
  | "late"
  | "missed"
  | "cancelled"
  | "changed";

export type CommunicationMethod =
  | "sms"
  | "email"
  | "whatsapp"
  | "phone-call"
  | "in-person"
  | "other";

export type ExpenseStatus =
  | "paid"
  | "unpaid"
  | "partially-paid"
  | "reimbursement-requested"
  | "reimbursed"
  | "disputed";

export type ReimbursementStatus =
  | "not-applicable"
  | "not-requested"
  | "requested"
  | "partially-reimbursed"
  | "reimbursed"
  | "disputed";

export interface ExchangeDetails {
  scheduledFrom?: ActivityClient;
  scheduledTo?: ActivityClient;

  actualPerformedBy?: ActivityClient;
  actualReceivedBy?: ActivityClient;

  status?: ExchangeStatus;

  scheduledTime?: string;
  actualTime?: string;

  delayMinutes?: number;
  location?: string;
}

export interface CommunicationDetails {
  from?: ActivityClient;
  to?: ActivityClient;

  method?: CommunicationMethod;
  subject?: string;

  requiresResponse?: boolean;
  responseReceived?: boolean;
}

export interface ExpenseDetails {
  amount?: number;
  currency?: string;

  paidBy?: ActivityClient;
  expenseFor?: string;

  expenseStatus?: ExpenseStatus;
  reimbursementStatus?: ReimbursementStatus;

  reimbursementAmount?: number;
  dueDate?: string;
  merchant?: string;
}

export interface SchoolDetails {
  initiatedBy?: ActivityClient;
  schoolName?: string;
  action?: string;
  deadline?: string;
}

export interface MedicalDetails {
  initiatedBy?: ActivityClient;
  provider?: string;
  reason?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
}

export interface PhotoDetails {
  takenBy?: ActivityClient;
  location?: string;
  description?: string;
}

export interface DocumentDetails {
  documentType?: string;
  issuedBy?: string;
  documentDate?: string;
}

export interface ActivityDetails {
  exchange?: ExchangeDetails;
  communication?: CommunicationDetails;
  expense?: ExpenseDetails;
  school?: SchoolDetails;
  medical?: MedicalDetails;
  photo?: PhotoDetails;
  document?: DocumentDetails;
}

export interface ActivityRecord {
  id: string;

  category: EvidenceCategory;

  eventAt: string;
  sourceAt?: string;

  createdAt: string;
  updatedAt: string;

  /*
   * These fields remain for compatibility with existing records
   * and the current form.
   */
  type: ActivityType;
  client: ActivityClient;
  notes: string;

  /*
   * New structured information for each evidence category.
   */
  details?: ActivityDetails;

  entryMethod: EntryMethod;
  sourceType?: SourceType;
  sourceFiles: string[];

  isApproximate: boolean;
  reviewStatus: ReviewStatus;
}