# LLM Context - WattSwitch

## Purpose of This File

This file is not a README.
It is a reusable context document meant to be pasted into LLM prompts so the model immediately understands the project, its MVP scope, constraints, architecture, pitch angle, and repo truth.

Use it as base context before asking an LLM to help with:

- product design
- feature ideation
- UI/UX
- architecture
- agent workflows
- prompt design
- pitch writing
- demo scripting
- business model thinking
- hackathon prioritization

---

## Project Identity

**Product name:** WattSwitch

**Tagline:**  
"Tu connectes ton contrat une fois, on optimise pour la vie."

**MVP short description:**  
An AI-powered PWA that helps French consumers optimize their electricity bills by extracting contract data from a bill or a mocked Linky flow, comparing available market offers, estimating savings, and recommending or simulating an autonomous provider switch.

**Current product format:**  
A lightweight installable PWA, mobile-friendly, accessible through a shared link, demo-ready.

**Core MVP promise:**  
Get from onboarding to savings visibility to simulated switch in under 60 seconds.

---

## Current Repo Truth

This section reflects the **actual implementation currently present in the repository** and should override older aspirational assumptions if they conflict.

- The app is implemented as a **Next.js App Router PWA in TypeScript**
- The current user flow is live end-to-end:
  `/` -> `/connect` -> `/analyzing` -> `/preferences` -> `/results` -> `/switch` -> `/success`
- **Enedis is mocked in the current prototype** for demo reliability; there is no live Enedis sandbox OAuth integration in this repo
- **OCR uses Claude via the Anthropic SDK**, with a demo fallback mode when API access is unavailable
- Offer comparison is **deterministic in code** using a curated French electricity offers dataset
- The LLM is used for:
  - OCR extraction
  - recommendation wording / decision explanation
- **No database is used in the MVP implementation**
- State is stored client-side with persisted local state
- Switch execution is fully simulated
- Important guardrails already implemented:
  - a recommendation marked `wait` cannot be switched
  - persisted preferences rehydrate correctly after reload
  - incomplete OCR bills without usable pricing are rejected instead of producing a fake `0 EUR` current bill

---

## Hackathon Context

### Event

**Paris Fintech Hackathon 2026** - "Solve with AI"  
Organized by Sciences Po AI (SpY), ASES France (Stanford x HEC Paris), Google Developer Group Epita.

- **Date:** April 25-26, 2026
- **Location:** HEC Paris, Jouy-en-Josas
- **Duration:** 24 hours
- **Team size:** 5 people
- **Participants:** about 150 selected students
- **Tracks:** B2C, B2B, B2G

### Judging Criteria

| Criterion | Weight |
|---|---|
| Business Viability | 30% |
| Technical Execution | 25% |
| Innovation & Originality | 20% |
| AI Integration | 15% |
| Pitch & Presentation | 10% |

### Submission Requirements

1. Public GitHub repo with timestamped commits within the 24h window
2. README
3. Pitch deck PDF, max 10 slides

---

## MVP Scope

The MVP focuses **only on electricity bills**.

It does **not** cover:

- telecom
- internet
- insurance
- subscriptions

Those belong to the long-term vision.

---

## Problem Being Solved

French consumers massively overpay for electricity because:

- only about 22% have ever switched providers
- switching is free and legally simple, but inertia is high
- electricity pricing is hard to compare
- current competitors are mostly one-shot manual comparators
- nobody really offers a credible autonomous optimization agent for this category

**Market size framing:** 38M French households x about 300 EUR average annual savings potential = more than EUR11B in unrealized purchasing power.

---

## Long-Term Vision

Build a personal autonomous financial agent that continuously monitors and optimizes recurring expenses:

- electricity
- telecom
- subscriptions
- insurance

For now, electricity is the MVP entry point because:

- switching is legally frictionless in France
- the value proposition is universal and easy to understand
- the market is large
- Linky/Enedis is a credible long-term data source

---

## MVP Solution

WattSwitch is an AI-powered electricity optimization assistant delivered as a PWA.

The system:

1. Lets the user choose between two onboarding paths:
   - **Primary path - mocked Enedis connect:** a simulated Enedis / Linky flow returns a realistic household profile for a stable demo
   - **Fallback path - bill upload + OCR:** Claude extracts provider, tariff, consumption, PDL, and contract reference from a PDF or image
2. Structures the retrieved or extracted data into a normalized household energy profile
3. Lets the user define optimization preferences
4. Compares the current plan against available market offers using those preferences
5. Estimates potential annual savings
6. Recommends whether the user should switch, with a natural language explanation tailored to the user's priorities
7. Simulates what an automated switch would look like with a human-in-the-loop confirmation flow

**Demo wow moment:** 60 secondes entre vos données Linky simulées et vos économies affichées à l'écran.

---

## MVP Features

### 1. Mocked Enedis Connection

The user triggers a mocked Enedis / EDF connection flow that simulates a successful Linky retrieval and returns:

- annual consumption
- tariff option
- contract power
- PDL
- current provider pricing structure

This is the preferred stage-demo path because it is fast and reliable.

### 2. Bill Upload + OCR

If the user prefers not to use the mocked Linky path, they upload a bill in PDF or image format.

Claude extracts:

- provider name
- tariff type and pricing
- annual or monthly consumption
- PDL
- contract reference

If pricing data cannot be extracted reliably, the bill must be rejected rather than silently priced at zero.

### 3. User Preferences

After retrieval or OCR extraction, the user sets optimization preferences:

- **Energy type:** 100% renewable / mixed / no preference
- **Price priority:** cheapest possible / best value
- **Provider reputation:** minimum rating threshold
- **Tariff stability:** fixed price vs indexed price
- **Provider origin:** optional preference for French providers

These preferences feed the ranking and decision layer.

### 4. Offer Comparison

The system compares the normalized household profile against a curated French electricity offers dataset and ranks offers based on:

- compatibility
- annual cost
- user preferences
- trust / quality constraints

### 5. Savings Estimation

The system calculates:

- current annual cost
- projected annual cost with best alternative
- estimated yearly savings

### 6. AI Recommendation

The Decision Agent produces:

- a `switch` or `wait` recommendation
- a short natural-language explanation tied to the user's preferences
- an estimated savings amount
- a confidence score

Guardrails:

- no switch if savings are too low
- no switch below reputation threshold
- no switch if a strict user preference excludes the offer
- a `wait` result must not be switchable

### 7. Simulated Execution Flow

The user chooses a level of autonomy:

1. **Mode Alerte:** monitor + notify only
2. **Mode Assistant:** prepare everything, user confirms
3. **Mode Autopilot:** fully autonomous, opt-in only

For the demo, **Mode Assistant** is the default story.

### 8. Dashboard / Results Page

The dashboard shows:

- current provider summary
- extracted or retrieved household data
- selected preferences
- best detected offer
- estimated savings
- recommendation outcome
- simulated switch path

---

## Product Format

**PWA - not a native app.**

- accessible via shared link
- mobile-friendly
- installable
- fast to demo
- realistic to build in 24 hours

---

## Architecture

### Multi-Agent System

```text
ORCHESTRATOR
|- Onboarding Agent
|- Watcher Agent
|- Decision Agent
`- Executor Agent
```

**Onboarding Agent**

- Mock Enedis mode: returns a simulated Linky profile
- OCR mode: uploads bill, extracts data, normalizes structure

**Watcher Agent**

- loads curated offers
- filters according to user preferences
- calculates annual cost
- ranks valid offers

**Decision Agent**

- uses LLM reasoning and guardrails
- decides `switch` or `wait`
- produces explanation text

**Executor Agent**

- simulates switch flow and autonomy mode outcome

**Current implementation truth:** plain TypeScript orchestrator, no LangGraph or Mastra in the repo.

---

## Tech Stack

| Layer | Tool | Why |
|---|---|---|
| Front | Next.js + Tailwind + shadcn-style components | Fast setup, clean UI, PWA-ready |
| Agent orchestration | Plain TypeScript orchestrator | Simpler and safer for a 24h MVP |
| LLM | Claude Sonnet 4.5 | Structured extraction and recommendation wording |
| Data ingestion (primary) | Mock Enedis flow | Demo reliability |
| Data ingestion (fallback) | Anthropic SDK / Claude OCR | Reads real electricity bills |
| Data source | Curated offers dataset | Realistic and controllable |
| DB | None for MVP | Local persisted state is enough |
| Notifications | Optional future add-on | Nice-to-have only |

---

## User Flow

1. User opens the PWA
2. User chooses `Connecter Enedis` or `Importer ma facture`
3. System retrieves a mocked Linky profile or extracts data from the uploaded bill
4. User defines optimization preferences
5. System compares offers in a few seconds
6. System displays current annual cost, best alternative, and estimated savings
7. System explains the recommendation
8. User taps `Switcher pour moi`
9. System shows a recap and simulates the switch

Total flow target: under 60 seconds.

---

## Onboarding UX Direction

The onboarding should borrow the best interaction patterns from Duolingo without copying its childish tone.

### Core UX Thesis

WattSwitch should feel like a **mission launch**, not a comparator form.

Recommended framing:

- "Lancer mon diagnostic"
- "Activer mon agent"
- "Trouver mes économies en moins de 60 secondes"

The product should feel:

- fast
- competent
- slightly gamified
- premium enough for a money decision
- never cartoonish

### What To Reuse From Duolingo

- one main action per screen
- clear progress visibility
- immediate feedback
- card-based choices
- short direct copy
- satisfying reveal at the end

### What To Avoid

- fake streaks
- childish mascots
- over-gamification
- long forms
- generic fintech dashboard aesthetics

### Suggested Flow

1. **Landing**
   - Headline: "On peut vérifier si vous surpayez votre électricité en moins de 60 secondes."
   - CTA: "Lancer le diagnostic"
2. **Choose a Path**
   - Voie express: mocked Enedis
   - Voie manuelle: bill upload
3. **Live Analysis**
   - lecture du contrat
   - analyse de la consommation
   - construction du profil énergie
   - recherche d'offres plus avantageuses
4. **Preference Cards**
   - price
   - green energy
   - stability
   - reputation
   - provider origin
5. **Final Reveal**
   - large savings number
   - recommendation
   - explanation
   - switch CTA

### Best Gamification Lever

The best gamification mechanic is **autonomy level progression**:

- Niveau 1 - Alerte
- Niveau 2 - Assistant
- Niveau 3 - Autopilot

This is product-real, not fake reward design.

### Strategic Reason

The wow moment is:

**60 secondes entre des données d'énergie structurées, un profil construit automatiquement, et une économie claire affichée à l'écran.**

---

## Pitch Strategy

### Pitch Structure (5 min)

1. **Hook**  
   "Vous payez trop cher votre électricité. Tout le monde ici aussi. Et personne ne fait rien."
2. **Problem**  
   Very few households switch despite free switching and real savings potential.
3. **Solution**  
   WattSwitch is not a comparator. It is an autonomous agent that monitors, decides, and acts.
4. **Live Demo**  
   Onboarding -> comparison -> savings -> one-click simulated switch.
5. **Market / Competition**  
   Huge household market, low switching penetration, competitors are manual and opaque.
6. **Business Model**  
   User never pays; provider commission only.
7. **B2G Angle**  
   Same product can be used by municipalities or social services.
8. **Close**  
   "WattSwitch - zéro effort, économies visibles, décision assistée."

### Demo Wow Moments

1. **Must-have:** mocked Enedis launch -> Linky-like data on screen -> comparison -> savings number
2. **High impact:** switch recap -> confirmation -> success timeline
3. **Backup:** OCR path if needed

---

## Dual Track Positioning

### Primary: B2C

Consumers optimizing household electricity spend.

### Secondary: B2G

Municipalities and social services helping vulnerable households reduce energy costs.

---

## Business Model

**Core principle:** the user never pays.

| Revenue Stream | Model | Unit Economics |
|---|---|---|
| Provider acquisition commissions | Paid by the winning provider | EUR40-150 per lead |
| Future premium subscription | Continuous monitoring / broader optimization | Long-term only |

Pitch line:

**"Même modèle de revenus que Selectra et papernest - commission fournisseur - mais sans le biais."**

---

## Key Differentiators

| Existing Tools | WattSwitch |
|---|---|
| One-shot comparison | Continuous autonomous logic |
| Same ranking for everyone | Preference-weighted recommendation |
| Human call center switching | 3-tier autonomy model |
| Manual user effort | Fast guided onboarding |
| Opaque ranking | Explanation tied to user priorities |
| Informational only | Action-oriented simulated switch |

### WattSwitch vs papernest

| Dimension | papernest | WattSwitch |
|---|---|---|
| Price for user | Free but opaque | Free and transparent |
| Process | Human call center | Fast AI-first flow |
| Personalization | Weak | Strong |
| Transparency | Low | High |
| Speed | 15-30 min | About 60 seconds |
| Trust model | Advisor-led | User-selected autonomy |

Pitch-ready line:

**"papernest vous met en ligne avec un conseiller. WattSwitch vous montre toutes les offres, classées selon vos critères, en 60 secondes."**

---

## 24-Hour Hackathon Plan

### Team of 5 - Suggested Split

| Role | Focus |
|---|---|
| Front-end Lead | App Router flow, landing, results |
| Front-end Support + Design | components, responsive polish, loading states |
| Data Ingestion | mocked Enedis path, OCR path |
| Backend + Agent Logic | comparison engine, decision logic, API routes |
| Pitch + Demo + QA | pitch deck, demo script, rehearsal, fallback plan |

### Rough Timeline

- **Hour 0-2:** scaffold, schema, API keys, dataset
- **Hour 2-8:** core build
- **Hour 8-14:** integration
- **Hour 14-18:** polish and wow moments
- **Hour 18-22:** demo prep
- **Hour 22-24:** submission and final rehearsal

---

## French Market Context

Key facts to cite:

- switching electricity providers in France is free
- the old provider is automatically terminated by the new one
- no engagement period, unlimited switches
- Linky penetration is massive in France
- Enedis Data Connect is the official long-term data source direction
- only about 22% of French consumers have ever switched electricity provider
- ORIAS / broker requirements matter for production, not for hackathon MVP

---

## Regulatory Notes

- Acting on behalf of a user requires a mandate in production
- Frequent switching may require anti-spam / cooldown guardrails
- Enedis access requires explicit user consent in production
- Production registration with Enedis is post-hackathon roadmap, not MVP scope
- GDPR awareness matters: bill data should not be stored long-term in MVP

---

## Guidance for LLMs

When helping on this project, optimize for:

- focused electricity-only MVP
- practical 24-hour build decisions
- strong demoability
- visible user value in under 60 seconds
- PWA-friendly flows
- pitch-ready outputs
- repo truth over aspirational architecture

Avoid:

- expanding into telecom / insurance / subscriptions for MVP
- overengineering the backend
- pretending mocked flows are production-ready
- generic chatbot wrappers with weak product value
- suggestions that reduce demo reliability

---

## Reusable Prompt Block

```text
You are helping me build WattSwitch - an autonomous electricity optimization agent for the Paris Fintech Hackathon 2026.

Repo truth:
- Next.js App Router PWA in TypeScript
- mocked Enedis onboarding path
- Claude OCR fallback path
- deterministic offer comparison
- local persisted client state
- simulated switch flow
- wait recommendations must not be switchable

Current MVP scope:
- electricity only
- user chooses mocked Enedis or bill upload
- system structures contract data
- user sets preferences
- engine compares French electricity offers
- system estimates savings
- system recommends switch or wait
- system simulates assisted switch

Key differentiators:
- this is not a generic comparator
- recommendations are personalized
- recommendation explains why it matches the user's priorities
- flow is designed to feel fast, trustworthy, and demoable

Constraints:
- buildable in 24 hours by 5 people
- optimize for demo clarity and reliability
- no overengineering
- preserve the autonomous agent vision without bloating the MVP
```

## Short Version

```text
WattSwitch is a PWA for the Paris Fintech Hackathon 2026 that helps French consumers optimize electricity bills in under 60 seconds.

Current repo truth:
- mocked Enedis flow
- Claude OCR fallback
- deterministic comparison engine
- simulated switch
- no DB

MVP flow:
- connect mocked Enedis or upload a bill
- extract or retrieve contract data
- set preferences
- compare offers
- show savings
- confirm simulated switch

Core differentiation:
- personalized ranking
- transparent explanation
- 3-tier autonomy model
- fast and reliable demo flow
```
