// Game constants
const LEVELS = {
    BRONZE: { name: 'PME', symbol: '🟤', color: '#CD7F32', coefficient: 1, taxLevel: 0 },
    SILVER: { name: 'Entreprise', symbol: '⚪', color: '#C0C0C0', coefficient: 2, taxLevel: 1 },
    GOLD: { name: 'Groupe', symbol: '🟡', color: '#FFD700', coefficient: 3, taxLevel: 2 }
};

const COSTS = {
    EMPLOYEE_HIRE: 2,
    MACHINE_BUY: 20,
    MACHINE_SELL: 10,
    RD_INVEST: 5,
    MARKETING_INVEST: 3,
    SALARY_INCREASE: 1,
    EMPLOYEE_COST_PER_TURN: 1,
    MACHINE_COST_PER_TURN: 1,
    FIXED_COSTS: 1
};

const PRODUCTION = {
    EMPLOYEE: 2,
    MACHINE: 10
};

const EVENTS = {
    BONUS: [
        { name: 'Subvention innovation', effect: 'bonus', description: '+1⭐, +2 revenus', apply: (player) => { player.reputation++; player.addTokens(2); }},
        { name: 'Client public', effect: 'bonus', description: '+2 ventes', apply: (player) => { player.addTokens(2); }},
        { name: 'Machine neuve', effect: 'bonus', description: '+10 production ce tour', apply: (player) => { player.tempProduction = (player.tempProduction || 0) + 10; }}
    ],
    MALUS: [
        { name: 'Crise', effect: 'malus', description: 'Marché -20%', apply: (game) => { game.marketPenalty = 0.8; }},
        { name: 'Grève', effect: 'malus', description: 'Employés inactifs ce tour', apply: (player) => { player.employeesActive = false; }},
        { name: 'Panne machine', effect: 'malus', description: 'Perte 1 machine', apply: (player) => { if(player.machines > 0) player.machines--; }}
    ],
    CHOICE: [
        { name: 'Délocaliser?', effect: 'choice', description: '-1 charge/employé, -1⭐', apply: (player) => { player.delocalisation = true; player.reputation = Math.max(0, player.reputation - 1); }},
        { name: 'Automatiser?', effect: 'choice', description: '-20 jetons, +1 machine, -1⭐', apply: (player) => { if(player.removeTokens(20)) { player.machines++; player.reputation = Math.max(0, player.reputation - 1); }}},
        { name: 'Campagne éthique?', effect: 'choice', description: '-5 jetons, +1⭐ permanent', apply: (player) => { if(player.removeTokens(5)) { player.reputation++; }}}
    ]
};

// Player class
class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.tokens = { bronze: 10, silver: 0, gold: 0 };
        this.employees = 1;
        this.machines = 0;
        this.reputation = 1;
        this.tempReputation = 0;
        this.tempProduction = 0;
        this.employeesActive = true;
        this.delocalisation = false;
        this.production = 0;
        this.sales = 0;
        this.revenue = 0;
        this.bankrupt = false;
    }

    getLevel() {
        if (this.tokens.gold >= 1) return 'GOLD';
        if (this.tokens.silver >= 1) return 'SILVER';
        return 'BRONZE';
    }

    getTotalTokens() {
        return this.tokens.bronze + (this.tokens.silver * 10) + (this.tokens.gold * 100);
    }

    addTokens(amount) {
        const level = this.getLevel();
        if (level === 'GOLD') {
            this.tokens.gold += amount;
        } else if (level === 'SILVER') {
            this.tokens.silver += amount;
        } else {
            this.tokens.bronze += amount;
        }
        this.convertTokens();
    }

    removeTokens(amount) {
        // Try to remove tokens starting from current level
        let remaining = amount;
        const level = this.getLevel();

        if (level === 'GOLD') {
            if (this.tokens.gold >= remaining) {
                this.tokens.gold -= remaining;
                return true;
            }
            remaining -= this.tokens.gold;
            this.tokens.gold = 0;
        }

        if ((level === 'GOLD' || level === 'SILVER') && remaining > 0) {
            const silverNeeded = Math.ceil(remaining / 10);
            if (this.tokens.silver >= silverNeeded) {
                this.tokens.silver -= silverNeeded;
                const excess = (silverNeeded * 10) - remaining;
                this.tokens.bronze += excess;
                return true;
            }
            remaining -= (this.tokens.silver * 10);
            this.tokens.silver = 0;
        }

        if (remaining > 0) {
            const bronzeNeeded = Math.ceil(remaining / 1);
            if (this.tokens.bronze >= bronzeNeeded) {
                this.tokens.bronze -= bronzeNeeded;
                return true;
            }
            return false; // Not enough tokens
        }

        return true;
    }

    convertTokens() {
        // Convert bronze to silver
        if (this.tokens.bronze >= 10) {
            const silver = Math.floor(this.tokens.bronze / 10);
            this.tokens.silver += silver;
            this.tokens.bronze = this.tokens.bronze % 10;
        }

        // Convert silver to gold
        if (this.tokens.silver >= 10) {
            const gold = Math.floor(this.tokens.silver / 10);
            this.tokens.gold += gold;
            this.tokens.silver = this.tokens.silver % 10;
        }
    }

    calculateProduction() {
        const employeeProd = this.employeesActive ? this.employees * PRODUCTION.EMPLOYEE : 0;
        const machineProd = this.machines * PRODUCTION.MACHINE;
        this.production = employeeProd + machineProd + this.tempProduction;
        return this.production;
    }

    calculateCosts() {
        const employeeCost = this.delocalisation ? 0 : this.employees * COSTS.EMPLOYEE_COST_PER_TURN;
        const machineCost = this.machines * COSTS.MACHINE_COST_PER_TURN;
        return employeeCost + machineCost + COSTS.FIXED_COSTS;
    }

    getTotalReputation() {
        return this.reputation + this.tempReputation;
    }

    resetTempEffects() {
        this.tempReputation = 0;
        this.tempProduction = 0;
        this.employeesActive = true;
        this.delocalisation = false;
    }
}

// Game class
class Game {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.turn = 1;
        this.phase = 1;
        this.marketSize = 0;
        this.marketPenalty = 1;
        this.gameStarted = false;
    }

    init(playerCount) {
        this.players = [];
        for (let i = 0; i < playerCount; i++) {
            this.players.push(new Player(i, `Joueur ${i + 1}`));
        }
        this.gameStarted = true;
        this.render();
        this.showPhase(1);
        this.log('Partie démarrée avec ' + playerCount + ' joueurs', 'success');
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    // Phase 1: Production and Expenses
    hireEmployee() {
        const player = this.getCurrentPlayer();
        if (player.removeTokens(COSTS.EMPLOYEE_HIRE)) {
            player.employees++;
            player.reputation++;
            this.log(`${player.name} recrute un employé (+1⭐)`, 'success');
            this.render();
        } else {
            this.log(`${player.name} n'a pas assez de jetons!`, 'error');
        }
    }

    buyMachine() {
        const player = this.getCurrentPlayer();
        if (player.removeTokens(COSTS.MACHINE_BUY)) {
            player.machines++;
            player.reputation = Math.max(0, player.reputation - 1);
            this.log(`${player.name} achète une machine (-1⭐)`, 'success');
            this.render();
        } else {
            this.log(`${player.name} n'a pas assez de jetons!`, 'error');
        }
    }

    fireEmployee() {
        const player = this.getCurrentPlayer();
        if (player.employees > 0) {
            player.employees--;
            player.reputation = Math.max(0, player.reputation - 1);
            this.log(`${player.name} licencie un employé (-1⭐)`, 'success');
            this.render();
        } else {
            this.log(`${player.name} n'a pas d'employés!`, 'error');
        }
    }

    sellMachine() {
        const player = this.getCurrentPlayer();
        if (player.machines > 0) {
            player.machines--;
            player.addTokens(COSTS.MACHINE_SELL);
            this.log(`${player.name} vend une machine`, 'success');
            this.render();
        } else {
            this.log(`${player.name} n'a pas de machines!`, 'error');
        }
    }

    investRD() {
        const player = this.getCurrentPlayer();
        if (player.reputation >= 5) {
            this.log(`${player.name} a déjà 5⭐ maximum!`, 'error');
            return;
        }
        if (player.removeTokens(COSTS.RD_INVEST)) {
            player.reputation++;
            this.log(`${player.name} investit en R&D (+1⭐ permanent)`, 'success');
            this.render();
        } else {
            this.log(`${player.name} n'a pas assez de jetons!`, 'error');
        }
    }

    investMarketing() {
        const player = this.getCurrentPlayer();
        if (player.removeTokens(COSTS.MARKETING_INVEST)) {
            player.tempReputation++;
            this.log(`${player.name} lance une campagne marketing (+1⭐ temporaire)`, 'success');
            this.render();
        } else {
            this.log(`${player.name} n'a pas assez de jetons!`, 'error');
        }
    }

    investSalary() {
        const player = this.getCurrentPlayer();
        const cost = player.employees * COSTS.SALARY_INCREASE;
        if (player.removeTokens(cost)) {
            player.tempReputation++;
            this.log(`${player.name} augmente les salaires (+1⭐ temporaire)`, 'success');
            this.render();
        } else {
            this.log(`${player.name} n'a pas assez de jetons!`, 'error');
        }
    }

    endPhase1() {
        // Pay costs for all players
        this.log('=== Paiement des charges ===', 'phase');
        let allCanPay = true;

        for (let player of this.players) {
            if (player.bankrupt) continue;

            const costs = player.calculateCosts();
            if (player.removeTokens(costs)) {
                player.calculateProduction();
                this.log(`${player.name}: -${costs} jetons (charges), Production: ${player.production} unités`, 'success');
            } else {
                this.log(`${player.name} ne peut pas payer ses charges! Faillite.`, 'error');
                player.bankrupt = true;
                allCanPay = false;
            }
        }

        this.render();

        if (!this.checkGameOver()) {
            this.showPhase(2);
        }
    }

    // Phase 2: Market
    processMarket() {
        this.log('=== Phase Marché ===', 'phase');

        // Calculate market size
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const diceTotal = dice1 + dice2;

        let coefficientSum = 0;
        for (let player of this.players) {
            if (!player.bankrupt) {
                const level = LEVELS[player.getLevel()];
                coefficientSum += level.coefficient;
            }
        }

        const activePlayers = this.players.filter(p => !p.bankrupt).length;
        this.marketSize = Math.floor((diceTotal * activePlayers + coefficientSum) * this.marketPenalty);

        this.log(`Dés: ${dice1} + ${dice2} = ${diceTotal}, Joueurs actifs: ${activePlayers}, Coefficients: ${coefficientSum}`, 'info');
        this.log(`Taille du marché: ${this.marketSize} unités`, 'info');

        // Calculate total reputation
        let totalReputation = 0;
        for (let player of this.players) {
            if (!player.bankrupt) {
                totalReputation += player.getTotalReputation();
            }
        }

        if (totalReputation === 0) {
            this.log('Aucune réputation! Pas de ventes ce tour.', 'error');
            this.showPhase(3);
            return;
        }

        // Distribute market shares
        for (let player of this.players) {
            if (player.bankrupt) continue;

            const marketShare = (player.getTotalReputation() / totalReputation);
            const potentialSales = Math.floor(this.marketSize * marketShare);
            player.sales = Math.min(potentialSales, player.production);
            player.revenue = player.sales;

            player.addTokens(player.revenue);

            this.log(`${player.name}: ${(marketShare * 100).toFixed(1)}% du marché, vend ${player.sales}/${player.production} unités → +${player.revenue} jetons`, 'success');
        }

        this.render();
        this.showPhase(3);
    }

    // Phase 3: Taxes
    processTaxes() {
        this.log('=== Phase Impôts ===', 'phase');

        for (let player of this.players) {
            if (player.bankrupt) continue;

            // Calculate taxes
            const revenueTax = Math.floor(player.revenue * 0.2);
            const employeeTax = player.employees * 1;
            const machineTax = player.machines * 2;
            const level = LEVELS[player.getLevel()];
            const structuralTax = level.taxLevel;

            const totalTax = revenueTax + employeeTax + machineTax + structuralTax;

            if (player.removeTokens(totalTax)) {
                this.log(`${player.name}: -${totalTax} jetons (revenus: ${revenueTax}, employés: ${employeeTax}, machines: ${machineTax}, structure: ${structuralTax})`, 'success');
            } else {
                this.log(`${player.name} ne peut pas payer ses impôts! Faillite.`, 'error');
                player.bankrupt = true;
            }
        }

        this.render();

        if (!this.checkGameOver()) {
            this.showPhase(4);
        }
    }

    // Phase 4: Events
    processEvent() {
        this.log('=== Phase Événement ===', 'phase');

        const random = Math.random();
        let eventType, eventList;

        if (random < 0.4) {
            eventType = 'BONUS';
            eventList = EVENTS.BONUS;
        } else if (random < 0.8) {
            eventType = 'MALUS';
            eventList = EVENTS.MALUS;
        } else {
            eventType = 'CHOICE';
            eventList = EVENTS.CHOICE;
        }

        const event = eventList[Math.floor(Math.random() * eventList.length)];

        document.getElementById('event-text').innerHTML = `
            <strong>${eventType}: ${event.name}</strong><br>
            ${event.description}
        `;

        // Apply event to random player or game
        if (event.effect === 'malus' && event.name === 'Crise') {
            event.apply(this);
            this.log(`Événement: ${event.name} - ${event.description}`, 'error');
        } else {
            const activePlayers = this.players.filter(p => !p.bankrupt);
            if (activePlayers.length > 0) {
                const targetPlayer = activePlayers[Math.floor(Math.random() * activePlayers.length)];
                event.apply(targetPlayer);
                this.log(`Événement: ${event.name} affecte ${targetPlayer.name} - ${event.description}`, 'info');
            }
        }

        this.render();

        document.getElementById('next-turn-btn').classList.remove('hidden');
    }

    nextTurn() {
        // Reset temporary effects
        for (let player of this.players) {
            player.resetTempEffects();
        }

        // Reset market penalty
        this.marketPenalty = 1;

        this.turn++;
        this.log(`\n=== TOUR ${this.turn} ===\n`, 'phase');

        if (!this.checkGameOver()) {
            this.showPhase(1);
        }
    }

    checkGameOver() {
        // Check for 100 gold victory
        for (let player of this.players) {
            if (player.tokens.gold >= 100) {
                this.endGame(player, 'capitaliste');
                return true;
            }
        }

        // Check for last survivor
        const activePlayers = this.players.filter(p => !p.bankrupt);
        if (activePlayers.length === 1) {
            this.endGame(activePlayers[0], 'survivant');
            return true;
        }

        if (activePlayers.length === 0) {
            this.endGame(null, 'none');
            return true;
        }

        return false;
    }

    endGame(winner, type) {
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('victory-screen').classList.remove('hidden');

        if (type === 'capitaliste') {
            document.getElementById('victory-message').textContent =
                `${winner.name} a atteint 100 jetons Or! Tu as dompté le système.`;
        } else if (type === 'survivant') {
            document.getElementById('victory-message').textContent =
                `${winner.name} est le dernier survivant! Tu as tenu, malgré tout.`;
        } else {
            document.getElementById('victory-message').textContent =
                `Tous les joueurs sont en faillite! Partie terminée.`;
        }
    }

    showPhase(phase) {
        this.phase = phase;

        // Hide all phase actions
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`phase${i}-actions`).classList.add('hidden');
        }

        // Show current phase
        document.getElementById(`phase${phase}-actions`).classList.remove('hidden');
        document.getElementById('next-turn-btn').classList.add('hidden');

        // Update phase name
        const phaseNames = {
            1: '1: Production & Dépenses',
            2: '2: Marché',
            3: '3: Impôts',
            4: '4: Événements'
        };
        document.getElementById('phase-name').textContent = phaseNames[phase];

        this.render();
    }

    log(message, type = 'info') {
        const logDiv = document.getElementById('game-log');
        const entry = document.createElement('div');
        entry.className = `log-entry log-${type}`;
        entry.textContent = message;
        logDiv.appendChild(entry);
        logDiv.scrollTop = logDiv.scrollHeight;
    }

    render() {
        // Update turn number
        document.getElementById('turn-number').textContent = this.turn;
        document.getElementById('market-size').textContent = this.marketSize > 0 ? this.marketSize : '-';

        // Update player selector
        const select = document.getElementById('current-player-select');
        select.innerHTML = '';
        this.players.forEach((player, index) => {
            if (!player.bankrupt) {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = player.name;
                option.selected = index === this.currentPlayerIndex;
                select.appendChild(option);
            }
        });

        select.onchange = (e) => {
            this.currentPlayerIndex = parseInt(e.target.value);
            this.render();
        };

        // Render players
        const container = document.getElementById('players-container');
        container.innerHTML = '';

        this.players.forEach(player => {
            const card = this.createPlayerCard(player);
            container.appendChild(card);
        });
    }

    createPlayerCard(player) {
        const card = document.createElement('div');
        card.className = 'player-card';
        if (player.id === this.currentPlayerIndex && !player.bankrupt) {
            card.classList.add('current-player');
        }
        if (player.bankrupt) {
            card.classList.add('bankrupt');
        }

        const level = LEVELS[player.getLevel()];

        card.innerHTML = `
            <div class="player-header">
                <div class="player-name">${player.name}${player.bankrupt ? ' (Faillite)' : ''}</div>
                <div class="player-level">${level.symbol}</div>
            </div>
            <div class="player-stats">
                <div class="stat">
                    <div class="stat-label">🟤 Bronze</div>
                    <div class="stat-value token-bronze">${player.tokens.bronze}</div>
                </div>
                <div class="stat">
                    <div class="stat-label">⚪ Argent</div>
                    <div class="stat-value token-silver">${player.tokens.silver}</div>
                </div>
                <div class="stat">
                    <div class="stat-label">🟡 Or</div>
                    <div class="stat-value token-gold">${player.tokens.gold}</div>
                </div>
                <div class="stat">
                    <div class="stat-label">Total</div>
                    <div class="stat-value">${player.getTotalTokens()}</div>
                </div>
            </div>
            <div class="reputation">
                Réputation: ${'⭐'.repeat(player.getTotalReputation())} (${player.reputation}${player.tempReputation > 0 ? `+${player.tempReputation}` : ''})
            </div>
            <div class="resources">
                <div class="resource-item">
                    <div class="resource-icon">👷</div>
                    <div class="resource-count">${player.employees}</div>
                </div>
                <div class="resource-item">
                    <div class="resource-icon">⚙️</div>
                    <div class="resource-count">${player.machines}</div>
                </div>
                <div class="resource-item">
                    <div class="resource-icon">📦</div>
                    <div class="resource-count">${player.production}</div>
                </div>
            </div>
        `;

        return card;
    }
}

// Initialize game
let game = new Game();

// Setup screen
document.getElementById('start-game').addEventListener('click', () => {
    const playerCount = parseInt(document.getElementById('player-count').value);
    if (playerCount >= 2 && playerCount <= 6) {
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        game.init(playerCount);
    }
});
