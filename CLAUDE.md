# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

WattSwitch — a Next.js 15 (App Router) PWA for the Paris Fintech Hackathon 2026. It helps a French household check whether they overpay for electricity, compares them against a curated dataset of French offers, then simulates a switch with a human-in-the-loop autonomy level (`Alerte`, `Assistant`, `Autopilot`).

User-facing copy is in **French**; keep all UI strings, recommendation text, and error messages in French.

## Commands

```bash
npm run dev        # Next dev server
npm run build      # production build
npm run start      # serve production build
npm run typecheck  # tsc --noEmit (no test runner configured)
```

There is no test framework, lint script, or formatter configured — `tsc --noEmit` is the only static check.

## Environment

Copy `.env.example` to `.env.local`:

- `ANTHROPIC_API_KEY` — required for live Claude calls (OCR + decision copy).
- `ANTHROPIC_MODEL` — defaults to `claude-sonnet-4-5-latest` if unset.
- `DEMO_FALLBACK=true` — forces deterministic/mocked responses even if a key is set. **The agents check this on every call** — leaving it true guarantees a stable demo path that never hits the network.

## Architecture

### Agent orchestration (`src/lib/agents/`)

The user journey is a pipeline of agents driven by `orchestrator.ts`:

1. **onboarding.agent** — produces `UserBillData` either from `runEnedisOnboarding()` (returns `sampleLinkyProfile` mock) or `runOcrOnboarding(file)` (Claude vision over an image/PDF, with a hardcoded fallback when no key / `DEMO_FALLBACK=true`).
2. **watcher.agent** — pure deterministic: loads `src/data/offers.fr.json`, validates with Zod, runs `scoreOffers` to produce `RankedOffer[]` and `filteredOut[]`.
3. **decision.agent** — calls Claude for the French recommendation copy. Always builds a deterministic fallback first via `buildDeterministicDecision` and returns it if the LLM call fails or `DEMO_FALLBACK=true`. Enforces savings guardrails (`MINIMUM_SAVINGS_EUR=80`, `GREEN_OVERRIDE_MINIMUM_SAVINGS_EUR=30` from `constants.ts`) — these gate `switch` vs `wait`.
4. **executor.agent** — simulated switch only (`src/lib/mocks/switch.mock.ts`). No real provider integration.

API routes in `src/app/api/{compare,connect-enedis,extract,switch}/route.ts` are thin wrappers: parse with Zod schemas from `src/lib/schemas/`, call the orchestrator, return JSON.

### LLM call shape

All Claude calls go through `src/lib/anthropic/client.ts` (`getAnthropicClient` returns `null` when no key). Prompts live in `src/lib/anthropic/prompts.ts`; responses are JSON-extracted via `parsers.ts` (`extractJsonFromText`) and re-validated with the matching Zod schema before use. Every agent must keep a deterministic fallback so demos work offline.

### Client state (`src/lib/store/journey-store.ts`)

Single Zustand store `useJourneyStore` persisted to `localStorage` under key `wattswitch-journey`. It holds `billData`, `preferences`, `comparison`, `switchState`, and the pending onboarding source. `pendingFile` is intentionally **not** persisted (it's a `File`). Use `useJourneyHydrated` from `use-journey-hydrated.ts` before reading persisted state in client components to avoid hydration mismatch.

### Page flow

`/` → `/connect` → `/analyzing` → `/preferences` → `/results` → `/switch` → `/success`. Each page reads/writes the journey store; navigation is driven by store state, not URL params.

### Types and schemas

`src/types/energy.ts` is the single source of truth for domain types (`UserBillData`, `ElectricityOffer`, `UserPreferences`, `ComparisonResult`, `SwitchSimulationState`, autonomy/action unions). Zod schemas in `src/lib/schemas/` mirror these and are the gate at API and LLM boundaries — when adding a field, update the type and the schema together.

### UI

shadcn/ui-style components in `src/components/ui/` (configured via `components.json`). Feature components are grouped by route folder (`landing/`, `onboarding/`, `preferences/`, `results/`, `switch/`, `feedback/`, `pwa/`). Tailwind v4 with PostCSS; `@/*` resolves to `src/*`.

### PWA

`src/app/manifest.ts` defines the manifest; a minimal service worker lives under `public/`. The app is meant to be installable but the SW is intentionally minimal for the demo.

## Conventions worth keeping

- Money: store euros as plain numbers; annual cost is the canonical unit, monthly is derived via `monthlySavingsFromAnnual`.
- Offer dataset edits go in `src/data/offers.fr.json` only; the watcher reloads it at module init and validates every entry — a malformed entry crashes startup, which is intentional.
- Tariff options: `BASE | HP_HC | TEMPO | EJP`. When `tariffOption === "HP_HC"`, both `pricing.hpHc` and HP/HC consumption fields must be present; the OCR normalizer throws otherwise.
