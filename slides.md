---
marp: true
theme: default
paginate: true
class: lead
---

<!-- Deck cible : ~10-12 slides finales. Focus 100 % électricité résidentielle. Sources dans data.md. -->

# AutoSwitch
### *L'agent IA qui te garantit toujours le meilleur tarif d'électricité.*

**Team 6 — Hackathon 2026**

> *Tu connectes ton compteur une fois. On optimise pour la vie.*

---

## Slide 1 — Le problème (1/2) : on paie trop, et on le sait

> *« J'ai signé mon contrat EDF en 2019. Je sais que je paie trop. Je n'ai juste jamais eu le temps de comparer. »*
> — N'importe quel Français, ce matin

- Comparer = 2 h de paperasse
- Switcher = peur des frais cachés *(qui n'existent pas en France, mais personne ne le sait)*
- Résultat : **56 % des foyers français n'ont jamais quitté le tarif réglementé EDF** *(CRE Q4 2025)*

**On laisse de l'argent sur la table par pure inertie.**

---

## Slide 2 — Le problème (2/2) : 9 milliards d'euros dormants

| | |
|---|---:|
| Sites résidentiels électricité | **35 M** *(CRE)* |
| Foyers encore au TRV EDF | **19,75 M (55,8 %)** *(CRE Q4 2025)* |
| Offres marché < TRV | **47 sur 80 (59 %)** *(CRE)* |
| Économie médiane réalisable | **150–320 €/an** *(Hello Watt)* |
| **Pouvoir d'achat dormant** | **~9 Md€/an** |

**Et pourtant** :
- Switch **gratuit**, sans engagement, résiliation auto
- **Linky : 37,6 M compteurs (97 %)**, API Enedis Data Connect gratuite
- **+556 000 Français ont quitté EDF en 2025** — le marché bouge déjà

> Tout est en place. Il manque juste **l'agent qui agit à ta place.**

<small>Sources : [CRE Q4 2025](https://www.cre.fr/fileadmin/Documents/Rapports_et_etudes/2026/Observatoire_T4_2025.pdf), [Libow](https://www.libow.fr/linky-obligatoire-2025/)</small>

---

## Slide 3 — La solution : un agent autonome, pas un comparateur

**Selectra, Hello Watt, Papernest** : tu compares **une fois**, un humain te rappelle, tu redeviens captif l'année d'après.

**AutoSwitch** : tu connectes ton compteur Linky **une seule fois**.
L'agent surveille le marché **24/7** et switche pour toi dès qu'une meilleure offre apparaît.

```
Onboarding → Veille continue → Décision → Exécution → Économies
   1 fois         24/7           IA       Auto         À vie
```

**Promesse chiffrée** :
- **150–320 €/an** pour foyer 6 kVA (5 000 kWh)
- **jusqu'à 620 €/an** pour grande maison + PAC (14 000 kWh)
- Zéro effort, zéro appel, zéro formulaire

---

## Slide 4 — Cas d'usage concret : Marie, 32 ans, Lyon

**Lundi 9h — Onboarding (3 minutes chrono)**
1. 📸 Marie photographie sa facture EDF.
2. 🔐 Connecte son Linky en 1 clic via OAuth Enedis Data Connect.
3. ✅ Signe un mandat SEPA + procuration (DocuSign eIDAS qualifié).

**Mardi 14h — Notification :**
> *« J'ai trouvé Primeo Confort+ à 0,1625 €/kWh vs ton TRV à 0,194 €. Sur ta conso réelle de 5 200 kWh, économie annuelle : **245 €**. Engagement 12 mois, prix bloqué. Je switche ? »*

**Mardi 14h01** — Marie clique « Oui ». Browser-use souscrit. Résiliation EDF automatique. **0 appel, 0 formulaire.**

**Décembre — bilan annuel : 245 € économisés.** L'agent re-évalue le marché tous les jours pour le prochain switch.

---

## Slide 5 — Au-delà du switch : optimisation tarifaire complète

L'agent ne compare pas que des prix kWh. Sur la donnée Linky 30 min, il détecte :

| Optimisation | Détection | Économie potentielle |
|---|---|---:|
| **Switch fournisseur** | Comparaison continue offres marché | 150–320 €/an |
| **Bascule HP/HC** | > 30 % conso nocturne (chauffage, EV, ballon) | 80–200 €/an |
| **Tempo / EJP** | Profil flexible (télétravail, etc.) | 200–400 €/an |
| **Sous/sur-puissance** | Pic réel < puissance souscrite | 30–80 €/an |
| **Alerte indexée** | Offre indexée passe > TRV | Re-switch immédiat |

> **L'agent ne compare pas. Il optimise.** Différenciation forte vs comparateurs.

---

## Slide 6 — Comment ça marche : 4 agents, 1 cerveau

```
┌──────────────────────────────────────────────────────┐
│  ORCHESTRATOR — Claude Sonnet 4.5 + tool use         │
└──────────────────────────────────────────────────────┘
        │              │              │              │
   ┌────▼────┐   ┌─────▼─────┐  ┌─────▼─────┐  ┌────▼─────┐
   │ Onboard │   │ Watcher   │  │ Decider   │  │ Executor │
   │ Agent   │   │ Agent     │  │ Agent     │  │ Agent    │
   └─────────┘   └───────────┘  └───────────┘  └──────────┘
```

| Agent | Job | Tech |
|---|---|---|
| **Onboarding** | Lire la facture, extraire PDL, conso, option tarifaire | Mistral OCR + Claude Vision |
| **Watcher** | Scraper offres + Linky 30 min temps réel | Enedis Data Connect (OAuth2, gratuit) |
| **Decider** | Décider du switch + expliquer pourquoi | Claude Sonnet 4.5 |
| **Executor** | Souscrire + résilier | Browser-use + Vapi (voix FR) |

---

## Slide 7 — L'IA, là où ça compte vraiment

**1. OCR multimodal — comprendre n'importe quelle facture**
Claude Vision extrait PDL (14 chiffres), conso, prix kWh, abonnement, option tarifaire, depuis un PDF mal scanné ou une photo smartphone.

**2. Raisonnement structuré — décider, pas juste comparer**
Le Decider pondère : qualité service, stabilité tarifaire, ancienneté, **cooldown 90 j anti-blacklisting**, alerte cartons rouges Médiateur (Wekiwi, Primagaz, JPME 2024), refus indexée si volatilité spot trop forte.

**3. Browser-use — agir dans le monde réel**
L'agent navigue les sites fournisseurs comme un humain : remplit, clique, valide, gère les CAPTCHAs.

**4. Agent vocal Vapi — quand le digital ne suffit pas**
Si le fournisseur exige un appel SAV pour finaliser : agent vocal en français qui négocie, complète, résilie.

---

## Slide 8 — Pourquoi maintenant : la volatilité crée l'opportunité

**Le prix spot a varié de × 6,4 en 7 jours en avril 2026.**
*(Kelwatt — 37 €/MWh à 235 €/MWh)*

- **25-35 % du marché** est en offres indexées sur le spot
- Les fournisseurs lancent de **nouvelles offres tous les 2-4 mois**
- Une offre top aujourd'hui devient médiane dans 6 mois
- 38 M compteurs Linky envoient des données 30 min en temps réel

**Conséquence** : un comparateur ponctuel devient obsolète immédiatement.
**Notre angle** : re-switch **1,2 fois/an/utilisateur**. Selectra prend une commission une fois, on en génère 1,2.

> Le marché bouge plus vite que les humains. C'est exactement pour ça qu'il faut un agent.

---

## Slide 9 — Démo live (le moment WOW)

**90 secondes chrono.**

1. 📤 Upload facture EDF (PDF) → parsing en direct, 4 secondes
2. 🔐 Connexion Linky démo → courbe de charge 30 min affichée
3. 📊 Dashboard : *« Tu paies 1 158 €/an au TRV. Meilleure offre marché : 926 €. »*
4. 🟢 Clic « Switch »
5. 🤖 **Browser-use souscrit Primeo Confort+ en live à l'écran**
6. 📞 **Vapi appelle un faux SAV et finalise la résiliation en français devant le jury**

> Personne d'autre dans ce hackathon ne fera un appel téléphonique IA en live.

---

## Slide 10 — Marché : TAM / SAM / SOM (électricité résidentielle)

| | Définition | Volume | Valeur (commissions) |
|---|---|---:|---:|
| **TAM** | Sites résidentiels FR | **35 M** | **~3,4 Md€/an** |
| **SAM** | Foyers prêts à déléguer (41 %) | **14,3 M** | **~1,4 Md€/an** |
| **SOM 5 ans** | Capture 2 % du SAM | 287 K | **~28 M€ ARR** |

**Hypothèses** : commission moyenne 80 €/switch, fréquence 1,2 switch/an/utilisateur.

**Validation indépendante** :
- UFC-Que Choisir "Énergie moins chère ensemble" : **132 M€ économisés cumulés**
- CRE achat groupé 2024 : 130 k participants, **160 €/an** d'économie moyenne

**Extension naturelle** : gaz résidentiel (10 M foyers) → x2 le TAM. Puis B2G : précarité énergétique.

---

## Slide 11 — Demande validée : qui veut ça ?

- **72 %** des Français veulent réduire leur facture énergie *(IFOP 2024)*
- **42 %** considèrent le switch *« trop compliqué »* *(CRE)*
- **41 %** se disent prêts à déléguer à un service de confiance
- Parmi eux, **63 %** acceptent le mode auto si économie > 100 €/an

**→ Cible adressable réaliste : 14,3 M de foyers** (41 % × 35 M sites).

> Le frein n'est plus le prix. C'est l'effort. **On retire l'effort.**

---

## Slide 12 — Concurrence : on est seuls sur le bon créneau

| | Comparaison | Bascule auto | Veille continue | Voix IA | Optim. tarifaire |
|---|:---:|:---:|:---:|:---:|:---:|
| Selectra (96 M€ CA) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Hello Watt | ✅ | ❌ | ❌ | ❌ | Partielle |
| Papernest | ✅ | ❌ (humain) | ❌ | ❌ | ❌ |
| Origame | ✅ | ❌ | ❌ | ❌ | ❌ |
| **AutoSwitch** | ✅ | ✅ | ✅ | ✅ | ✅ |

**Validation internationale du modèle** :
- 🇬🇧 **Octopus Energy : 9 Md$ de valuation**, 24 % marché UK, **1 nouveau client toutes les 30 secondes**
- 🇺🇸 **Bilt : 10,75 Md$ valuation** (Série C 250 M$ juillet 2025) sur le bill management
- 🇬🇧 **Look After My Bills** racheté par GoCompare 12,5 M£ — modèle prouvé

> En France : **vide blanc**. Personne n'a tenté l'auto-switch à grande échelle.

---

## Slide 13 — Business model

**Modèle hybride, friction zéro côté utilisateur :**

**1. Commission fournisseur (B2B)** — *80 % du revenu*
- **40–150 € par switch acquis** (Selectra prend 20–60 €)
- Re-switch **1,2 fois/an/utilisateur** = **96 €/utilisateur/an**

**2. Abonnement Premium (B2C)** — *20 % du revenu*
- **5 €/mois** : mode 100 % auto, alertes prio, optimisation tarifaire avancée (Tempo/HP-HC)
- Free tier : 1 switch / an, validation manuelle

**Unit economics cibles** :
- ARPU : **35 €/an** | CAC : **<15 €** *(organique — démarchage tél interdit)*
- Marge brute : **84 €/utilisateur/an** | **LTV/CAC > 10×** sur 3 ans

---

## Slide 14 — Roadmap accéléré, légal & risques

**Roadmap (équipe 4 devs × Claude Code = vitesse 5-10×)**
- 🟢 **J+7** : MVP v1 en prod, 1er fournisseur partenaire signé
- 🟡 **J+30** : 5 partenariats, 500 utilisateurs bêta, mode 100 % auto opt-in
- 🟠 **J+90** : 5 000 utilisateurs, optimisation tarifaire avancée (Tempo/HP-HC)
- 🔵 **Q1 2027** : levée seed, extension gaz, B2G précarité énergétique

**Cadre légal cadré**
- ✅ **Pas d'ORIAS requis** pour intermédiation énergie pure
- ✅ Mandat SEPA + procuration eIDAS = juridiquement solide
- ⚠️ Démarchage tél interdit (sanction 375 k€) → acquisition 100 % digitale
- ⚠️ Cooldown 90 j anti-blacklisting fournisseur codé en dur

---

## Slide 15 — L'ask

**Aujourd'hui** : un MVP qui marche, 4 actions agentiques en live, sur un marché de **9 Md€** dormants.

**Les 90 prochains jours** *(4 devs × Claude Code, vitesse 5-10×)* :
- J+7 : 1er partenariat fournisseur signé + MVP en prod
- J+30 : 500 utilisateurs bêta, 5 partenariats
- J+90 : 5 000 utilisateurs, prep levée seed Q1 2027

> **AutoSwitch transforme un comportement annuel pénible en un service silencieux qui rapporte de l'argent à vie.**

> *« Tu connectes ton compteur une fois. On optimise pour la vie. »*

**Merci. Questions ?**

---

<!--
Notes de compression vers 10 slides :
- Fusionner 1 + 2 → "Problème + chiffres"
- Fusionner 3 + 4 → "Solution + Marie"
- Fusionner 6 + 7 → "Tech + IA"
- Garder : Optim tarifaire, Volatilité (pourquoi maintenant), Démo, Marché, Demande, Concurrence, BM, Roadmap, Ask = 9 slides
- Total compressé : 1 (intro) + 3 (fusionnés) + 9 = 13 → cible 10 atteignable en compressant Optim+Tech

Toutes les sources sont consolidées dans data.md (16 sections, ~80 sources).
-->
