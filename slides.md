---
marp: true
theme: default
paginate: true
class: lead
---

<!-- Deck cible : ~10-12 slides finales. Chiffres durcis avec sources (cf. data.md). -->

# AutoSwitch
### *L'agent IA qui te garantit toujours le meilleur tarif énergie & mobile.*

**Team 6 — Hackathon 2026**

> *Tu connectes une fois. On optimise pour la vie.*

---

## Slide 1 — Le problème (1/2) : on paie trop, et on le sait

> *« J'ai signé mon contrat EDF en 2019. Je sais que je paie trop. Je n'ai juste jamais eu le temps de comparer. »*
> — N'importe quel Français, ce matin

- Comparer = 2 h de paperasse
- Switcher = peur des frais cachés *(qui n'existent pas en France, mais personne ne le sait)*
- Résultat : **56 % des foyers français n'ont jamais quitté le TRV EDF** *(CRE Q4 2025)*

**On laisse de l'argent sur la table par pure inertie.**

---

## Slide 2 — Le problème (2/2) : 9 milliards d'euros dormants

| | |
|---|---:|
| Foyers français | **30 M** *(INSEE)* |
| Foyers TRV EDF | **19,75 M (55,8 %)** *(CRE Q4 2025)* |
| Offres marché < TRV | **47 sur 80 (59 %)** *(CRE)* |
| Économie médiane réalisable | **150–320 €/an** *(Hello Watt, calcul)* |
| **Pouvoir d'achat dormant** | **~9 Md€/an** |

**Et pourtant** :
- Switch **gratuit**, sans engagement, résiliation auto
- **Linky : 37,6 M compteurs (97 %)**, API Enedis Data Connect gratuite
- **+556 000 Français ont quitté EDF en 2025** — le marché bouge déjà

> Tout est en place. Il manque juste **l'agent qui agit à ta place.**

<small>Sources : [CRE Q4 2025](https://www.cre.fr/fileadmin/Documents/Rapports_et_etudes/2026/Observatoire_T4_2025.pdf), [Libow](https://www.libow.fr/linky-obligatoire-2025/)</small>

---

## Slide 3 — La solution : un agent autonome, pas un comparateur

**Selectra, Hello Watt, papernest** : tu compares **une fois**, un humain te rappelle, tu redeviens captif l'année d'après.

**AutoSwitch** : tu connectes tes contrats **une fois**.
L'agent surveille le marché **24/7** et switche pour toi dès qu'une meilleure offre apparaît.

```
Onboarding → Veille continue → Décision → Exécution → Économies
   1 fois         24/7           IA       Auto         À vie
```

**Promesse** : **150–320 €/an** d'économies (foyer 6 kVA) — **jusqu'à 620 €/an** pour grande maison + PAC. Zéro effort.

---

## Slide 4 — Cas d'usage concret

**Marie, 32 ans, Lyon. Lundi 9h.**

1. 📸 Photographie sa facture EDF + sa facture Free Mobile.
2. 🔐 Connecte son Linky (1 clic, OAuth Enedis Data Connect).
3. ✅ Signe un mandat SEPA + procuration (DocuSign eIDAS qualifié).

**Mardi 14h** — notification :
> *« J'ai trouvé Primeo Confort+ à 0,1625 €/kWh vs ton TRV à 0,194 €. Économie : **232 €/an**. Je switche ? »*

**Mardi 14h01** — Marie clique « Oui ». L'agent souscrit en ligne, déclenche la portabilité. **0 appel, 0 formulaire.**

**Décembre** — bilan annuel : **387 € économisés** (élec + mobile combinés).

---

## Slide 5 — Comment ça marche : 4 agents, 1 cerveau

```
┌──────────────────────────────────────────────────────┐
│  ORCHESTRATOR — Claude Sonnet 4.5 + tool use         │
└──────────────────────────────────────────────────────┘
        │              │              │              │
   ┌────▼────┐   ┌─────▼─────┐  ┌─────▼─────┐  ┌────▼─────┐
   │ Onboard │   │ Watcher   │  │ Decider   │  │ Executor │
   │ Agent   │   │ Agent     │  │ Agent     │  │ Agent    │
   └─────────┘   └───────────┘  └───────────┘  └──────────┘
       OCR        Scraping +       LLM         Browser +
       Vision      Enedis API      Logic         Voix
```

| Agent | Job | Tech |
|---|---|---|
| **Onboarding** | Lire la facture, extraire PDL, conso, prix | Mistral OCR + Claude Vision |
| **Watcher** | Scraper offres + Linky temps réel | Enedis Data Connect (OAuth2, gratuit) |
| **Decider** | Décider du switch + expliquer pourquoi | Claude Sonnet 4.5 |
| **Executor** | Souscrire + résilier + appeler | Browser-use + Vapi (voix FR) |

---

## Slide 6 — L'IA, là où ça compte vraiment

**1. OCR multimodal — comprendre n'importe quelle facture**
Claude Vision extrait PDL, conso annuelle, prix kWh, abonnement, depuis un PDF mal scanné ou une photo smartphone.

**2. Raisonnement structuré — décider, pas juste comparer**
Le Decider pondère : qualité service, stabilité tarifaire, ancienneté, **cooldown 90 j anti-blacklisting**, alerte si fournisseur en carton rouge Médiateur (Wekiwi, Primagaz, JPME 2024).

**3. Browser-use — agir dans le monde réel**
L'agent navigue les sites fournisseurs comme un humain : remplit, clique, valide, gère les CAPTCHAs.

**4. Agent vocal Vapi — quand le digital ne suffit pas**
Récupération du **code RIO via SMS au 3179** (3 j ouvrables, gratuit). Si appel SAV requis : agent vocal en français qui négocie ou résilie.

---

## Slide 7 — Pourquoi maintenant : la volatilité crée l'opportunité

**Le prix spot a varié de × 6,4 en 7 jours en avril 2026** *(Kelwatt, 37 → 235 €/MWh)*.

- **25-35 % du marché** est en offres indexées sur le spot
- Les fournisseurs lancent de **nouvelles offres tous les 2-4 mois**
- Une offre top aujourd'hui devient médiane dans 6 mois

**Conséquence** : un comparateur ponctuel devient obsolète immédiatement.
**Notre angle** : re-switch **1,2 fois par an** par utilisateur. Selectra prend une commission une fois, on en génère 1,2.

> Le marché bouge plus vite que les humains. C'est exactement pour ça qu'il faut un agent.

---

## Slide 8 — Démo live (le moment WOW)

**90 secondes chrono.**

1. 📤 Upload facture EDF (PDF) → parsing en direct, 4 secondes
2. 📊 Dashboard : *« Tu paies 1 158 €/an au TRV. Meilleure offre marché : 926 €. »*
3. 🟢 Clic « Switch »
4. 🤖 **Browser-use souscrit Primeo Confort+ en live à l'écran**
5. 📞 **Vapi appelle un faux service Orange et résilie en français devant le jury**

> Personne d'autre dans ce hackathon ne fera un appel téléphonique IA en live.

---

## Slide 9 — Marché : TAM / SAM / SOM

| | Définition | Volume | Valeur |
|---|---|---:|---:|
| **TAM** | Foyers FR énergie + mobile | 30 M | **~3 Md€/an** *(commissions théoriques)* |
| **SAM** | Foyers prêts à déléguer (41 %) | **12 M** | **~1,15 Md€/an** |
| **SOM 5 ans** | Capture 2 % du SAM | 230 K | **22 M€ ARR** |

**Mobile** : 84 M SIM en France, ARPU **14,50 €/mois** *(ARCEP T2 2025)*, **89,4 % sans engagement** → friction zéro.
Économie possible MVNO : **200–300 €/an par ligne**.

**Extension naturelle** : assurances, télécom fixe, banque → x3 le TAM.

---

## Slide 10 — Demande validée : qui veut ça ?

- **72 %** des Français veulent réduire leur facture énergie *(IFOP 2024)*
- **42 %** considèrent le switch *« trop compliqué »* *(CRE)*
- **41 %** se disent prêts à déléguer à un service de confiance
- Parmi eux, **63 %** acceptent le mode auto si économie > 100 €/an

**→ Cible adressable réaliste : 12 M de foyers** (41 % × 30 M).

**Validation indépendante** :
- UFC-Que Choisir "Énergie moins chère ensemble" : **132 M€ économisés cumulés**, 100–480 €/an par foyer
- CRE achat groupé 2024 : 130 k participants, **160 €/an** d'économie moyenne

> Le frein n'est plus le prix. C'est l'effort. On retire l'effort.

---

## Slide 11 — Concurrence : on est seuls sur le bon créneau

| | Comparaison | Bascule auto | Veille continue | Voix IA |
|---|:---:|:---:|:---:|:---:|
| Selectra (96 M€ CA) | ✅ | ❌ | ❌ | ❌ |
| Hello Watt | ✅ | ❌ | ❌ | ❌ |
| Papernest (6 pays) | ✅ | ❌ (humain) | ❌ | ❌ |
| Origame | ✅ | ❌ | ❌ | ❌ |
| **AutoSwitch** | ✅ | ✅ | ✅ | ✅ |

**Validation internationale du modèle** :
- 🇬🇧 **Octopus Energy : 9 Md$ de valuation**, 24 % marché UK, **1 nouveau client toutes les 30 secondes**
- 🇺🇸 **Bilt : 10,75 Md$ de valuation** (Série C 250 M$ en juillet 2025) sur le bill management
- 🇬🇧 **Look After My Bills** racheté par GoCompare 12,5 M£ — modèle prouvé

> En France : **vide blanc**. Personne n'a tenté l'auto-switch à grande échelle.

---

## Slide 12 — Business model

**Modèle hybride, friction zéro côté utilisateur :**

**1. Commission fournisseur (B2B)** — *80 % du revenu*
- **40–150 € par switch acquis** (Selectra prend 20–60 €, on prend la borne haute)
- Re-switch **1,2 fois par an** = **96 €/utilisateur/an**

**2. Abonnement Premium (B2C, optionnel)** — *20 % du revenu*
- **5 €/mois** : mode 100 % auto, dashboard avancé, alertes prio, multi-contrats illimités
- Free tier : 1 switch / an, validation manuelle

**Unit economics cibles** :
- ARPU : **35 €/an** | CAC : **<15 €** (organique, démarchage tél interdit) | **LTV/CAC > 10×**
- Marge brute : **84 €/utilisateur/an** *(coût tech ~12 €)*

---

## Slide 13 — Roadmap, régulation & risques

**Roadmap**
- 🟢 **M1–3** : MVP énergie + mobile, mode validation manuelle
- 🟡 **M4–6** : mode 100 % auto, partenariats 5 fournisseurs
- 🟠 **M7–12** : extension assurance habitation + auto + mutuelle
- 🔵 **An 2** : B2G — collectivités, lutte précarité énergétique

**Cadre légal cadré**
- ✅ **Pas d'ORIAS requis** pour intermédiation énergie pure (couvre assurance/banque/finance)
- ✅ Mandat SEPA + procuration eIDAS = juridiquement solide
- ⚠️ Démarchage tél interdit (sanction 375 k€) → acquisition 100 % digitale obligatoire
- ⚠️ Cooldown 90 j anti-blacklisting fournisseur codé en dur

---

## Slide 14 — L'ask

**Aujourd'hui** : un MVP qui marche, 4 actions agentiques en live, sur un marché de **9 Md€** dormants.

**Les 12 prochains mois** :
- 5 partenariats fournisseurs d'élec d'ici juillet 2026
- 1 000 utilisateurs bêta avant fin 2026
- Levée seed Q1 2027 pour scaling marketing + extension assurance

> **AutoSwitch transforme un comportement annuel pénible en un service silencieux qui rapporte de l'argent à vie.**

> *« Tu connectes une fois. On optimise pour la vie. »*

**Merci. Questions ?**

---

<!--
Notes de compression vers 10 slides :
- Fusionner 1 + 2 → "Problème + chiffres"
- Fusionner 3 + 4 → "Solution + cas Marie"
- Fusionner 5 + 6 → "Tech + IA"
- Garder : Pourquoi maintenant, Démo, Marché, Demande, Concurrence, BM, Roadmap, Ask = 8 slides
- Total compressé : 1 (intro) + 3 (fusionnés) + 8 = 12 → cible 10 atteignable

Toutes les sources sont consolidées dans data.md (16 sections, ~80 sources).
-->
