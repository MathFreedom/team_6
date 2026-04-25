# AutoSwitch — Plan d'action

**Périmètre : électricité résidentielle France.**
**Horizon : J0 (hackathon 24 h) → J+90 (prep seed).**
**Setup équipe : 4 devs × Claude Code = vitesse 5-10× sur le code.**

---

## 1. Phase 0 — Pré-hackathon (J-3 à J0)

### 1.1 Comptes API à provisionner

- [ ] Anthropic (Claude Sonnet 4.5)
- [ ] Mistral (OCR)
- [ ] Enedis Data Connect (sandbox développeur — délai d'inscription : 24-48 h)
- [ ] Vapi.ai (compte trial + 1 voix FR pré-config)
- [ ] Twilio (SMS test pour notifications)
- [ ] Resend (email transactionnel)
- [ ] Supabase (projet + schéma initial)
- [ ] DocuSign sandbox (mandat SEPA mocké)

### 1.2 Repo & stack initialisée

- [ ] GitHub repo prêt avec branches `main` / `dev` / `feat/onboarding` / `feat/watcher` / `feat/decider` / `feat/executor`
- [ ] Stack base committée :
  - Next.js 15 + Tailwind + shadcn
  - Mastra (TypeScript-first, recommandé pour 4 devs Claude Code)
  - Drizzle ORM + Supabase Postgres
  - Vercel / Railway pour déploiement live pendant la démo
- [ ] **CLAUDE.md** racine du repo avec :
  - Architecture du projet
  - Conventions (TS strict, ESLint, Prettier)
  - Stack & APIs disponibles
  - Comment tester chaque agent en isolation
- [ ] **Repos partagés Linear / Notion** pour issues

### 1.3 Jeux de données

- [ ] 5 factures EDF réelles (anonymisées) → train OCR
- [ ] Tableau Excel des 10 offres marché (cf. `data.md` § 2.3) → seed DB
- [ ] **PDL démo réel** avec autorisation Enedis Data Connect activée (Tom ou autre)
- [ ] 30 jours de courbe de charge 30 min stockée localement (backup démo)

### 1.4 Répartition par track

| Track | Owner | Stack principale |
|---|---|---|
| **T1 — Lead / Orchestrator** | TBD | Mastra + Claude Sonnet 4.5 + DB |
| **T2 — Onboarding + OCR + Front** | TBD | Mistral OCR + Claude Vision + Next.js |
| **T3 — Watcher + Enedis + Scraping** | TBD | Playwright + Enedis Data Connect |
| **T4 — Executor + Browser-use + Vapi** | Tom *(le moment WOW)* | Browser-use + Vapi |

> **Rule of thumb** : chaque track travaille sur sa branche, fait des PR petits et fréquents, Claude Code écrit le code, le dev valide.

---

## 2. Phase 1 — Hackathon 24 h

### Heure par heure (24 tranches d'1 h)

| H | T1 — Orchestrator | T2 — Onboarding | T3 — Watcher | T4 — Executor |
|---:|---|---|---|---|
| **0-1** | Setup repo, branches | Mistral OCR PoC sur 1 facture | Enedis sandbox auth OAuth | Browser-use installé + 1er test |
| **1-2** | Schéma DB (users, contracts, switches) | Parsing JSON → schéma | Pull conso 30 min depuis sandbox | Souscription mockée Octopus en test |
| **2-3** | API REST routes | UI upload facture | Scraping Kelwatt (1 fournisseur) | Mandat SEPA DocuSign mocké |
| **3-4** | Auth Supabase basique | OCR sur 5 factures variées | Scraping Selectra (2e source) | Vapi voix FR — script "résiliation" |
| **4-5** | Orchestrator skeleton | Connect bouton "Linky" → OAuth | Normalisation données offres | Vapi appel test sur numéro perso |
| **5-6** | Decider Agent v1 (compare prix kWh) | Affichage facture parsée | Calcul facture annuelle simulée | Browser-use sur formulaire Octopus |
| **6-7** | Decider explication LLM | Onboarding flow complet | Profile detection (HC/HP, weekend) | Intégration Browser-use → DB |
| **7-8** | **Sync 1** : pipeline Onboard → Watcher → Decider qui tourne | | | |
| **8-9** | Cooldown 90 j logique | Dashboard skeleton | Backup données local (si Enedis down) | Vapi conversationnel (questions/réponses) |
| **9-10** | Validation user 1-clic | Dashboard : facture, économies | Tests sur 3 PDL différents | Browser-use end-to-end mock |
| **10-11** | Notifications Resend | Historique switches | Cron quotidien (mock) | Démo Vapi enregistrée backup |
| **11-12** | API webhooks fournisseurs | Mobile responsive | Optimisation latence | Polish Vapi français |
| **12-13** | **Sync 2** : démo end-to-end qui tourne | | | |
| **13-14** | Logs + monitoring | Animations / UX polish | Indicateurs santé | Backup vidéo 30 sec démo |
| **14-15** | Auth utilisateur final | Tom (premier user simulé) | — | Démo répétée 1× |
| **15-16** | Buffer / debug | Pitch deck — slides 1-7 | Pitch deck — données | Pitch deck — démo script |
| **16-17** | Buffer / debug | Pitch deck — slides 8-15 | Q&A préparé | Démo répétée 2× |
| **17-18** | **Sync 3** : démo + pitch finalisés | | | |
| **18-19** | Répétition complète #1 (chrono) |
| **19-20** | Debug post-répétition |
| **20-21** | Répétition complète #2 |
| **21-22** | Debug post-répétition |
| **22-23** | Répétition complète #3 (clean run) |
| **23-24** | **Buffer crash** + sommeil court |

**Critère sortie hackathon (H24)** : démo 90 s qui passe **3 fois de suite** sans intervention.

### 2.1 Scope IN / OUT

**IN (must-have)**
- ✅ OCR facture EDF → JSON (PDL, conso, prix, abo, option tarifaire)
- ✅ Connexion Linky démo via OAuth Enedis Data Connect
- ✅ Scraping 2-3 fournisseurs (Primeo, Octopus, TotalEnergies)
- ✅ Decider Agent qui décide + explique en français
- ✅ Browser-use sur 1 souscription en live
- ✅ **Vapi appel vocal FR (le moment WOW)**
- ✅ Dashboard avec économies cumulées
- ✅ Pitch deck 10-15 slides

**OUT (post-hack)**
- ❌ Mandat SEPA réel (mocké DocuSign sandbox)
- ❌ Optimisation HP/HC / Tempo (mention pitch, pas codé)
- ❌ Multi-PDL / résidence secondaire
- ❌ Mode 100 % auto sans validation
- ❌ Auth utilisateurs prod (mock magic link)
- ❌ Gaz / B2G

---

## 3. Phase 2 — Démo & pitch (présentation jury)

### 3.1 Script démo — 90 secondes chrono

| Sec | Action | Texte parlé |
|---|---|---|
| 0-10 | Upload facture EDF (PDF) | *« Marie reçoit sa facture EDF. Elle la photographie. »* |
| 10-15 | OCR live affiche PDL, conso, prix | *« 4 secondes. PDL extrait, conso 5 200 kWh. »* |
| 15-25 | Connexion Linky OAuth | *« Elle connecte son Linky. Courbe 30 min affichée. »* |
| 25-40 | Decider parle | *« L'agent décide : Primeo Confort+, économie 245 €/an. »* |
| 40-50 | Clic « Switch » | *« Marie clique. Une seule fois. »* |
| 50-75 | Browser-use souscrit en live | *« Browser-use remplit le formulaire à sa place. »* |
| 75-90 | Vapi appelle, résilie en français | *« Et si l'opérateur exige un appel ? »* → audio Vapi live |

### 3.2 Plan B (chaque composant a un fallback prêt)

| Composant | Risque | Plan B |
|---|---|---|
| Browser-use | Site fournisseur change UI | Vidéo pré-enregistrée 30 sec |
| Vapi | API down / latence | Audio pré-enregistré + caption |
| OCR | Facture mal lue | Facture pré-parsée en cache |
| Linky OAuth | Sandbox Enedis instable | Données stockées localement |
| Wifi venue | Coupure | Hotspot mobile + démo offline préparée |

### 3.3 Q&A pré-préparé (top 10 questions jury)

1. **« Quelle est votre barrière à l'entrée ? »**
   → Profil de consommation Linky 30 min + re-switch continu. Selectra ne peut pas faire ça sans refondre toute son opération humaine.
2. **« Pourquoi pas Octopus / un fournisseur fait déjà du switching ? »**
   → Aucun fournisseur ne switche un client vers un concurrent. Conflit d'intérêt structurel.
3. **« Et si les fournisseurs vous bloquent ? »**
   → Vapi en fallback + diversification 5+ partenaires + roadmap API directes.
4. **« Réglementation, ORIAS ? »**
   → ORIAS pas requis pour intermédiation énergie. Mandat SEPA + procuration eIDAS suffit.
5. **« Comment vous acquérez vos clients ? »**
   → Démarchage tél interdit (375 k€ amende). 100 % digital : SEO, partenariats banques/néobanques, bouche-à-oreille.
6. **« Pourquoi maintenant ? »**
   → Spot ×6,4 en 7 jours, 47/80 offres < TRV, Linky 97 %, +556 k switchers en 2025.
7. **« Modèle économique ? »**
   → Commission 80 € × 1,2 switch/an = 96 € ARPU + Premium 5 €/mois.
8. **« Risque numéro 1 ? »**
   → Anti-spam fournisseur. Mitigation : cooldown 90 j codé en dur.
9. **« Pourquoi ça va marcher en France ? »**
   → Switch gratuit + sans engagement + Linky 97 % = combinaison unique. UK : Octopus vaut 9 Md$.
10. **« Et après l'électricité ? »**
    → Gaz résidentiel (10 M sites) → x2 TAM. Puis B2G précarité énergétique.

---

## 4. Phase 3 — Sprint J+1 à J+7 (post-hack)

> **Hypothèse vitesse** : 4 devs × Claude Code = ce qui prendrait normalement 1 mois se fait en 1 semaine.

### J+1 (lendemain hack)
- [ ] **Debrief équipe** (1 h) : ce qui a marché, ce qui a planté, GO/NO-GO
- [ ] Déploiement prod stabilisé sur Vercel/Railway
- [ ] Annonce LinkedIn / X du projet (générer du buzz)

### J+2 à J+3
- [ ] **10 interviews users** (15 min chacune, 5 jamais switché + 5 ayant switché)
- [ ] Demande **passage sandbox → prod Enedis Data Connect** (délai officiel ~7 j)
- [ ] **1er contact fournisseurs** : Primeo, Mint Énergie, OHM Énergie, Octopus (4 emails partenariat envoyés)

### J+4 à J+7
- [ ] **MVP v1 en prod** :
  - Vraie auth Supabase
  - Vraie connexion Enedis Data Connect prod
  - Vrai DocuSign / Yousign eIDAS qualifié
  - Browser-use stabilisé sur 2 fournisseurs (Primeo + Octopus)
  - Cooldown 90 j en DB
- [ ] **1er fournisseur partenaire en discussion contractuelle** (commission 60-80 €/lead)
- [ ] **CGU/CGV draft** par avocat (1 séance 500 €)
- [ ] **20 utilisateurs bêta privée** (réseau perso)
- [ ] **Analytics Posthog** branchés

**Critère sortie J+7** : 5 switches réels effectués, 0 litige, NPS bêta > 60.

---

## 5. Phase 4 — Sprint J+7 à J+30

### Tech (parallélisé sur 4 devs × Claude Code)

- [ ] **Mode 100 % auto opt-in** activé (avec validation initiale + règles strictes)
- [ ] **Optimisation HP/HC** : moteur de recommandation basé sur 30 jours Linky
- [ ] **Alertes Tempo** pour profils flexibles
- [ ] **Multi-PDL** (résidence secondaire)
- [ ] **3 fournisseurs intégrés** (vs 2 à J+7)
- [ ] **App mobile PWA** (Next.js → installable)
- [ ] **Monitoring** : Sentry + Logtail + dashboard Grafana

### Business

- [ ] **5 partenariats fournisseurs signés**
- [ ] **500 utilisateurs bêta actifs**
- [ ] **Audit juridique complet** (avocat énergie, 2-3 séances)
- [ ] **SAS créée** (statut juridique cible)
- [ ] **DPO RGPD** identifié (gestion donnée Linky 30 min)

### Acquisition (démarchage tél interdit, 100 % digital)

- [ ] **SEO** : 5 articles long-tail (« meilleure offre élec maison 100m2 », etc.)
- [ ] **Reddit / Twitter** : présence active, posts hebdo
- [ ] **1 partenariat néobanque en pilote** (Lydia, Revolut, Pixpay…)
- [ ] **Premier ratio LTV/CAC** mesuré

**Critère sortie J+30** : 500 utilisateurs, 200 switches finalisés, 30 000 € d'économie cumulée délivrée.

---

## 6. Phase 5 — Sprint J+30 à J+90 (préparation seed)

### Produit
- [ ] **Mode 100 % auto par défaut** (pour utilisateurs qui ont validé 1 switch manuel sans problème)
- [ ] **Multi-PDL illimité**
- [ ] **Bilan annuel automatique** (récap économies + projections)
- [ ] **Programme de parrainage** (croissance organique virale)

### Business
- [ ] **5 000 utilisateurs**
- [ ] **8-10 fournisseurs partenaires**
- [ ] **Premiers 100 utilisateurs Premium 5 €/mois** payants
- [ ] **Extension gaz** en branche feature (lancement J+90)

### Levée seed
- [ ] **Pitch deck investor v1** (différent du pitch hackathon, plus business)
- [ ] **Data room** : KPIs, contrats partenaires, audit juridique, NPS, churn
- [ ] **5 angels en pré-discussion** (Octopus FR, ex-Selectra, ex-Hello Watt, ex-Doctolib, climate VCs)
- [ ] **3 fonds VC en discussion** (Daphni, Frst, Heartcore, Speedinvest)
- [ ] **Cible levée Q1 2027 : 800 k€ – 1,5 M€ pre-seed** (valuation 5-8 M€)

**Critère sortie J+90** : term sheet en mains.

---

## 7. KPIs à tracker dès J0

| Métrique | Fréquence | Cible J+30 | Cible J+90 |
|---|---|---:|---:|
| **Utilisateurs onboardés** | Quotidien | 500 | 5 000 |
| **Switches initiés** | Quotidien | 200 | 2 000 |
| **Switches finalisés** | Quotidien | 150 (75 %) | 1 600 (80 %) |
| **Économie cumulée délivrée** | Hebdo | 30 k€ | 350 k€ |
| **NPS** | Mensuel | > 50 | > 60 |
| **CAC** | Mensuel | < 25 € | < 15 € |
| **% Premium payant** | Mensuel | 0 | 2 % |
| **Taux opt-in mode auto** | Mensuel | > 30 % | > 50 % |
| **Litiges Médiateur / 100 switches** | Mensuel | 0 | 0 |

---

## 8. Décisions critiques à prendre

### Avant le hackathon
- [ ] **Mastra vs LangGraph** : Mastra recommandé (TypeScript-first, plus rapide à prototyper avec Claude Code)
- [ ] **Vapi vs Retell AI** : tester les 2 sur cas d'usage français avant H0
- [ ] **Browser-use vs Playwright pur** : Browser-use plus moderne mais moins prévisible — recommandé pour démo, fallback Playwright pour prod

### J+1 à J+7
- [ ] **Mode auto par défaut ou opt-in ?** Recommandation : opt-in après 1er switch manuel validé
- [ ] **Free tier inclut combien de switches ?** Recommandation : 1/an (cohérent fréquence naturelle)
- [ ] **Premium 5 € ou 7,99 € ?** A/B test sur les 100 premiers Premium

### J+30 à J+90
- [ ] **Extension gaz : maintenant ou après seed ?** Recommandation : J+90 pour la pitch story, lancement post-seed
- [ ] **Marque distincte ou white-label ?** Recommandation : marque distincte (récurrence + branding)
- [ ] **B2G : roadmap an 2 ou priorité ?** Recommandation : roadmap, priorité = scaling B2C

---

## 9. Risques majeurs & mitigation

| Risque | Indicateur d'alerte | Mitigation |
|---|---|---|
| **Anti-spam fournisseur** | Refus de souscription d'un partenaire | Cooldown 90 j + 5+ partenaires diversifiés |
| **Faillite fournisseur partenaire** | Carton rouge Médiateur / news | Monitoring santé + filtrage automatique |
| **Régulation tarifaire qui durcit** | Annonce CRE / gouvernement | Veille mensuelle + adaptation produit |
| **Blocage scraping** | Échec > 10 % sur un fournisseur | Vapi fallback + roadmap API directes |
| **Litige client / Médiateur** | 1 saisine | RC pro + procédure remédiation |
| **Concurrence étrangère arrive** (Octopus FR / Bilt FR) | Annonce presse | Speed to market + lock partenariats exclusifs |
| **Enedis Data Connect API change** | Email Enedis | Fallback OCR factures + scraping espace client |
| **Linky non installé** (3 % foyers) | UI utilisateur | Onboarding alternatif (saisie manuelle) |

---

## 10. Ressources

- **Repo GitHub** : https://github.com/MathFreedom/team_6
- **Pitch deck** : `slides.md`
- **Note de cadrage** : `text.md`
- **Recherche marché** : `data.md`
- **Enedis Data Connect** : https://datahub-enedis.fr/data-connect/
- **Mastra** : https://mastra.ai
- **Browser-use** : https://github.com/browser-use/browser-use
- **Vapi.ai** : https://vapi.ai/
- **DocuSign API eIDAS** : https://developers.docusign.com
- **Yousign (FR)** : https://yousign.com/fr-fr/developers
