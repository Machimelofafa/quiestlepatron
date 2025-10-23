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

        // Invest in R&D with variable probability based on personality
        if (totalTokens >= 5 && player.reputation < 5 && this.shouldDo(0.7)) {
            actions.push('invest_rd');
        }

        // Hire employees with variable threshold
        const hireThreshold = 2 - (this.aggressiveness * 0.5);
        if (totalTokens >= 2 && player.getTotalReputation() >= hireThreshold && this.shouldDo(0.6)) {
            actions.push('hire_employee');
        }

        // Buy machines based on capital and risk tolerance
        const machineThreshold = 20 - (this.riskTolerance * 5);
        if (totalTokens >= machineThreshold && this.shouldDo(0.5)) {
            actions.push('buy_machine');
        }

        // Marketing with variable probability
        if (totalTokens >= 3 && this.shouldDo(0.3 + this.aggressiveness * 0.3)) {
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

        // Aggressively buy machines with variable cap
        const machineCap = Math.floor(3 + this.aggressiveness * 3); // 3 to 6 machines
        const machineThreshold = 18 + Math.random() * 6; // 18-24 tokens
        if (totalTokens >= machineThreshold && player.machines < machineCap && this.shouldDo(0.8)) {
            actions.push('buy_machine');
        }

        // Hire many employees with variable behavior
        if (totalTokens >= 2 && totalTokens < machineThreshold) {
            if (this.shouldDo(0.7)) {
                actions.push('hire_employee');
            }
            if (totalTokens >= 4 && this.shouldDo(0.5 * this.aggressiveness)) {
                actions.push('hire_employee');
            }
        }

        // Marketing to boost sales with high probability
        if (totalTokens >= 3 && this.shouldDo(0.6 + this.aggressiveness * 0.3)) {
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
        // Variable buffer based on risk tolerance
        const bufferMultiplier = 2 + (1 - this.riskTolerance) * 2; // 2 to 3.6
        const buffer = operationalCosts * bufferMultiplier;

        // Only invest if we have a buffer
        if (totalTokens < buffer) {
            // Sell machines if we need to maintain buffer (with some probability)
            if (player.machines > 0 && totalTokens < operationalCosts * 1.5 && this.shouldDo(0.8)) {
                actions.push('sell_machine');
            }
            return actions;
        }

        // Invest in R&D for reputation with caution
        if (totalTokens >= buffer + 5 && player.reputation < 5 && this.shouldDo(0.5)) {
            actions.push('invest_rd');
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

        // Prioritize R&D with variable intensity
        if (totalTokens >= 5 && player.reputation < 5 && this.shouldDo(0.8 * this.reputationPriority)) {
            actions.push('invest_rd');
            // Try to do it twice if possible (with variability)
            if (totalTokens >= 10 && player.reputation < 4 && this.shouldDo(0.6 * this.reputationPriority)) {
                actions.push('invest_rd');
            }
        }

        // Hire employees for reputation boost with variable cap
        const employeeCap = Math.floor(2 + this.reputationPriority * 2); // 2 to 4
        if (totalTokens >= 2 && player.employees < employeeCap && this.shouldDo(0.7)) {
            actions.push('hire_employee');
        }

        // Salary increases for temp reputation
        const salaryCost = player.employees * COSTS.SALARY_INCREASE;
        if (totalTokens >= salaryCost && this.shouldDo(0.6 * this.reputationPriority)) {
            actions.push('invest_salary');
        }

        // Marketing to maintain brand with variable probability
        if (totalTokens >= 3 && this.shouldDo(0.7 * this.reputationPriority)) {
            actions.push('invest_marketing');
        }

        return actions;
    }
}
