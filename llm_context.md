# LLM Context - Autonomous Financial Optimization Agent

## Purpose of This File

This file is not a README.
It is a reusable context document meant to be pasted into LLM prompts so the model immediately understands the project, its MVP scope, constraints, and expected direction.

Use it as a base context before asking an LLM to help with:

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

**Project name:** Autonomous Financial Optimization Agent

**MVP short description:**  
An AI-powered web app that helps users optimize their electricity expenses by analyzing electricity bills, extracting contract data, comparing available offers, estimating savings, and recommending or simulating a switch.

**Current product format:**  
A lightweight web app accessible through a simple shared link.

**Core MVP promise:**  
Upload your electricity bill once, and the system shows whether you are overpaying and what a better option could look like.

---

## MVP Scope

The MVP focuses only on **electricity bills**.

It does **not** try to fully cover:

- telecom
- internet
- insurance
- subscriptions
- all recurring financial expenses

Those categories belong to the long-term vision, not the current prototype.

The MVP should stay narrow, believable, and demoable.

---

## Long-Term Vision

The long-term goal is to build a personal autonomous financial agent that continuously monitors and optimizes all recurring expenses for a user.

In the future, the product could expand beyond electricity into telecom, subscriptions, insurance, and other recurring financial commitments.

For now, electricity is the entry point because it is easier to explain, more concrete, and better suited for a hackathon MVP.

---

## Problem Being Solved

Consumers often overpay for electricity because:

- they rarely switch providers
- electricity pricing is hard to understand
- contracts and offers are difficult to compare
- switching feels time-consuming and administrative

Existing comparison tools are limited because they are:

- one-time
- manual
- not proactive
- mostly informational

As a result, users leave savings unrealized.

---

## MVP Solution

The MVP is an AI-powered electricity optimization assistant delivered as a simple web app.

The system:

- lets the user upload an electricity bill
- extracts key structured data from the bill
- identifies the current provider and pricing details
- compares the current situation against better market offers
- estimates potential annual savings
- recommends whether the user should switch
- can simulate what an automated optimization flow would look like

For the MVP, recommendation and simulation are enough.
Full real-world switching can be partially mocked if needed.

---

## MVP Features

### 1. Electricity Bill Upload

The user uploads an electricity bill in PDF or image format.

### 2. Data Extraction

The system extracts important information such as:

- provider name
- tariff or pricing details
- estimated or stated consumption
- contract identifiers if available

### 3. Offer Comparison

The system compares the extracted bill data against alternative electricity offers.

### 4. Savings Estimation

The system estimates potential yearly savings if the user switched to a better offer.

### 5. AI Recommendation

The system produces:

- a recommendation
- a short explanation
- an estimated savings amount
- optionally a confidence score

### 6. Demo-Ready Execution Simulation

The MVP may simulate:

- a switch recommendation flow
- a user approval step
- a mocked provider change

This is acceptable in hackathon mode as long as it is clearly framed as a prototype.

### 7. Simple Dashboard or Results Page

The app should display:

- current provider summary
- extracted bill information
- best detected offer
- estimated savings
- recommendation outcome

The interface should feel clean, fast, and trustworthy.

---

## Product Format

This is **not** a native mobile app for the MVP.

It should be framed as:

- a lightweight web app
- easy to open through a link
- simple to demo during a pitch
- faster to build than a full mobile product

If needed, it can later evolve into:

- a full web platform
- a mobile app
- an automated recurring optimization agent

---

## Architecture Direction

The product can still be framed with a multi-agent logic, even in MVP form.

Suggested agent roles:

- **Onboarding Agent**: reads and structures electricity bill data
- **Watcher Agent**: compares the extracted profile against available electricity offers
- **Decision Agent**: determines whether switching appears worthwhile
- **Executor Agent**: simulates or initiates the switching flow

A central orchestrator coordinates the workflow.

For the MVP, this architecture can be partly conceptual and partly implemented.

---

## User Flow

1. User opens the web app via a shared link.
2. User uploads an electricity bill.
3. System extracts contract and pricing data.
4. System compares current plan with available alternatives.
5. System estimates potential annual savings.
6. System returns a recommendation with explanation.
7. Optional: system shows a simulated switch or approval flow.

The experience should be simple, fast, and understandable in a short live demo.

---

## Target Users

### MVP Target

- individual consumers paying household electricity bills

### Secondary Users

- busy professionals
- budget-conscious households
- early adopters of AI financial tools

### Future Expansion

- consumers optimizing telecom and subscriptions
- small businesses with recurring utility costs

---

## Business Model

Possible future revenue streams:

- provider acquisition commissions
- subscription fee for continuous optimization
- premium automation features

For the MVP, the goal is not to fully prove monetization, but to show that the product could become a real business.

---

## Key Differentiation

Compared to a traditional electricity comparison tool, this product aims to be:

- more proactive
- more automated
- more execution-oriented
- more intelligent in how it explains recommendations

Even if the MVP is narrower than the long-term vision, it should still suggest the evolution from:

- comparison tool

to:

- autonomous financial optimization agent

---

## Hackathon Context

This project is being developed in a hackathon context.

That means:

- some provider integrations may be mocked
- some offer data may be manually curated or simplified
- switching steps may be simulated
- legal and operational details do not need to be production-ready

What matters most in the prototype:

- clear user problem
- obvious AI contribution
- visible value for the user
- believable workflow
- strong demo clarity

---

## Guidance for LLMs

When helping on this project, optimize for:

- a focused MVP around electricity bills only
- practical hackathon decisions
- outputs that are realistic to prototype quickly
- strong demoability
- clear user value
- clean product positioning
- simple web app flows rather than heavy platform design

Avoid:

- expanding the MVP to too many verticals
- suggesting a full native app unless explicitly requested
- overengineering backend complexity
- generic chatbot ideas with weak fintech value
- pretending mocked flows are already production-ready

---

## Preferred Positioning

This project should currently be framed as:

- a B2C AI fintech MVP
- focused on electricity bill optimization
- delivered as a lightweight web app via link
- centered on bill extraction, offer comparison, savings estimation, and recommendation
- expandable later into a broader autonomous recurring expense agent

---

## Reusable Prompt Block

Copy and paste the block below into your LLM when you need project-aware help:

```text
You are helping me build a project called Autonomous Financial Optimization Agent.

Current MVP scope:
This MVP focuses only on electricity bills. It is a lightweight web app that users can access through a simple shared link. The goal is not to build a full native app or a full recurring-expense platform yet.

Product summary:
Users upload an electricity bill. The system extracts key contract and pricing data, identifies the current provider, compares available electricity offers, estimates yearly savings, and recommends whether switching would be beneficial. Some switching or execution flows may be simulated for the prototype.

MVP features:
- Electricity bill upload
- AI-powered bill parsing and data extraction
- Offer comparison
- Savings estimation
- Recommendation with explanation
- Optional simulated switch flow
- Simple dashboard or results page

Architecture direction:
- Onboarding Agent
- Watcher Agent
- Decision Agent
- Executor Agent
- Central orchestrator

Important constraints:
- Focus only on electricity for now
- Keep the scope hackathon-friendly
- Prefer a lightweight web app over a mobile app
- Some integrations may be mocked or simplified
- Prioritize demoability, clarity, and believable user value

Long-term vision:
Later, the product can expand into telecom, subscriptions, and broader recurring expense optimization, but that is not the MVP.

When answering:
- stay specific to this electricity MVP
- avoid unnecessary complexity
- keep suggestions practical and buildable fast
- preserve the long-term autonomous agent vision without bloating the MVP
```

---

## Short Version

If you only want a compact context snippet, use this:

```text
Autonomous Financial Optimization Agent is currently a B2C AI fintech MVP focused only on electricity bills. The product is a lightweight web app accessible through a simple link. Users upload an electricity bill, the system extracts contract and pricing data, compares market offers, estimates potential yearly savings, and recommends whether switching would make sense. The prototype may simulate parts of the switching flow. The long-term vision is broader recurring expense automation, but the MVP should stay tightly focused on electricity, demoability, and clear user value.
```
