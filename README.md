# 🎯 Qui est le Patron? - Prototype Jouable

> *Tu peux tout perdre à vouloir tout faire tourner.*

## Description

Prototype webapp du jeu de gestion économique "Qui est le Patron?". Incarnez un chef d'entreprise et gérez production, ventes, employés et machines dans une économie concurrentielle.

## Comment jouer

### Lancer le jeu

1. Ouvrez `index.html` dans votre navigateur web
2. Choisissez le nombre de joueurs (2-6)
3. Cliquez sur "Démarrer la partie"

### Objectifs

**Deux conditions de victoire :**
- 💰 **Capitaliste** : Atteindre 100 jetons Or
- 💀 **Survivant** : Être le dernier joueur non en faillite

### Les 4 phases d'un tour

1. **Production & Dépenses** : Recrutez, achetez des machines, investissez en réputation
2. **Marché** : Vendez votre production selon votre réputation
3. **Impôts** : Payez 20% de revenus + charges + taxes de structure
4. **Événements** : Événements aléatoires (bonus, malus, choix)

### Ressources

- **👷 Employés** : Coût 2, produit +2/tour, +1⭐ réputation
- **⚙️ Machines** : Coût 20, produit +10/tour, -1⭐ réputation
- **⭐ Réputation** : Détermine vos parts de marché

### Monnaie

- 🟤 **Bronze** (PME) : 1 000€ symboliques
- ⚪ **Argent** (Entreprise) : 10 000€ symboliques (10 bronze = 1 argent)
- 🟡 **Or** (Groupe) : 100 000€ symboliques (10 argent = 1 or)

## Simulation IA

### Fonctionnalité de simulation

Le jeu inclut maintenant un système de simulation permettant de lancer plusieurs matchs avec 4 joueurs IA et d'exporter les données en CSV.

### Démarrer le serveur de simulation

1. Installer les dépendances Python :
```bash
pip install -r requirements.txt
```

2. Lancer le serveur backend :
```bash
python -m uvicorn backend.main:app --reload
```

Ou utilisez le script de démarrage :
```bash
python run_server.py
```

Le serveur démarrera sur `http://localhost:8000`

### Utiliser la simulation

1. Ouvrez l'interface web (`index.html`)
2. Cliquez sur "Lancer une simulation"
3. Entrez le nombre de matchs à simuler (1-1000)
4. Cliquez sur "Démarrer"
5. Le fichier CSV sera automatiquement téléchargé

### Format des données CSV

Le fichier CSV contient pour chaque tour de chaque match :
- `match` : Numéro du match
- `turn` : Numéro du tour
- `player` : Nom du joueur (IA 1-4)
- `jetons` : Total des jetons
- `jetons_bronze`, `jetons_silver`, `jetons_gold` : Détail des jetons par niveau
- `reputation` : Réputation permanente
- `employees` : Nombre d'employés
- `machines` : Nombre de machines
- `stock` : Production (stock) du tour
- `sales` : Ventes réalisées
- `revenue` : Revenus générés
- `bankrupt` : Statut de faillite (True/False)
- `level` : Niveau de l'entreprise (bronze/silver/gold)

### Stratégies IA

Le système utilise 4 stratégies différentes :
- **Balanced** : Croissance équilibrée
- **Aggressive** : Expansion rapide avec machines
- **Conservative** : Gestion prudente avec buffer financier
- **ReputationFocused** : Maximisation de la réputation

## Fichiers

### Frontend
- `index.html` : Interface du jeu
- `styles.css` : Style et mise en page
- `game.js` : Logique du jeu
- `GDD.md` : Document de conception complet

### Backend (Simulation)
- `backend/main.py` : Serveur FastAPI
- `backend/game_logic.py` : Logique du jeu en Python
- `backend/ai_player.py` : Stratégies IA
- `backend/simulator.py` : Moteur de simulation et export CSV
- `requirements.txt` : Dépendances Python

## Technologie

- **Frontend** : HTML/CSS/JavaScript pur (aucune dépendance)
- **Backend** : Python 3.8+, FastAPI, Uvicorn

---

© 2025 - Conception : Davi Vasconcellos