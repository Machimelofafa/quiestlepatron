// AI Strategy classes for game simulation

class AIStrategy {
    constructor(name) {
        this.name = name;
        // Add random personality traits that vary between matches
        this.aggressiveness = 0.5 + (Math.random() - 0.5) * 0.4; // 0.3 to 0.7
        this.riskTolerance = 0.5 + (Math.random() - 0.5) * 0.4; // 0.3 to 0.7
        this.patience = 0.5 + (Math.random() - 0.5) * 0.4; // 0.3 to 0.7
    }

    // Must be implemented by subclasses
    getActions(player, game) {
        throw new Error('getActions must be implemented by subclass');
    }

    // Helper: make a random decision based on probability
    shouldDo(baseProbability) {
        return Math.random() < baseProbability * this.riskTolerance;
    }
}

class BalancedStrategy extends AIStrategy {
    constructor() {
        super('Balanced');
    }

    getActions(player, game) {
        const actions = [];
        const totalTokens = player.getTotalTokens();

        // Invest in R&D regularly
        if (totalTokens >= 5 && player.reputation < 5 && this.shouldDo(0.75)) {
            actions.push('invest_rd');
        }

        // Hire employees up to 4 total
        if (totalTokens >= 2 && player.employees < 4 && this.shouldDo(0.7)) {
            actions.push('hire_employee');
        }

        // Buy machines starting at 25 tokens with 85% probability
        if (totalTokens >= 25 && this.shouldDo(0.85)) {
            actions.push('buy_machine');
        }

        // Marketing with variable probability
        if (totalTokens >= 3 && this.shouldDo(0.4 + this.aggressiveness * 0.3)) {
            actions.push('invest_marketing');
        }

        return actions;
    }
}

class AggressiveStrategy extends AIStrategy {
    constructor() {
        super('Aggressive');
        // Aggressive strategy is naturally more aggressive
        this.aggressiveness = 0.7 + Math.random() * 0.3; // 0.7 to 1.0
    }

    getActions(player, game) {
        const actions = [];
        const totalTokens = player.getTotalTokens();

        // VERY aggressive on machines - buy starting at 22 tokens
        if (totalTokens >= 22 && this.shouldDo(0.9)) {
            actions.push('buy_machine');
            // Can buy 2 machines at once if very rich (60+ tokens)
            if (totalTokens >= 60 && this.shouldDo(0.7)) {
                actions.push('buy_machine');
            }
        }

        // Hire up to 5 employees
        if (totalTokens >= 2 && player.employees < 5 && this.shouldDo(0.75)) {
            actions.push('hire_employee');
        }

        // Marketing constantly - almost every turn
        if (totalTokens >= 3 && this.shouldDo(0.85)) {
            actions.push('invest_marketing');
        }

        return actions;
    }
}

class ConservativeStrategy extends AIStrategy {
    constructor() {
        super('Conservative');
        // Conservative strategy is more patient and risk-averse
        this.patience = 0.7 + Math.random() * 0.3; // 0.7 to 1.0
        this.riskTolerance = 0.2 + Math.random() * 0.3; // 0.2 to 0.5
    }

    getActions(player, game) {
        const actions = [];
        const totalTokens = player.getTotalTokens();
        const operationalCosts = player.calculateCosts();
        // Keep only 3 turns of buffer
        const buffer = operationalCosts * 3;

        // Only invest if we have a buffer
        if (totalTokens < buffer) {
            // Sell machines if we need to maintain buffer (with some probability)
            if (player.machines > 0 && totalTokens < operationalCosts * 1.5 && this.shouldDo(0.8)) {
                actions.push('sell_machine');
            }
            return actions;
        }

        // Invest in R&D for reputation with caution
        if (totalTokens >= buffer + 5 && player.reputation < 5 && this.shouldDo(0.6)) {
            actions.push('invest_rd');
        }

        // Buy machines if we have a surplus
        if (totalTokens >= buffer + 20 && this.shouldDo(0.6)) {
            actions.push('buy_machine');
        }

        // Salary increases for temp reputation
        const salaryCost = player.employees * COSTS.SALARY_INCREASE;
        if (totalTokens >= buffer + salaryCost && this.shouldDo(0.4 * this.patience)) {
            actions.push('invest_salary');
        }

        return actions;
    }
}

class ReputationFocusedStrategy extends AIStrategy {
    constructor() {
        super('ReputationFocused');
        // This strategy focuses on reputation but with variable intensity
        this.reputationPriority = 0.7 + Math.random() * 0.3; // 0.7 to 1.0
    }

    getActions(player, game) {
        const actions = [];
        const totalTokens = player.getTotalTokens();

        // Double R&D if possible - prioritize getting max reputation
        if (totalTokens >= 5 && player.reputation < 5 && this.shouldDo(0.9)) {
            actions.push('invest_rd');
            // Try to do it twice if possible
            if (totalTokens >= 10 && player.reputation < 4 && this.shouldDo(0.8)) {
                actions.push('invest_rd');
            }
        }

        // Marketing almost every turn to maintain brand
        if (totalTokens >= 3 && this.shouldDo(0.9)) {
            actions.push('invest_marketing');
        }

        // Hire employees for reputation boost
        const employeeCap = Math.floor(2 + this.reputationPriority * 2); // 2 to 4
        if (totalTokens >= 2 && player.employees < employeeCap && this.shouldDo(0.7)) {
            actions.push('hire_employee');
        }

        // Still buy machines if rich enough
        if (totalTokens >= 30 && this.shouldDo(0.65)) {
            actions.push('buy_machine');
        }

        // Salary increases for temp reputation
        const salaryCost = player.employees * COSTS.SALARY_INCREASE;
        if (totalTokens >= salaryCost && this.shouldDo(0.6 * this.reputationPriority)) {
            actions.push('invest_salary');
        }

        return actions;
    }
}
