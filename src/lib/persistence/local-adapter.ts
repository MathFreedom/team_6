import type { PersistenceAdapter } from "./adapter";
import type { AccountId, AccountRecord, ActivityEvent, MonitoringRecord } from "./types";

const ACCOUNTS_KEY = "nova.persistence.accounts";
const MONITORING_KEY = "nova.persistence.monitoring";
const ACTIVITY_KEY = "nova.persistence.activity";

function readMap<T>(key: string): Record<string, T> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, T>) : {};
  } catch {
    return {};
  }
}

function writeMap<T>(key: string, value: Record<string, T>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const localAdapter: PersistenceAdapter = {
  async getAccount(id) {
    return readMap<AccountRecord>(ACCOUNTS_KEY)[id] ?? null;
  },
  async upsertAccount(record) {
    const map = readMap<AccountRecord>(ACCOUNTS_KEY);
    map[record.id] = record;
    writeMap(ACCOUNTS_KEY, map);
    return record;
  },
  async getMonitoring(accountId: AccountId) {
    return readMap<MonitoringRecord>(MONITORING_KEY)[accountId] ?? null;
  },
  async upsertMonitoring(record) {
    const map = readMap<MonitoringRecord>(MONITORING_KEY);
    map[record.accountId] = record;
    writeMap(MONITORING_KEY, map);
    return record;
  },
  async listActivity(accountId, limit = 20) {
    const map = readMap<ActivityEvent[]>(ACTIVITY_KEY);
    return (map[accountId] ?? []).slice(0, limit);
  },
  async recordActivity(event) {
    const map = readMap<ActivityEvent[]>(ACTIVITY_KEY);
    const list = map[event.accountId] ?? [];
    map[event.accountId] = [event, ...list].slice(0, 100);
    writeMap(ACTIVITY_KEY, map);
  },
};
