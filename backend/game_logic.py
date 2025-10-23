"""
Game logic for "Qui est le Patron?" - Ported from JavaScript
"""
import random
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from enum import Enum


class Level(Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"


@dataclass
class Tokens:
    bronze: int = 0
    silver: int = 0
    gold: int = 0

    def total(self) -> int:
        """Convert all tokens to bronze equivalent"""
        return self.bronze + (self.silver * 10) + (self.gold * 100)

    def add(self, amount: int):
        """Add tokens (bronze equivalent) with automatic conversion"""
        total = self.total() + amount
        self.gold = total // 100
        total %= 100
        self.silver = total // 10
        self.bronze = total % 10

    def subtract(self, amount: int) -> bool:
        """Subtract tokens, return False if insufficient"""
        if self.total() < amount:
            return False
        total = self.total() - amount
        self.gold = total // 100
        total %= 100
        self.silver = total // 10
        self.bronze = total % 10
        return True

    def can_afford(self, amount: int) -> bool:
        """Check if can afford the amount"""
        return self.total() >= amount


class Player:
    def __init__(self, name: str, is_ai: bool = False):
        self.name = name
        self.is_ai = is_ai
        self.tokens = Tokens(bronze=10, silver=0, gold=0)  # Start with 10 bronze like in JS version
        self.employees = 1
        self.machines = 0
        self.reputation = 2
        self.temp_reputation = 0
        self.production = 0
        self.sales = 0
        self.revenue = 0
        self.bankrupt = False
        self.employees_active = True
        self.delocalisation = False
        self.temp_production = 0
        self.rd_investment = 0

    def get_level(self) -> Level:
        """Determine company level based on tokens"""
        total = self.tokens.total()
        if total >= 100:
            return Level.GOLD
        elif total >= 10:
            return Level.SILVER
        else:
            return Level.BRONZE

    def get_coefficient(self) -> int:
        """Get market coefficient based on level"""
        level = self.get_level()
        coefficients = {
            Level.BRONZE: 1,
            Level.SILVER: 2,
            Level.GOLD: 3
        }
        return coefficients[level]

    def get_tax_level(self) -> int:
        """Get structural tax based on level"""
        level = self.get_level()
        taxes = {
            Level.BRONZE: 0,
            Level.SILVER: 1,
            Level.GOLD: 2
        }
        return taxes[level]

    def calculate_production(self) -> int:
        """Calculate total production for this turn"""
        base_production = 0
        if self.employees_active:
            base_production = self.employees * 2
        base_production += self.machines * 10
        base_production += self.temp_production
        self.production = base_production
        return base_production

    def calculate_costs(self) -> int:
        """Calculate total operational costs"""
        employee_cost = self.employees * 1
        if self.delocalisation:
            employee_cost = employee_cost // 2
        machine_cost = self.machines * 1
        fixed_costs = 1
        return employee_cost + machine_cost + fixed_costs

    def get_total_reputation(self) -> int:
        """Get total reputation including temporary"""
        return self.reputation + self.temp_reputation

    def hire_employee(self) -> bool:
        """Hire an employee"""
        if self.tokens.subtract(2):
            self.employees += 1
            self.reputation = min(5, self.reputation + 1)
            return True
        return False

    def buy_machine(self) -> bool:
        """Buy a machine"""
        if self.tokens.subtract(20):
            self.machines += 1
            self.reputation = max(0, self.reputation - 1)
            return True
        return False

    def fire_employee(self) -> bool:
        """Fire an employee"""
        if self.employees > 0:
            self.employees -= 1
            self.reputation = max(0, self.reputation - 1)
            self.tokens.add(1)  # Recover some costs
            return True
        return False

    def sell_machine(self) -> bool:
        """Sell a machine"""
        if self.machines > 0:
            self.machines -= 1
            self.tokens.add(10)
            return True
        return False

    def invest_rd(self) -> bool:
        """Invest in R&D"""
        if self.rd_investment >= 5:
            return False  # Max 5 investments
        if self.tokens.subtract(5):
            self.rd_investment += 1
            self.reputation = min(5, self.reputation + 1)
            return True
        return False

    def invest_marketing(self) -> bool:
        """Invest in marketing (temporary reputation)"""
        if self.tokens.subtract(3):
            self.temp_reputation += 1
            return True
        return False

    def increase_salaries(self) -> bool:
        """Increase employee salaries (temporary reputation)"""
        cost = self.employees
        if self.tokens.subtract(cost):
            self.temp_reputation += 1
            return True
        return False

    def reset_temp_bonuses(self):
        """Reset temporary bonuses at end of turn"""
        self.temp_reputation = 0
        self.temp_production = 0
        self.employees_active = True

    def to_dict(self) -> Dict[str, Any]:
        """Convert player state to dictionary"""
        return {
            'name': self.name,
            'tokens_bronze': self.tokens.bronze,
            'tokens_silver': self.tokens.silver,
            'tokens_gold': self.tokens.gold,
            'total_tokens': self.tokens.total(),
            'employees': self.employees,
            'machines': self.machines,
            'reputation': self.reputation,
            'temp_reputation': self.temp_reputation,
            'production': self.production,
            'sales': self.sales,
            'revenue': self.revenue,
            'bankrupt': self.bankrupt,
            'level': self.get_level().value
        }


class Game:
    def __init__(self, num_players: int = 4):
        self.players: List[Player] = []
        self.turn = 0
        self.phase = 0
        self.market_size = 0
        self.market_penalty = 1.0
        self.game_started = False
        self.game_over = False
        self.winner = None

        # Initialize AI players
        for i in range(num_players):
            player = Player(f"IA {i+1}", is_ai=True)
            self.players.append(player)

    def roll_dice(self) -> int:
        """Roll 2D6"""
        return random.randint(1, 6) + random.randint(1, 6)

    def calculate_market_size(self) -> int:
        """Calculate market size for this turn"""
        active_players = sum(1 for p in self.players if not p.bankrupt)
        base = self.roll_dice() * active_players

        # Add company coefficients
        for player in self.players:
            if not player.bankrupt:
                base += player.get_coefficient()

        self.market_size = int(base * self.market_penalty)
        return self.market_size

    def distribute_market(self):
        """Distribute market sales based on reputation"""
        active_players = [p for p in self.players if not p.bankrupt]
        if not active_players:
            return

        # Calculate total reputation
        total_reputation = sum(p.get_total_reputation() for p in active_players)
        if total_reputation == 0:
            total_reputation = len(active_players)

        # Distribute market
        for player in active_players:
            reputation_ratio = player.get_total_reputation() / total_reputation
            player.sales = int(self.market_size * reputation_ratio)

            # Limit sales to production
            player.sales = min(player.sales, player.production)

            # Calculate revenue
            player.revenue = player.sales * player.get_coefficient()
            player.tokens.add(player.revenue)

    def apply_taxes(self):
        """Apply taxes to all players"""
        for player in self.players:
            if player.bankrupt:
                continue

            # Revenue tax (20%)
            revenue_tax = int(player.revenue * 0.2)

            # Employee tax
            employee_tax = player.employees * 1

            # Machine tax
            machine_tax = player.machines * 2

            # Structural tax
            structural_tax = player.get_tax_level()

            total_tax = revenue_tax + employee_tax + machine_tax + structural_tax

            if not player.tokens.subtract(total_tax):
                player.bankrupt = True

    def apply_random_event(self, player: Player):
        """Apply random event to a player"""
        if player.bankrupt:
            return

        event_type = random.choices(
            ['bonus', 'malus', 'choice'],
            weights=[0.4, 0.4, 0.2]
        )[0]

        if event_type == 'bonus':
            bonus = random.choice([
                'subvention',
                'nouveau_client',
                'bonus_production'
            ])
            if bonus == 'subvention':
                player.tokens.add(5)
            elif bonus == 'nouveau_client':
                player.temp_reputation += 1
            else:  # bonus_production
                player.temp_production += 5

        elif event_type == 'malus':
            malus = random.choice([
                'crise_marche',
                'greve',
                'panne_machine'
            ])
            if malus == 'crise_marche':
                self.market_penalty = 0.7
            elif malus == 'greve':
                player.employees_active = False
            else:  # panne_machine
                if player.machines > 0:
                    player.machines -= 1

        else:  # choice - AI will make random choice
            choice = random.choice([
                'delocalisation',
                'automatisation',
                'campagne_ethique'
            ])
            if choice == 'delocalisation':
                player.delocalisation = True
                player.reputation = max(0, player.reputation - 1)
            elif choice == 'automatisation':
                if player.employees >= 2:
                    player.employees -= 2
                    player.machines += 1
                    player.reputation = max(0, player.reputation - 1)
            else:  # campagne_ethique
                if player.tokens.subtract(10):
                    player.reputation = min(5, player.reputation + 2)

    def check_victory(self) -> Optional[Player]:
        """Check if any player has won"""
        active_players = [p for p in self.players if not p.bankrupt]

        # Check capitalist victory (100 gold)
        for player in active_players:
            if player.tokens.gold >= 100:
                return player

        # Check survivor victory (last player standing)
        if len(active_players) == 1:
            return active_players[0]

        return None

    def play_phase_1(self, player: Player, actions: List[str]):
        """Execute Phase 1 actions for a player"""
        for action in actions:
            if action == 'hire_employee':
                player.hire_employee()
            elif action == 'buy_machine':
                player.buy_machine()
            elif action == 'fire_employee':
                player.fire_employee()
            elif action == 'sell_machine':
                player.sell_machine()
            elif action == 'invest_rd':
                player.invest_rd()
            elif action == 'invest_marketing':
                player.invest_marketing()
            elif action == 'increase_salaries':
                player.increase_salaries()

        # Pay fixed costs and wages
        costs = player.calculate_costs()
        if not player.tokens.subtract(costs):
            player.bankrupt = True

    def play_phase_2(self):
        """Execute Phase 2: Market"""
        self.calculate_market_size()

        # Calculate production for all players
        for player in self.players:
            if not player.bankrupt:
                player.calculate_production()

        # Distribute market
        self.distribute_market()

    def play_phase_3(self):
        """Execute Phase 3: Taxes"""
        self.apply_taxes()

    def play_phase_4(self):
        """Execute Phase 4: Events"""
        for player in self.players:
            if not player.bankrupt:
                self.apply_random_event(player)

    def play_turn(self, all_actions: Dict[str, List[str]]) -> bool:
        """
        Play a complete turn
        all_actions: Dict mapping player name to list of actions
        Returns True if game continues, False if game over
        """
        self.turn += 1
        self.market_penalty = 1.0

        # Phase 1: Production & Expenses
        self.phase = 1
        for player in self.players:
            if not player.bankrupt:
                actions = all_actions.get(player.name, [])
                self.play_phase_1(player, actions)

        # Phase 2: Market
        self.phase = 2
        self.play_phase_2()

        # Phase 3: Taxes
        self.phase = 3
        self.play_phase_3()

        # Phase 4: Events
        self.phase = 4
        self.play_phase_4()

        # Reset temporary bonuses
        for player in self.players:
            player.reset_temp_bonuses()

        # Check victory
        self.winner = self.check_victory()
        if self.winner:
            self.game_over = True
            return False

        return True
