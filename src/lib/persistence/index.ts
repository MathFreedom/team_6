import type { PersistenceAdapter } from "./adapter";
import { localAdapter } from "./local-adapter";

// Single seam for swapping persistence backends.
// Today: localStorage adapter (client-side only, demo-grade).
// Roadmap: Postgres + auth provider (NextAuth / Clerk / Supabase) — replace
// the export below with the server adapter once the stack is chosen.
export const persistence: PersistenceAdapter = localAdapter;

export type { PersistenceAdapter } from "./adapter";
export type { AccountId, AccountRecord, ActivityEvent, MonitoringRecord } from "./types";
