// AI Strategy classes for game simulation

class AIStrategy {
    constructor(name) {
        this.name = name;
    }

    // Must be implemented by subclasses
    getActions(player, game) {
        throw new Error('getActions must be implemented by subclass');
    }
}

class BalancedStrategy extends AIStrategy {
    constructor() {
        super('Balanced');
    }

    getActions(player, game) {
        const actions = [];
        const totalTokens = player.getTotalTokens();

        // Invest in R&D if we can afford it and haven't maxed out
        if (totalTokens >= 5 && player.reputation < 5) {
            actions.push('invest_rd');
        }

        // Hire employees if we have good reputation
        if (totalTokens >= 2 && player.getTotalReputation() >= 2) {
            actions.push('hire_employee');
        }

        // Buy machines if we have strong capital
        if (totalTokens >= 20) {
            actions.push('buy_machine');
        }

        // Marketing with 30% probability if we can afford it
        if (totalTokens >= 3 && Math.random() < 0.3) {
            actions.push('invest_marketing');
        }

        return actions;
    }
}

class AggressiveStrategy extends AIStrategy {
    constructor() {
        super('Aggressive');
    }

    getActions(player, game) {
        const actions = [];
        const totalTokens = player.getTotalTokens();

        // Aggressively buy machines (up to 5)
        if (totalTokens >= 20 && player.machines < 5) {
            actions.push('buy_machine');
        }

        // Hire many employees if can't afford machines
        if (totalTokens >= 2 && totalTokens < 20) {
            actions.push('hire_employee');
            if (totalTokens >= 4) {
                actions.push('hire_employee');
            }
        }

        // Marketing to boost sales
        if (totalTokens >= 3) {
            actions.push('invest_marketing');
        }

        return actions;
    }
}

class ConservativeStrategy extends AIStrategy {
    constructor() {
        super('Conservative');
    }

    getActions(player, game) {
        const actions = [];
        const totalTokens = player.getTotalTokens();
        const operationalCosts = player.calculateCosts();
        const buffer = operationalCosts * 2;

        // Only invest if we have a buffer
        if (totalTokens < buffer) {
            // Sell machines if we need to maintain buffer
            if (player.machines > 0 && totalTokens < operationalCosts) {
                actions.push('sell_machine');
            }
            return actions;
        }

        // Invest in R&D for reputation
        if (totalTokens >= buffer + 5 && player.reputation < 5) {
            actions.push('invest_rd');
        }

        // Salary increases for temp reputation
        if (totalTokens >= buffer + (player.employees * COSTS.SALARY_INCREASE)) {
            actions.push('invest_salary');
        }

        return actions;
    }
}

class ReputationFocusedStrategy extends AIStrategy {
    constructor() {
        super('ReputationFocused');
    }

    getActions(player, game) {
        const actions = [];
        const totalTokens = player.getTotalTokens();

        // Prioritize R&D (max 5)
        if (totalTokens >= 5 && player.reputation < 5) {
            actions.push('invest_rd');
            // Try to do it twice if possible
            if (totalTokens >= 10 && player.reputation < 4) {
                actions.push('invest_rd');
            }
        }

        // Hire employees for reputation boost
        if (totalTokens >= 2 && player.employees < 3) {
            actions.push('hire_employee');
        }

        // Salary increases for temp reputation
        const salaryCost = player.employees * COSTS.SALARY_INCREASE;
        if (totalTokens >= salaryCost) {
            actions.push('invest_salary');
        }

        // Marketing to maintain brand
        if (totalTokens >= 3) {
            actions.push('invest_marketing');
        }

        return actions;
    }
}
