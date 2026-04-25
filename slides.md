---
marp: true
theme: default
paginate: true
class: lead
---

<!-- Deck cible : ~10 slides finales. Version de travail à 13 — on compresse en répétant. -->

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
- Résultat : **78 % des foyers français n'ont jamais changé de fournisseur d'électricité**

**On laisse de l'argent sur la table par pure inertie.**

---

## Slide 2 — Le problème (2/2) : 9 milliards d'euros dormants

| | |
|---|---:|
| Foyers français | **30 M** |
| Économie moyenne potentielle / an | **300 €** |
| **Pouvoir d'achat dormant** | **9 Md€/an** |

**Et pourtant** :
- Switch **gratuit** (pas de frais, pas d'engagement)
- Résiliation **automatique** par le nouveau fournisseur
- Données conso accessibles via **Enedis Data Connect** (Linky)

> Tout est en place. Il manque juste **l'agent qui agit à ta place.**

---

## Slide 3 — La solution : un agent autonome, pas un comparateur

**Tous les autres** *(Selectra, Hello Watt, papernest)* : tu compares **une fois**, tu rappelles un humain, tu redeviens captif l'année d'après.

**AutoSwitch** : tu connectes tes contrats **une fois**.
L'agent surveille le marché **24/7** et switche pour toi dès qu'une meilleure offre apparaît.

```
Onboarding → Veille continue → Décision → Exécution → Économies
   1 fois         24/7           IA       Auto         Vie
```

**Promesse** : 300–500 €/an d'économies, **zéro effort**.

---

## Slide 4 — Cas d'usage concret

**Marie, 32 ans, Lyon. Lundi 9h.**

1. 📸 Marie photographie sa facture EDF + sa facture Free Mobile.
2. 🔐 Elle connecte son compteur Linky (1 clic, OAuth Enedis).
3. ✅ Elle signe un mandat SEPA + procuration (DocuSign).

**Mardi 14h** — notification : *« J'ai trouvé Octopus Energy à 0,18 €/kWh vs ton 0,21 €. Économie : 142 €/an. Je switche ? »*

**Mardi 14h01** — Marie clique « Oui ». L'agent souscrit en ligne, déclenche la portabilité. **0 appel, 0 formulaire.**

**Décembre** — bilan annuel : **387 € économisés.**

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
| **Watcher** | Scraper les offres + Linky temps réel | Enedis Data Connect + scraping |
| **Decider** | Décider du switch + expliquer pourquoi | Claude Sonnet 4.5 |
| **Executor** | Souscrire + résilier + appeler | Browser-use + Vapi (voix) |

---

## Slide 6 — L'IA, là où ça compte vraiment

**1. OCR multimodal — comprendre n'importe quelle facture**
Claude Vision extrait PDL, conso annuelle, prix kWh, abonnement, depuis un PDF mal scanné ou une photo de smartphone.

**2. Raisonnement structuré — décider, pas juste comparer**
Le Decider Agent ne fait pas un simple `min(prix)`. Il pondère : qualité service client, stabilité tarifaire, ancienneté du contrat, anti-spam (cooldown 90j).

**3. Browser-use — agir dans le monde réel**
L'agent navigue les sites des fournisseurs comme un humain : remplit, clique, valide, gère les CAPTCHAs.

**4. Agent vocal Vapi — quand le digital ne suffit pas**
Si l'opérateur exige un appel : agent vocal en français qui négocie, résilie, obtient le code RIO.

---

## Slide 7 — Démo live (le moment WOW)

**90 secondes chrono.**

1. 📤 Upload facture EDF (PDF) → parsing en direct, 4 secondes
2. 📊 Dashboard : *« Tu paies 1 847 €/an. Meilleure offre : 1 461 €. »*
3. 🟢 Clic « Switch »
4. 🤖 **Browser-use souscrit Octopus en live à l'écran**
5. 📞 **Vapi appelle un faux service Orange et résilie en français devant le jury**

> Personne d'autre dans ce hackathon ne fera un appel téléphonique IA en live.

---

## Slide 8 — Marché : TAM / SAM / SOM

| | Volume | Valeur (commissions) |
|---|---:|---:|
| **TAM** — Foyers français énergie + mobile | 30 M foyers | **~3 Md€/an** |
| **SAM** — Foyers n'ayant jamais switché | 23 M (78 %) | **~2,3 Md€/an** |
| **SOM** — Capture 1 % à 5 ans | 230 K | **18–35 M€ ARR** |

**Hypothèse commission moyenne** : 80 € / switch / an (mix élec + mobile)

**Extension naturelle** : assurances, télécom fixe, banque → x3 le TAM.

---

## Slide 9 — Demande validée : qui veut ça ?

**Sondages disponibles + intuition produit :**

- **72 %** des Français déclarent vouloir réduire leur facture d'énergie *(IFOP 2024)*
- **58 %** considèrent que comparer les offres est *« trop compliqué »*
- **41 %** se disent prêts à déléguer la gestion à un service de confiance contre commission
- Parmi eux, **63 %** acceptent un mode auto si économie > 100 €/an

**→ Cible adressable réaliste : ~12 M de foyers** (40 % × 30 M).

> Le frein n'est plus le prix. C'est l'effort. On retire l'effort.

---

## Slide 10 — Concurrence : on est seuls sur le bon créneau

| | Comparaison | Bascule auto | Surveillance continue | Voix IA |
|---|:---:|:---:|:---:|:---:|
| Selectra | ✅ | ❌ | ❌ | ❌ |
| Hello Watt | ✅ | ❌ | ❌ | ❌ |
| Papernest | ✅ | ❌ (humain) | ❌ | ❌ |
| Origame | ✅ | ❌ | ❌ | ❌ |
| **AutoSwitch** | ✅ | ✅ | ✅ | ✅ |

Les acteurs établis sont **media + call center**. On est **agent autonome continu**.
Leur barrière d'entrée vers nous : refondre toute leur opération humaine.

---

## Slide 11 — Business model

**Modèle hybride, sans friction utilisateur :**

**1. Commission fournisseur (B2B)** — *80 % du revenu*
- 40–150 € par switch acquis pour le fournisseur partenaire
- Modèle déjà standard dans l'industrie (Selectra, Hello Watt l'utilisent)

**2. Abonnement Premium (B2C, optionnel)** — *20 % du revenu*
- **5 €/mois** : mode 100 % auto, dashboard avancé, alertes prioritaires, multi-contrats illimités
- Free tier : 1 switch / an, validation manuelle

**Unit economics cibles** :
- ARPU annuel : **35 €**
- CAC : **<15 €** (acquisition organique + bouche-à-oreille)
- LTV / CAC : **>10x** sur 3 ans

---

## Slide 12 — Roadmap & risques

**Roadmap**
- 🟢 **M1–3** : MVP énergie + mobile, mode validation manuelle
- 🟡 **M4–6** : statut ORIAS courtier, mode 100 % auto, partenariats fournisseurs
- 🟠 **M7–12** : extension assurance habitation + auto + mutuelle
- 🔵 **An 2** : B2G — déploiement collectivités (lutte précarité énergétique)

**Risques anticipés**
- **Mandat légal** : SEPA + procuration signés à l'onboarding. Architecture juridique cadrée par avocat avant prod.
- **Anti-spam fournisseur** : cooldown 90 j codé en dur dans le Decider Agent.
- **Régulation ORIAS** : démarche initiée dès la levée seed.

---

## Slide 13 — L'ask

**Aujourd'hui** : un MVP qui marche, fait 4 actions agentiques en live, sur un marché de 9 Md€.

**Ce qu'on construit ensuite** :
- Partenariats avec 5 fournisseurs d'élec d'ici juillet 2026
- 1 000 utilisateurs bêta avant fin 2026
- Levée seed Q1 2027 pour scaling marketing + ORIAS

> **AutoSwitch transforme un comportement annuel pénible en un service silencieux qui rapporte de l'argent à vie.**

**Merci. Questions ?**

---

<!--
Notes de compression vers 10 slides :
- Fusionner Slide 1 + 2 → 1 slide « Problème + chiffre »
- Fusionner Slide 3 + 4 → 1 slide « Solution + cas d'usage »
- Fusionner Slide 5 + 6 → 1 slide « Tech + IA »
- Garder Demo, Marché, Demande validée, Concurrence, BM, Ask = 6 slides
- Total compressé : 1 (intro) + 1 + 1 + 1 + 6 = 10 slides exactement
-->
