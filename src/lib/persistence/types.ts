import type { ComparisonResult, UserBillData, UserPreferences } from "@/types/energy";

export type AccountId = string;

export interface AccountRecord {
  id: AccountId;
  email: string | null;
  plan: "free" | "premium";
  createdAt: string;
}

export interface MonitoringRecord {
  accountId: AccountId;
  billData: UserBillData | null;
  preferences: UserPreferences | null;
  lastComparison: ComparisonResult | null;
  nextScanAt: string;
  updatedAt: string;
}

export interface ActivityEvent {
  accountId: AccountId;
  kind: "scan" | "anomaly" | "switch_validated" | "new_offer";
  title: string;
  detail: string;
  occurredAt: string;
}
