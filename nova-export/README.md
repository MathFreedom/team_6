# Nova — Export complet

Ce dossier contient **tous les fichiers** de l'app Nova prêts à être collés dans un projet Next.js 15 + Tailwind v4 + shadcn/ui.

L'arborescence ci-dessous est exactement celle qu'attend Next.js. **Garde la structure telle quelle**, pose-la sur ton repo, et tout fonctionne.

---

## 📂 Structure à copier

```
src/
├── app/
│   ├── auth/page.tsx                    ← Connexion / Sign in
│   ├── signup/
│   │   ├── identity/page.tsx            ← Étape 1 : prénom + nom
│   │   ├── address/page.tsx             ← Étape 2 : adresse
│   │   └── phone/page.tsx               ← Étape 3 : téléphone + OTP
│   ├── scan-prm/page.tsx                ← Saisie du PRM (scan/manuel)
│   ├── contract/
│   │   ├── provider/page.tsx            ← Choix du fournisseur actuel
│   │   ├── tariff/page.tsx              ← Choix du tarif
│   │   └── offer/page.tsx               ← Choix de l'offre exacte (replié/déplié)
│   ├── analyzing/page.tsx               ← Écran de chargement (15s, 5 phases)
│   ├── results/page.tsx                 ← Top 3 des offres recommandées
│   ├── dashboard/page.tsx               ← Accueil app après onboarding
│   ├── mandate/page.tsx                 ← Signature du mandat SEPA + procuration
│   └── success/page.tsx                 ← Célébration finale (confettis)
├── components/
│   ├── onboarding/MascotBubble.tsx      ← Composant gecko + bulle (réutilisé partout)
│   ├── signup/SignupProgress.tsx        ← Stepper du flow signup
│   └── contract/ContractProgress.tsx    ← Stepper du flow contract
└── data/
    └── all_offers.json                  ← Catalogue d'offres (mock pour le MVP)
```

---

## 🦎 Où placer chaque gecko

Tous les SVG/PNG du gecko vont dans **`public/mascot/`** (à créer à la racine du projet Next.js, **pas dans `src/`**).

### Gecko utilisé dans MascotBubble (toutes les pages d'onboarding)

Le composant `src/components/onboarding/MascotBubble.tsx` utilise actuellement un placeholder gris "GECKO". Quand tu auras ton SVG, remplace dans ce fichier la div placeholder par :

```tsx
<Image src="/mascot/default.svg" alt="" width={size} height={size} />
```

→ **Fichier attendu : `public/mascot/default.svg`** (ou `.png`)

### Geckos de l'écran `/analyzing`

Le fichier `src/app/analyzing/page.tsx` contient ce tableau (déjà câblé) :

```ts
const PHASES = [
  { image: "/mascot/searching.png",  message: "Je récupère ton numéro PRM..." },
  { image: "/mascot/connecting.png", message: "Je me connecte à Enedis et à ton Linky..." },
  { image: "/mascot/thinking.png",   message: "J'analyse ton profil de consommation..." },
  { image: "/mascot/scanning.png",   message: "Je compare les 78 offres du marché..." },
  { image: "/mascot/eureka.png",     message: "Je prépare tes meilleures recommandations !" },
];
```

→ **Fichiers attendus :**
- `public/mascot/searching.png` (ou .svg) — gecko avec une loupe
- `public/mascot/connecting.png` — gecko qui branche un câble
- `public/mascot/thinking.png` — gecko avec une patte sous le menton
- `public/mascot/scanning.png` — gecko qui tient une feuille
- `public/mascot/eureka.png` — gecko surpris / trouvaille

Si tu passes en SVG, change juste l'extension dans le tableau (`.png` → `.svg`), `next/image` gère.

### Gecko de l'écran `/success`

Le fichier `src/app/success/page.tsx` utilise :

```tsx
<Image src="/mascot/dancing.png" alt="Nova fête le switch" fill priority sizes="256px" />
```

→ **Fichier attendu : `public/mascot/dancing.png`** — gecko qui danse, bras levés

### Récap — arborescence `public/`

```
public/
└── mascot/
    ├── default.svg        ← MascotBubble (toutes les pages d'onboarding)
    ├── searching.svg      ← /analyzing phase 1
    ├── connecting.svg     ← /analyzing phase 2
    ├── thinking.svg       ← /analyzing phase 3
    ├── scanning.svg       ← /analyzing phase 4
    ├── eureka.svg         ← /analyzing phase 5
    └── dancing.svg        ← /success
```

---

## 🔁 Ordre des écrans (parcours utilisateur)

```
1.  /auth                        Connexion / inscription
2.  /signup/identity             → Prénom + nom
3.  /signup/address              → Adresse
4.  /signup/phone                → Téléphone + OTP
5.  /scan-prm                    → Saisie du PRM (Linky)
6.  /contract/provider           → Fournisseur actuel
7.  /contract/tariff             → Tarif actuel
8.  /contract/offer              → Offre actuelle exacte
9.  /analyzing                   → Loader 15s pendant l'analyse IA
10. /results                     → Top 3 offres recommandées
11. /mandate                     → Signature du mandat SEPA
12. /success                     → Confettis, switch lancé
                ↓
    /dashboard                   ← accueil après onboarding
                                   (accessible aussi depuis /results "Plus tard")
```

---

## 🎨 Design system (rappel)

```
Background      #ffffff
Bleu primaire   #1e40af
Bleu accent     #dbeafe
Texte principal #0a1628
Texte secondaire #5a6b80
Vert succès     #059669
Or confettis    #fbbf24
```

Toutes les pages sont **mobile-first strict** (`max-width: 430px`, `mx-auto`).

---

## 💾 LocalStorage utilisé

L'app stocke l'état utilisateur dans deux clés :

- **`nova-signup`** — données du signup (`identity`, `address`, `phone`, `currentContract`)
- **`nova-selected-offer`** — offre choisie sur `/results`, lue par `/mandate` et `/success`

Si tu remplaces par un vrai backend, ce sont les deux endpoints à câbler.

---

## 🧩 Dépendances attendues

- `next` ≥ 15
- `react` ≥ 18
- `tailwindcss` v4
- `lucide-react`
- `shadcn/ui` (les pages utilisent `Button`, `Input`, `Checkbox` quand disponibles ; sinon fallbacks inline déjà en place)

---

## ⚠️ Notes pour Claude Code (qui va t'aider à intégrer)

- Les fichiers sont **autonomes** : aucun import vers des composants shadcn n'est obligatoire (les boutons/inputs sont stylés inline avec les couleurs du DS pour éviter les déps cassées).
- `MascotBubble` est le **seul composant cross-screens**. Si tu veux le faire évoluer (vrai gecko SVG, animations, etc.), c'est là qu'il faut éditer.
- Les badges, couleurs, et offres mockées dans `/results` sont en haut de `src/app/results/page.tsx` — facile à remplacer par un fetch.
- L'écran `/analyzing` redirige automatiquement vers `/results` après 15s. Si tu veux un fetch réel pendant ces 15s, lance-le dans le `useEffect` initial et synchronise avec le timer.
