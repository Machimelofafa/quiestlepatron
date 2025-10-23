// Simulator class for running AI-only game matches

class SimulatorGame extends Game {
    constructor(aiPlayers) {
        super();
        this.aiPlayers = aiPlayers;
        this.players = aiPlayers.map(ai => ai.player);
        this.gameStarted = true;
        this.turn = 1;
        this.phase = 1;
        this.silent = true; // Don't log to console during simulation
    }

    // Override log to be silent during simulation
    log(message, type = 'info') {
        // Silent during simulation
    }

    // Override render to avoid DOM updates during simulation
    render() {
        // No rendering during simulation
    }

    playTurn() {
        // Phase 1: Production and Expenses
        // Get actions from all AI players
        for (const aiPlayer of this.aiPlayers) {
            if (!aiPlayer.player.bankrupt) {
                const actions = aiPlayer.getActions(this);
                aiPlayer.executeActions(this, actions);
            }
        }

        // Pay costs for all players
        for (const player of this.players) {
            if (player.bankrupt) continue;

            const costs = player.calculateCosts();
            if (!player.removeTokens(costs)) {
                player.bankrupt = true;
            } else {
                player.calculateProduction();
            }
        }

        // Check game over after phase 1
        if (this.checkGameOverSilent()) {
            return true;
        }

        // Phase 2: Market
        this.processMarketSilent();

        // Phase 3: Taxes
        this.processTaxesSilent();

        // Check game over after phase 3
        if (this.checkGameOverSilent()) {
            return true;
        }

        // Phase 4: Events
        this.processEventSilent();

        // Reset temporary effects for next turn
        for (const player of this.players) {
            player.resetTempEffects();
        }
        this.marketPenalty = 1;

        this.turn++;

        // Max 50 turns
        if (this.turn > 50) {
            return true;
        }

        return false;
    }

    processMarketSilent() {
        // Calculate market size
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const diceTotal = dice1 + dice2;

        let coefficientSum = 0;
        for (const player of this.players) {
            if (!player.bankrupt) {
                const level = LEVELS[player.getLevel()];
                coefficientSum += level.coefficient;
            }
        }

        const activePlayers = this.players.filter(p => !p.bankrupt).length;
        this.marketSize = Math.floor((diceTotal * activePlayers * 2 + coefficientSum * 2) * this.marketPenalty);

        // Calculate total reputation
        let totalReputation = 0;
        for (const player of this.players) {
            if (!player.bankrupt) {
                totalReputation += player.getTotalReputation();
            }
        }

        if (totalReputation === 0) {
            return;
        }

        // Distribute market shares
        for (const player of this.players) {
            if (player.bankrupt) continue;

            const marketShare = (player.getTotalReputation() / totalReputation);
            const potentialSales = Math.floor(this.marketSize * marketShare);
            player.sales = Math.min(potentialSales, player.production);
            player.revenue = player.sales;

            player.addTokens(player.revenue);
        }
    }

    processTaxesSilent() {
        for (const player of this.players) {
            if (player.bankrupt) continue;

            // Calculate taxes
            const revenueTax = Math.floor(player.revenue * 0.2);
            const employeeTax = player.employees * 1;
            const machineTax = player.machines * 2;
            const level = LEVELS[player.getLevel()];
            const structuralTax = level.taxLevel;

            const totalTax = revenueTax + employeeTax + machineTax + structuralTax;

            if (!player.removeTokens(totalTax)) {
                player.bankrupt = true;
            }
        }
    }

    processEventSilent() {
        const activePlayers = this.players.filter(p => !p.bankrupt);

        // Apply 1 event per player
        for (const player of activePlayers) {
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

            // Apply event to player or game
            if (event.effect === 'malus' && event.name === 'Crise') {
                event.apply(this);
            } else {
                event.apply(player);
            }
        }
    }

    checkGameOverSilent() {
        // Check for 100 gold victory
        for (const player of this.players) {
            if (player.tokens.gold >= 100) {
                return true;
            }
        }

        // Check for last survivor
        const activePlayers = this.players.filter(p => !p.bankrupt);
        if (activePlayers.length <= 1) {
            return true;
        }

        return false;
    }
}

class MatchData {
    constructor(matchNumber) {
        this.matchNumber = matchNumber;
        this.data = [];
    }

    recordTurn(game) {
        for (const player of game.players) {
            this.data.push({
                match: this.matchNumber,
                turn: game.turn,
                player: player.name,
                jetons: player.getTotalTokens(),
                jetons_bronze: player.tokens.bronze,
                jetons_silver: player.tokens.silver,
                jetons_gold: player.tokens.gold,
                reputation: player.reputation,
                employees: player.employees,
                machines: player.machines,
                stock: player.production,
                sales: player.sales,
                revenue: player.revenue,
                bankrupt: player.bankrupt ? 1 : 0,
                level: player.getLevel()
            });
        }
    }

    toCSVRows() {
        return this.data;
    }
}

class Simulator {
    constructor() {
        this.results = [];
    }

    async runSimulation(numMatches, onProgress = null) {
        this.results = [];

        for (let i = 0; i < numMatches; i++) {
            const matchData = this.runMatch(i + 1);
            this.results.push(...matchData.toCSVRows());

            // Call progress callback
            if (onProgress) {
                onProgress(i + 1, numMatches);
            }

            // Yield to browser every 10 matches to avoid blocking
            if (i % 10 === 9) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        return this.results;
    }

    runMatch(matchNumber) {
        // Create 4 AI players with different strategies (newly instantiated each match for variability)
        const strategies = [
            new BalancedStrategy(),
            new AggressiveStrategy(),
            new ConservativeStrategy(),
            new ReputationFocusedStrategy()
        ];

        // Shuffle strategies to randomize player assignments each match
        this.shuffleArray(strategies);

        const aiPlayers = strategies.map((strategy, index) => {
            const player = new Player(index, strategy.name);
            return new AIPlayer(player, strategy);
        });

        const game = new SimulatorGame(aiPlayers);
        const matchData = new MatchData(matchNumber);

        // Record initial state
        matchData.recordTurn(game);

        // Play up to 50 turns
        let gameOver = false;
        while (!gameOver && game.turn <= 50) {
            gameOver = game.playTurn();
            matchData.recordTurn(game);
        }

        return matchData;
    }

    // Fisher-Yates shuffle algorithm
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    toCSV(results) {
        const headers = [
            'match', 'turn', 'player', 'jetons', 'jetons_bronze', 'jetons_silver',
            'jetons_gold', 'reputation', 'employees', 'machines', 'stock',
            'sales', 'revenue', 'bankrupt', 'level'
        ];

        const rows = [headers.join(',')];

        for (const row of results) {
            const values = [
                row.match,
                row.turn,
                row.player,
                row.jetons,
                row.jetons_bronze,
                row.jetons_silver,
                row.jetons_gold,
                row.reputation,
                row.employees,
                row.machines,
                row.stock,
                row.sales,
                row.revenue,
                row.bankrupt,
                row.level
            ];
            rows.push(values.join(','));
        }

        return rows.join('\n');
    }

    downloadCSV(results, filename) {
        const csvContent = this.toCSV(results);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}
