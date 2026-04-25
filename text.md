# AutoSwitch — Note de cadrage projet

## TL;DR

Un agent IA autonome qui connecte le contrat d'électricité d'un foyer **une seule fois**, lit la consommation Linky en temps réel, surveille en continu le marché, et **switche automatiquement** vers la meilleure offre dès qu'elle apparaît. Économies visées : **150–320 €/an** pour un foyer 6 kVA, **jusqu'à 620 €/an** pour une grande maison chauffée à l'électricité.

> *« Set and forget. Tu connectes ton compteur une fois, on optimise pour la vie. »*

---

## 1. Pourquoi le marché de l'électricité résidentielle française est parfait

| Levier | Réalité | Source |
|---|---|---|
| Coût d'un switch | **0 €** — pas de frais, pas d'engagement, pas de coupure | [Service-Public](https://www.service-public.gouv.fr/) |
| Résiliation | **Automatique** par le nouveau fournisseur | EDF / CRE |
| Pénétration TRV | **44 %** déjà sortis du tarif réglementé, **+556 000** en 2025 | [CRE Q4 2025](https://www.cre.fr/fileadmin/Documents/Rapports_et_etudes/2026/Observatoire_T4_2025.pdf) |
| Compteurs Linky | **37,6 M (97 %)** installés à fin 2025 | [Libow](https://www.libow.fr/linky-obligatoire-2025/) |
| Données conso | **Enedis Data Connect** : OAuth2, gratuit, granularité 30 min | [api.gouv.fr](https://api.gouv.fr/les-api/api-donnees-ouvertes-enedis) |
| Offres < TRV | **47 sur 80 (59 %)** moins chères que le tarif réglementé | [CRE](https://www.cre.fr/fileadmin/Documents/Rapports_et_etudes/2025/Observatoire_T4_2024.pdf) |
| Volatilité spot | **×6,4** en 7 jours en avril 2026 (37 → 235 €/MWh) | [Kelwatt](https://www.kelwatt.fr/prix/electricite-spot-cours-marche-gros) |
| Concurrence directe | **Aucune** sur le segment "agent autonome continu" | — |

Selectra, Hello Watt, Papernest et Origame sont des **comparateurs ponctuels** avec call center humain. Ils prennent une commission **une fois**, puis le client redevient captif. Personne ne propose un agent qui switche en continu.

---

## 2. Le produit : AutoSwitch

### 2.1 Architecture multi-agents

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
   │  • Scraping Kelwatt / Selectra / fournisseurs         │
   │  • Browser-use (souscription auto)                    │
   │  • Vapi / Retell AI (appel SAV / résiliation)         │
   │  • Resend + Twilio (notifications utilisateur)        │
   └───────────────────────────────────────────────────────┘
```

### 2.2 Rôle de chaque agent

**🟦 Onboarding Agent — extraction**
- Upload facture EDF (ou autre fournisseur).
- OCR multimodal extrait : **PDL** (14 chiffres), conso annuelle, prix kWh, abonnement, puissance souscrite, option tarifaire (Base / HP-HC / Tempo / EJP).
- Connexion Linky en 1 clic via OAuth Enedis Data Connect.
- Collecte RIB + mandat SEPA + procuration (DocuSign eIDAS qualifié).

**🟩 Watcher Agent — veille (cron quotidien)**
- Scrape les offres marché (Kelwatt, Selectra, sites fournisseurs).
- Pull conso 30 min via Enedis Data Connect → identifie le **profil de consommation** (base flat, HC nuit forte, weekend chargé...).
- Calcule la facture annuelle simulée pour chaque offre disponible **en fonction du profil réel**, pas d'une estimation moyenne.

**🟨 Decider Agent — décision (LLM)**
- Compare facture actuelle vs meilleure offre.
- Switch déclenché si **(1)** économie > 80 €/an **ET** **(2)** fournisseur noté > 3,5/5 + non listé carton rouge Médiateur **ET** **(3)** pas de switch dans les 90 derniers jours **ET** **(4)** stabilité tarifaire (refuse une indexée si volatilité spot > seuil).
- Génère une explication en langage naturel : *« Je passe ton contrat de TRV EDF à Primeo Confort+ : tu économises 232 €/an grâce à un kWh à 0,1625 € vs 0,194 €. Engagement 12 mois, prix bloqué. »*
- Validation utilisateur en 1 clic, **ou** mode 100 % auto si opt-in.

**🟥 Executor Agent — exécution (le moment WOW)**
- Browser-use / Playwright automatise la souscription chez le nouveau fournisseur (formulaire en ligne).
- Récupère le PDL, la conso de référence, le mandat SEPA.
- Résiliation de l'ancien contrat : **automatique** en France, gérée par le nouveau fournisseur via les procédures B2B Enedis.
- En cas de blocage (ex : fournisseur exige un appel SAV pour finaliser) : **agent vocal Vapi en français** prend le relais.

---

## 3. Optimisation au-delà du switch fournisseur

Différenciateur fort : on ne se contente pas de comparer le prix kWh facial. L'agent peut aussi :

- **Recommander un changement d'option tarifaire** : passer Base → HP/HC si > 30 % de la conso est nocturne (typique chauffage électrique, ballon eau chaude, voiture électrique).
- **Détecter une sous-puissance / sur-puissance** souscrite : un foyer avec abonnement 9 kVA mais pic à 5 kVA paie 47 €/an de trop d'abonnement.
- **Alerter Tempo / EJP** : pour les profils flexibles, ces offres EDF peuvent économiser 200–400 €/an supplémentaires (jours rouges chers, jours bleus très bas).
- **Surveiller la dérive prix** : si une offre indexée passe au-dessus du TRV, switch immédiat.

---

## 4. Stack technique — hackathon 24 h

| Couche | Outil | Pourquoi |
|---|---|---|
| Front | Next.js + Tailwind + shadcn | Setup rapide, look pro |
| Orchestration | Mastra ou LangGraph | Multi-agents prêts à l'emploi |
| LLM | **Claude Sonnet 4.5** | Tool use et raisonnement structuré |
| OCR | Mistral OCR / Claude Vision | Lit n'importe quelle facture |
| Data conso | **Enedis Data Connect** (sandbox) | Donnée officielle, gratuite, OAuth2 |
| Browser automation | Browser-use | Agent-friendly, plus moderne que Playwright pur |
| Voice agent | Vapi.ai / Retell AI | Appels SAV en français prêts à l'emploi |
| DB / Auth | Supabase | Stack complète en 5 min |
| Notifications | Resend (email) + Twilio (SMS) | Industry standard |
| Signature | DocuSign eIDAS qualifié | Mandat SEPA + procuration |

---

## 5. Pourquoi on gagne le hackathon

1. **Wow factor démo** : appel Vapi en live qui résilie un faux contrat devant le jury.
2. **Vraiment agentic** : 4 agents qui collaborent, OCR, browser automation, voix — la totale.
3. **Problème universel** : chaque juge paie trop cher son électricité. La douleur est immédiate.
4. **Marché chiffrable** : 35 M de sites résidentiels × 80 € de commission × 1,2 switch/an = **~3,4 Md€ de TAM**.
5. **Business model clair** : commission fournisseur (40–150 €/lead) **+** abonnement Premium 5 €/mois.
6. **Validation internationale** : Octopus Energy 9 Md$ valuation, Bilt 10,75 Md$, Look After My Bills racheté 12,5 M£.

---

## 6. Risques anticipés dans le pitch

- **Mandat légal** : SEPA + procuration eIDAS qualifiés signés à l'onboarding. Audit juridique avant prod.
- **Anti-spam fournisseur** : cooldown 90 j codé en dur dans le Decider Agent (sinon blacklist).
- **Régulation ORIAS** : **pas obligatoire** pour intermédiation énergie pure (couvre assurance/banque/finance). Source : [ORIAS FAQ](https://www.orias.fr/home/documents/ORIAS-STATIC-HOME-FAQ).
- **Démarchage téléphonique interdit** (sanction 375 k€) → acquisition 100 % digitale (SEO, social, partenariats banques/néobanques).
- **Indexée mal calibrée** : règle stricte dans le Decider — refus de switch vers indexée si volatilité spot > seuil.
- **Fournisseur ferme son scraping** : fallback Vapi (commande vocale) + roadmap partenariats API directs.

---

## 7. Plan 24 h de hack (résumé — détail dans `action_plan.md`)

**Setup équipe : 4 devs × Claude Code = parallélisation totale.**

| Tranche | Track 1 (Lead) | Track 2 (Onboarding) | Track 3 (Watcher) | Track 4 (Executor) |
|---|---|---|---|---|
| 0-2h | Setup repo + stack | OCR Mistral PoC | Enedis sandbox | Browser-use PoC |
| 2-6h | Orchestrator + DB | Parsing facture EDF | Scraping 3 fournis. | Souscription mock |
| 6-10h | Decider Agent prompts | Connect Linky OAuth | Calcul facture/profil | Vapi voix FR |
| 10-14h | Intégration end-to-end | Dashboard front | Tests sur PDL réel | Démo scénario |
| 14-18h | Polish + UX | — | — | Backup vidéo |
| 18-22h | Pitch deck + slides | Répétitions démo | Q&A préparé | — |
| 22-24h | Répétitions chronométrées + buffer crash |

**Cible J+1 8h** : démo de 90 secondes qui marche **3 fois de suite**.

---

## 8. Fichiers du projet

- `text.md` — cette note de cadrage
- `slides.md` — pitch deck (Marp-compatible, ~14 slides)
- `data.md` — dossier de recherche marché (sources inline)
- `action_plan.md` — plan d'action détaillé (hackathon → 90 jours post)
