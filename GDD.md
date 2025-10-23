# 🎯 GDD v8.2 — *Qui est le Patron ?*
> *Tu peux tout perdre à vouloir tout faire tourner.*

## 🧭 1. Concept général

**But du jeu**  
Chaque joueur incarne un chef d’entreprise et doit **produire, vendre, payer et survivre** dans une économie concurrentielle.  
Le jeu simule les cycles économiques avec une monnaie unique, des charges fixes, un marché fluctuant et une fiscalité progressive.

Deux conditions de victoire :
- 💰 **Capitaliste** : atteindre **100 jetons Or** (succès économique ultime).  
- 💀 **Survivant** : être le dernier joueur non en faillite.

## 🪙 2. Monnaie et niveaux d’entreprise

| Niveau | Type de jeton | Valeur symbolique | Conversion | Couleur |
|--------|----------------|------------------|-------------|----------|
| 🟤 **PME** | Bronze | 1 000 € symboliques | — | Cuivre |
| ⚪ **Entreprise** | Argent | 10 000 € symboliques | 10 🟤 = 1 ⚪ | Argent |
| 🟡 **Groupe** | Or | 100 000 € symboliques | 10 ⚪ = 1 🟡 | Or |

**Jetons indivisibles**
Toutes les transactions s'arrondissent à l'unité inférieure.
La conversion de couleur matérialise la croissance.

**Capital de départ**
Chaque joueur commence avec **50 jetons Bronze** (🟤).

## 🔄 3. Cycle du jeu

Chaque **tour = 1 année** (ou trimestre selon le rythme voulu).

| Phase | Description | Sensation |
|-------|--------------|------------|
| 1️⃣ **Dépenses / Production** | Décider embauches, machines, charges, investissements en réputation | “J’avance mon argent avant de savoir.” |
| 2️⃣ **Marché** | Taille variable (dés × joueurs × coefficients) | “Je vends selon ma réputation et ma production.” |
| 3️⃣ **Impôts** | 20 % + cotisations + taxes de taille | “Plus je réussis, plus je rends.” |
| 4️⃣ **Événement** | Carte bonus, malus ou dilemme stratégique | “La réalité économique frappe.” |

## ⚙️ 4. Structure de production

| Ressource | Coût d’achat | Coût par tour | Production | Cotisation fiscale | Spécificités |
|------------|--------------|---------------|-------------|---------------------|---------------|
| 👷 **Employé** | –2 jetons | –1 / tour | +2 unités | +1 impôt / tour | +1⭐ réputation |
| ⚙️ **Machine** | –20 jetons | –1 / tour | +10 unités | +2 impôts / tour | risque de panne |
| 🏢 **Charges fixes** | — | –1 / tour | — | — | obligatoires |

**Équilibre général :**
- La machine coûte 10 × plus cher qu’un employé mais produit 5 × plus.  
- L’employé est plus cher à long terme mais améliore la réputation.  
- Acheter une machine retire 1⭐ (automatisation froide).

## 💡 5. Mécanique de réputation

Les joueurs peuvent investir directement dans leur réputation à la **Phase 1**.

| Type d’investissement | Coût | Effet |
|------------------------|------|--------|
| 💡 **R&D** | –5 jetons | +1⭐ durable (max 5⭐) |
| 📢 **Marketing** | –3 jetons | +1⭐ temporaire (1 tour) |
| ❤️ **Salaires +** | –1 jeton / employé | +1⭐ (1 tour) |

**Effet global :**  
Chaque ⭐ = +10 % de parts de marché (cumulatif).  
5⭐ = quasi-dominance : priorité de vente sur le marché.

## 🧾 6. Phase 1 — Dépenses / Production

### Étape 1 — Choisir la structure
- Recruter / licencier / acheter ou vendre des machines.

| Action | Coût | Effet |
|--------|------|--------|
| Recruter 1 employé | –2 | +2 production / +1 charge |
| Acheter 1 machine | –20 | +10 production / +1 charge |
| Licencier 1 employé | — | –1 charge, –1⭐ |
| Vendre 1 machine | +10 | –1 charge |

### Étape 2 — Payer les charges
- 1 jeton / employé  
- 1 jeton / machine  
- 1 jeton de charges fixes

### Étape 3 — Produire
```
Production totale = (2 × 👷) + (10 × ⚙️)
```

## 💸 7. Phase 2 — Marché (revenus dynamiques)

### Étape A — Déterminer la taille du marché
```
Marché total = (2D6 × nombre de joueurs × 2) + (somme des coefficients de taille × 2)
```

| Type d’entreprise | Coefficient |
|-------------------|-------------|
| 🟤 PME | +1 |
| ⚪ Entreprise | +2 |
| 🟡 Groupe | +3 |

### Étape B — Répartition des parts de marché
1. Additionner toutes les ⭐ des joueurs.  
2. Chaque joueur reçoit une part proportionnelle :
   ```
   Part joueur = (⭐joueur / ⭐totales) × marché total
   ```
3. Un joueur ne peut vendre que ce qu’il a produit.  
4. Chaque unité vendue = 1 jeton de son niveau.

### Exemple
| Joueur | Niveau | ⭐ | Production | Marché total = 45 | Part | Ventes | Revenus |
|---------|---------|----|-------------|-------------------|------|---------|----------|
| A | 🟡 | 4⭐ | 25 | — | 40 % | 18 | +18 🟡 |
| B | ⚪ | 3⭐ | 15 | — | 30 % | 13 | +13 ⚪ |
| C | 🟤 | 2⭐ | 8 | — | 20 % | 8 | +8 🟤 |
| D | 🟤 | 1⭐ | 6 | — | 10 % | 4 | +4 🟤 |

## 🏛️ 8. Phase 3 — Impôts et cotisations

| Type de taxe | Montant | Détail |
|---------------|----------|---------|
| Impôt sur revenus | 20 % (arrondi) | proportionnel aux ventes |
| Cotisation par employé | 1 | salaires et charges sociales |
| Cotisation par machine | 2 | maintenance, taxe environnement |
| Taxe structurelle | 0 (PME), 1 (Entreprise), 2 (Groupe) | taille = fiscalité |

**Exemple :**  
Entreprise (⚪) → 3 employés, 1 machine, 12 revenus  
→ 2 impôts + 3 + 2 + 1 = **8 jetons**.

## 🎴 9. Phase 4 — Événements

**Distribution des événements**
**1 seul événement** est tiré par tour et affecte **un joueur choisi aléatoirement** (déterminé par un dé). Ce joueur unique subit l'événement tiré selon les probabilités ci-dessous.

### 🟢 BONUS (40 %)
- *Subvention innovation :* +1⭐, +2 revenus  
- *Client public :* +2 ventes  
- *Machine neuve :* +10 production ce tour

### 🔴 MALUS (40 %)
- *Crise :* Marché –20 %  
- *Grève :* employés inactifs ce tour  
- *Panne machine :* perte 1 machine

### 🟡 CHOIX (20 %)
- *Délocaliser ?* → –1 charge / employé, –1⭐  
- *Automatiser ?* → –20 jetons, +1 machine, –1⭐  
- *Campagne éthique ?* → –5 jetons, +1⭐ permanent

## 📊 10. Tableau de référence (coûts et effets)

| Élément | 🟤 PME (1 k€) | ⚪ Entreprise (10 k€) | 🟡 Groupe (100 k€) | Notes |
|----------|---------------|----------------------|--------------------|-------|
| 👷 Employé (achat) | –2 | –2 | –2 | humain, flexible |
| ⚙️ Machine (achat) | –20 | –20 | –20 | capital lourd |
| Charge/tour 👷 | –1 | –1 | –1 | salaire |
| Charge/tour ⚙️ | –1 | –1 | –1 | maintenance |
| Prod/tour 👷 | +2 | +2 | +2 | — |
| Prod/tour ⚙️ | +10 | +10 | +10 | — |
| Investir R&D | –5 | –5 | –5 | +1⭐ permanent |
| Investir MKT | –3 | –3 | –3 | +1⭐ 1 tour |
| Impôt sur revenu | –20 % | –20 % | –20 % | après ventes |

## 📈 11. Structures types et rentabilité moyenne

| Type | 👷 | ⚙️ | Prod | Charges | Revenus moyens | Bénéfice net | Style |
|------|-----|------|------|-----------|----------------|---------------|--------|
| **Humaine** | 4 | 0 | 8 | 5 | 10 | +3 | +réputation, stable |
| **Automatisée** | 0 | 2 | 20 | 3 | 15 | +9 | riche, fisc lourd |
| **Mixte** | 2 | 1 | 14 | 4 | 12 | +5 | équilibrée |

## 🏁 12. Conditions de victoire

| Type | Condition | Message |
|-------|------------|----------|
| 💰 **Capitaliste** | Atteindre **100 jetons Or** | “Tu as dompté le système.” |
| 💀 **Survivant** | Dernier joueur non en faillite | “Tu as tenu, malgré tout.” |

## 🧠 13. Messages pédagogiques

| Mécanique | Sens |
|------------|-------|
| Payer avant de vendre | “L’entreprise avance les coûts.” |
| Machines = gain court terme | “Le capital remplace le travail.” |
| Réputation → ventes | “L’image est un actif.” |
| Taille → impôts croissants | “La réussite attire la ponction.” |
| Marché aléatoire | “La conjoncture domine le contrôle.” |

## 🎨 14. Matériel & style

**Public :** 12 +  
**Durée :** 30 – 45 min  
**Joueurs :** 2 – 6  

### Matériel
- 3 types de jetons (🟤 / ⚪ / 🟡)  
- Cubes blancs (👷 employés)  
- Cubes gris (⚙️ machines)  
- Pions ⭐ réputation  
- Plateau central : marché + impôts + événements  
- 60 cartes Événement  
- 2 dés D6  

### Style visuel
Design "économie cartoon réaliste", couleurs chaudes, ton humoristique.
Sons : caisse enregistreuse, cliquetis de pièces, ambiance de bureau.

## 🤖 15. Mode Simulation & Intelligence Artificielle

Le jeu inclut un mode simulation permettant de tester l'équilibrage économique et d'analyser les stratégies.

### Stratégies d'IA disponibles
- **🎯 Équilibrée** : Achète des machines à partir de 25 jetons, recrute jusqu'à 4 employés, investit régulièrement en R&D
- **⚡ Agressive** : Achète des machines dès 22 jetons (peut en acheter 2 à la fois quand riche), recrute jusqu'à 5 employés, marketing constant
- **🛡️ Conservatrice** : Maintient un buffer de 3 tours de charges, n'investit qu'avec un surplus, privilégie la stabilité
- **⭐ Réputation** : Double investissement en R&D, marketing systématique, recrute 2-4 employés pour maximiser la réputation

### Simulation de matchs
- Possibilité de lancer **1 à 1000 matchs** automatiques
- Chaque match génère des données de performance
- Export des résultats en **fichier CSV** pour analyse statistique
- Données exportées : type de victoire, durée, jetons finaux, structure productive de chaque joueur

**Utilité :**
Permet d'identifier les déséquilibres économiques, tester des modifications de règles, et valider que plusieurs stratégies viables coexistent.

## 🧩 16. Exemple de tour (résumé)

1. **Phase 1 – Production**
   - 3 👷, 1 ⚙️ → produit = 16 unités  
   - Charges = 3 + 1 + 1 fixe = –5 jetons

2. **Phase 2 – Marché**
   - 4 joueurs, dés = 8, coeff = 7 → Marché = 23 + 7 = 30 unités  
   - 3⭐ / 12⭐ totales → 25 % du marché → vend 8 unités → +8 jetons

3. **Phase 3 – Impôts**
   - 20 % de 8 = 1 + 3 cotisations + 2 machines + 1 taille = –7 jetons  

4. **Phase 4 – Événement**
   - “Subvention verte : +2 revenus” → +2 jetons  

**Résultat :** 8 – 5 – 7 + 2 = –2 (année difficile !)  

---

© 2025 – Conception : Davi Vasconcellos  
Version GDD v8.2 – Format Markdown prêt pour prototype / dépôt GitHub.
