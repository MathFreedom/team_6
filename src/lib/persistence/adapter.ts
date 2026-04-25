import type { AccountId, AccountRecord, ActivityEvent, MonitoringRecord } from "./types";

export interface PersistenceAdapter {
  getAccount(id: AccountId): Promise<AccountRecord | null>;
  upsertAccount(record: AccountRecord): Promise<AccountRecord>;

  getMonitoring(accountId: AccountId): Promise<MonitoringRecord | null>;
  upsertMonitoring(record: MonitoringRecord): Promise<MonitoringRecord>;

  listActivity(accountId: AccountId, limit?: number): Promise<ActivityEvent[]>;
  recordActivity(event: ActivityEvent): Promise<void>;
}
