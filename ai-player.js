// AI Player wrapper that combines a Player with an AI Strategy

class AIPlayer {
    constructor(player, strategy) {
        this.player = player;
        this.strategy = strategy;
    }

    getActions(game) {
        return this.strategy.getActions(this.player, game);
    }

    executeActions(game, actions) {
        for (const action of actions) {
            const player = this.player;

            switch (action) {
                case 'hire_employee':
                    if (player.removeTokens(COSTS.EMPLOYEE_HIRE)) {
                        player.employees++;
                        player.reputation++;
                    }
                    break;

                case 'buy_machine':
                    if (player.removeTokens(COSTS.MACHINE_BUY)) {
                        player.machines++;
                        player.reputation = Math.max(0, player.reputation - 1);
                    }
                    break;

                case 'fire_employee':
                    if (player.employees > 0) {
                        player.employees--;
                        player.reputation = Math.max(0, player.reputation - 1);
                    }
                    break;

                case 'sell_machine':
                    if (player.machines > 0) {
                        player.machines--;
                        player.addTokens(COSTS.MACHINE_SELL);
                    }
                    break;

                case 'invest_rd':
                    if (player.reputation < 5 && player.removeTokens(COSTS.RD_INVEST)) {
                        player.reputation++;
                    }
                    break;

                case 'invest_marketing':
                    if (player.removeTokens(COSTS.MARKETING_INVEST)) {
                        player.tempReputation++;
                    }
                    break;

                case 'invest_salary':
                    const cost = player.employees * COSTS.SALARY_INCREASE;
                    if (player.removeTokens(cost)) {
                        player.tempReputation++;
                    }
                    break;

                default:
                    console.warn(`Unknown action: ${action}`);
            }
        }
    }
}
