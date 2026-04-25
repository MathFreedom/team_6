# AutoSwitch — Note de cadrage projet

## TL;DR

Un agent IA autonome qui connecte les contrats d'énergie et mobile d'un utilisateur **une seule fois**, surveille en continu le marché, et **switche automatiquement** vers la meilleure offre dès qu'elle apparaît. Économies moyennes visées : **300–500 €/an/foyer**, zéro effort utilisateur.

> *« Set and forget. Tu connectes une fois, on optimise pour la vie. »*

---

## 1. Pourquoi le marché français est parfait pour ce projet

| Levier | Réalité |
|---|---|
| Coût de switch | **0 €** — pas de frais de résiliation, pas d'ouverture |
| Engagement | **Aucun** — switch illimité, résiliation gérée par le nouveau fournisseur |
| Pénétration actuelle | **22 %** seulement des Français ont déjà changé de fournisseur d'élec → 78 % d'inertie |
| Données conso | **Linky + Enedis Data Connect** : API officielle gratuite, données temps réel |
| Concurrence directe | **Aucune** sur le segment "agent autonome continu" |

Selectra, Hello Watt, papernest, Origame sont des **comparateurs ponctuels** avec un call center humain. Personne ne propose un vrai agent autonome qui agit en continu à la place de l'utilisateur.

---

## 2. Le produit : AutoSwitch

### Architecture multi-agents

```
┌──────────────────────────────────────────────────────┐
│  ORCHESTRATOR (Claude Sonnet 4.5 + tool use)         │
└──────────────────────────────────────────────────────┘
        │              │              │              │
   ┌────▼────┐   ┌─────▼─────┐  ┌─────▼─────┐  ┌────▼─────┐
   │ Onboard │   │ Watcher   │  │ Decider   │  │ Executor │
   │ Agent   │   │ Agent     │  │ Agent     │  │ Agent    │
   └─────────┘   └───────────┘  └───────────┘  └──────────┘
        │              │              │              │
   ┌────▼──────────────▼──────────────▼──────────────▼────┐
   │  TOOLS                                                │
   │  • Mistral OCR / Claude Vision (lecture factures)     │
   │  • Enedis Data Connect API (conso Linky temps réel)   │
   │  • Scraping comparateurs (Selectra, Hello Watt)       │
   │  • Browser-use / Playwright (souscription auto)       │
   │  • Vapi / Retell AI (appels résiliation/portabilité)  │
   │  • Resend + Twilio (notifications utilisateur)        │
   └───────────────────────────────────────────────────────┘
```

### Rôle de chaque agent

**🟦 Onboarding Agent — extraction**
- L'utilisateur upload sa facture EDF + sa facture mobile.
- OCR multimodal extrait : PDL/PCE, conso annuelle, prix kWh, abonnement, opérateur, forfait, prix.
- Collecte RIB + mandat de prélèvement (DocuSign API, mocké pour la démo).

**🟩 Watcher Agent — veille (cron quotidien)**
- Scrape les offres du marché (Kelwatt, Selectra fournissent des données structurées).
- Récupère la conso temps réel via Enedis Data Connect.
- Calcule la facture annuelle simulée pour chaque offre disponible.

**🟨 Decider Agent — décision (LLM)**
- Compare facture actuelle vs meilleure offre disponible.
- Switch déclenché si **(1)** économie > 80 €/an **ET** **(2)** fournisseur noté > 3,5/5 **ET** **(3)** pas de switch dans les 90 derniers jours.
- Génère une explication en langage naturel : *« Je passe ton contrat de TotalEnergies à Octopus Energy : tu économises 142 €/an grâce à un kWh à 0,18 € vs 0,21 €. »*
- Validation utilisateur en 1 clic, **ou** mode 100 % auto si opt-in.

**🟥 Executor Agent — exécution (le moment WOW)**
- **Électricité** : Browser-use / Playwright automatise la souscription chez le nouveau fournisseur. La résiliation de l'ancien contrat est *automatique* en France.
- **Mobile** :
  1. Récupère le code RIO en envoyant un SMS au 3179 (via Twilio).
  2. Souscrit le nouveau forfait avec portabilité du numéro.
  3. Si appel service client requis : **agent vocal Vapi en français** qui négocie ou résilie.

---

## 3. Stack technique 48 h

| Couche | Outil | Pourquoi |
|---|---|---|
| Front | Next.js + Tailwind + shadcn | Setup rapide, look pro |
| Orchestration | Mastra ou LangGraph | Multi-agents prêts à l'emploi |
| LLM | Claude Sonnet 4.5 | Tool use et raisonnement structuré fiables |
| OCR | Mistral OCR / Claude Vision | Lit n'importe quelle facture |
| Data conso | Enedis Data Connect (sandbox) | Donnée officielle, gratuite |
| Browser automation | Browser-use | Plus moderne que Playwright pur, agent-friendly |
| Voice agent | Vapi.ai / Retell AI | Appels en français prêts à l'emploi |
| DB / Auth | Supabase | Stack complète en 5 min |
| Notifs | Resend (email) + Twilio (SMS) | Industry standard |

---

## 4. Pourquoi on gagne le hackathon

1. **Wow factor démo** : appel Vapi en live qui résilie un faux forfait Orange devant le jury.
2. **Vraiment agentic** : 4 agents qui collaborent, OCR, browser automation, voix — la totale.
3. **Problème universel** : chaque juge paie trop cher son électricité.
4. **Marché chiffrable** : 30 M de foyers × 300 € = **~9 Md€ de pouvoir d'achat dormant**.
5. **Business model clair** : commission fournisseur (40–150 €/lead) **ou** abonnement 5 €/mois.
6. **Double track** : B2C (foyer) + B2G (lutte contre la précarité énergétique).

---

## 5. Risques à anticiper dans le pitch

- **Mandat légal** : agir au nom de l'utilisateur → mandat SEPA + procuration. Démo : DocuSign mocké.
- **Anti-spam fournisseur** : cooldown 90 jours pour éviter le blacklisting.
- **Réglementation** : statut ORIAS de courtier en énergie sur la roadmap, pas un blocker hackathon.

---

## 6. Plan 48 h

**Jour 1**
- `0–3 h` : setup Next.js + Supabase + Claude API
- `3–8 h` : OCR factures + parsing → DB
- `8–14 h` : Enedis Data Connect (sandbox) + scraping 2-3 fournisseurs
- `14–20 h` : Decider Agent (logique de comparaison + LLM)

**Jour 2**
- `0–6 h` : Executor Agent — Browser-use sur 1 fournisseur cible
- `6–10 h` : Vapi agent vocal (le moment WOW)
- `10–14 h` : dashboard utilisateur (économies cumulées, historique des switches)
- `14–20 h` : pitch deck + démo + répétitions

---

## 7. Prochaines productions possibles

- (a) Prompt système Claude pour le Decider Agent
- (b) Mockup du dashboard utilisateur
- (c) Pitch deck final (problème → solution → démo → marché → business model)
- (d) Boilerplate de code (Next.js + Mastra + Claude tool use)
