"""
AI decision-making strategies for game simulation
"""
import random
from typing import List
from .game_logic import Player, Game


class AIStrategy:
    """Base class for AI strategies"""

    def __init__(self, player: Player):
        self.player = player

    def decide_actions(self, game: Game) -> List[str]:
        """
        Decide which actions to take during Phase 1
        Returns list of action strings
        """
        raise NotImplementedError


class BalancedStrategy(AIStrategy):
    """Balanced strategy focusing on steady growth"""

    def decide_actions(self, game: Game) -> List[str]:
        actions = []
        tokens = self.player.tokens.total()

        # Invest in R&D if affordable and not maxed
        if tokens >= 5 and self.player.rd_investment < 5:
            actions.append('invest_rd')
            tokens -= 5

        # Hire employees if affordable and reputation allows
        if tokens >= 2 and self.player.reputation >= 2:
            actions.append('hire_employee')
            tokens -= 2

        # Buy machine if we have good capital
        if tokens >= 25 and self.player.employees >= 2:
            actions.append('buy_machine')
            tokens -= 20

        # Marketing if we can afford it
        if tokens >= 5 and random.random() < 0.3:
            actions.append('invest_marketing')

        return actions


class AggressiveStrategy(AIStrategy):
    """Aggressive strategy focusing on rapid expansion"""

    def decide_actions(self, game: Game) -> List[str]:
        actions = []
        tokens = self.player.tokens.total()

        # Buy machines aggressively for high production
        while tokens >= 25 and self.player.machines < 5:
            actions.append('buy_machine')
            tokens -= 20

        # Hire employees if machines not affordable
        while tokens >= 4 and len(actions) < 3:
            actions.append('hire_employee')
            tokens -= 2

        # Marketing to boost sales
        if tokens >= 3:
            actions.append('invest_marketing')

        return actions


class ConservativeStrategy(AIStrategy):
    """Conservative strategy focusing on sustainability"""

    def decide_actions(self, game: Game) -> List[str]:
        actions = []
        tokens = self.player.tokens.total()

        # Only invest if we have comfortable buffer
        buffer_needed = 10 + self.player.calculate_costs() * 2
        available = tokens - buffer_needed

        if available < 0:
            # Not enough buffer, reduce costs
            if self.player.machines > 0 and random.random() < 0.3:
                actions.append('sell_machine')
            return actions

        # Invest in R&D for reputation
        if available >= 5 and self.player.rd_investment < 5:
            actions.append('invest_rd')
            available -= 5

        # Hire conservatively
        if available >= 5:
            actions.append('hire_employee')
            available -= 2

        # Salary increase for reputation
        if available >= self.player.employees and self.player.employees > 0:
            actions.append('increase_salaries')

        return actions


class ReputationFocusedStrategy(AIStrategy):
    """Strategy focusing on building high reputation"""

    def decide_actions(self, game: Game) -> List[str]:
        actions = []
        tokens = self.player.tokens.total()

        # Prioritize R&D
        if tokens >= 5 and self.player.rd_investment < 5:
            actions.append('invest_rd')
            tokens -= 5

        # Hire employees (reputation boost)
        if tokens >= 4 and self.player.reputation < 5:
            actions.append('hire_employee')
            tokens -= 2

        # Salary increase
        if tokens >= self.player.employees + 3:
            actions.append('increase_salaries')
            tokens -= self.player.employees

        # Marketing
        if tokens >= 5:
            actions.append('invest_marketing')

        return actions


class AIPlayer:
    """AI player controller"""

    # Available strategies
    STRATEGIES = [
        BalancedStrategy,
        AggressiveStrategy,
        ConservativeStrategy,
        ReputationFocusedStrategy
    ]

    def __init__(self, player: Player, strategy_class=None):
        self.player = player

        # Assign random strategy if not specified
        if strategy_class is None:
            strategy_class = random.choice(self.STRATEGIES)

        self.strategy = strategy_class(player)
        self.strategy_name = strategy_class.__name__

    def get_actions(self, game: Game) -> List[str]:
        """Get actions for this turn"""
        return self.strategy.decide_actions(game)


def create_ai_players(num_players: int = 4) -> List[AIPlayer]:
    """Create AI players with diverse strategies"""
    ai_players = []

    # Assign different strategies to players
    strategies = [
        BalancedStrategy,
        AggressiveStrategy,
        ConservativeStrategy,
        ReputationFocusedStrategy
    ]

    for i in range(num_players):
        player = Player(f"IA {i+1}", is_ai=True)
        strategy = strategies[i % len(strategies)]
        ai_player = AIPlayer(player, strategy)
        ai_players.append(ai_player)

    return ai_players
