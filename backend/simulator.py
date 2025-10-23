"""
Match simulation engine with CSV export
"""
import csv
from io import StringIO
from typing import List, Dict, Any
from datetime import datetime
from .game_logic import Game, Player
from .ai_player import create_ai_players, AIPlayer


class MatchData:
    """Stores data for a single match"""

    def __init__(self, match_number: int):
        self.match_number = match_number
        self.turns_data: List[Dict[str, Any]] = []

    def add_turn(self, turn: int, players: List[Player]):
        """Record player states for a turn"""
        for player in players:
            self.turns_data.append({
                'match': self.match_number,
                'turn': turn,
                'player': player.name,
                'jetons': player.tokens.total(),
                'jetons_bronze': player.tokens.bronze,
                'jetons_silver': player.tokens.silver,
                'jetons_gold': player.tokens.gold,
                'reputation': player.reputation,
                'employees': player.employees,
                'machines': player.machines,
                'stock': player.production,  # Production is the stock produced
                'sales': player.sales,
                'revenue': player.revenue,
                'bankrupt': player.bankrupt,
                'level': player.get_level().value
            })


class SimulationResult:
    """Contains results of multiple matches"""

    def __init__(self):
        self.matches: List[MatchData] = []
        self.start_time: str = ""
        self.end_time: str = ""
        self.total_matches: int = 0

    def add_match(self, match: MatchData):
        """Add a match to results"""
        self.matches.append(match)

    def to_csv(self) -> str:
        """Convert simulation results to CSV format"""
        output = StringIO()
        fieldnames = [
            'match',
            'turn',
            'player',
            'jetons',
            'jetons_bronze',
            'jetons_silver',
            'jetons_gold',
            'reputation',
            'employees',
            'machines',
            'stock',
            'sales',
            'revenue',
            'bankrupt',
            'level'
        ]

        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()

        for match in self.matches:
            for turn_data in match.turns_data:
                writer.writerow(turn_data)

        return output.getvalue()

    def get_summary(self) -> Dict[str, Any]:
        """Get summary statistics"""
        if not self.matches:
            return {}

        # Count wins per strategy
        winners = {}
        total_turns = []

        for match in self.matches:
            # Find winner (last turn, non-bankrupt player with most tokens)
            if match.turns_data:
                last_turn = max(t['turn'] for t in match.turns_data)
                last_turn_data = [t for t in match.turns_data if t['turn'] == last_turn]

                # Find winner
                active_players = [t for t in last_turn_data if not t['bankrupt']]
                if active_players:
                    winner = max(active_players, key=lambda x: x['jetons'])
                    winners[winner['player']] = winners.get(winner['player'], 0) + 1

                total_turns.append(last_turn)

        return {
            'total_matches': len(self.matches),
            'average_turns': sum(total_turns) / len(total_turns) if total_turns else 0,
            'wins_by_player': winners,
            'start_time': self.start_time,
            'end_time': self.end_time
        }


class Simulator:
    """Runs multiple matches with AI players"""

    def __init__(self, max_turns: int = 50):
        self.max_turns = max_turns

    def run_match(self, match_number: int) -> MatchData:
        """Run a single match"""
        # Create game with AI players
        game = Game(num_players=4)
        ai_players = create_ai_players(num_players=4)

        # Replace game players with AI players' player objects
        game.players = [ai.player for ai in ai_players]

        # Create match data recorder
        match_data = MatchData(match_number)

        # Record initial state (turn 0)
        match_data.add_turn(0, game.players)

        # Play turns
        for turn in range(1, self.max_turns + 1):
            # Get actions from each AI
            all_actions = {}
            for ai in ai_players:
                if not ai.player.bankrupt:
                    actions = ai.get_actions(game)
                    all_actions[ai.player.name] = actions

            # Play the turn
            game_continues = game.play_turn(all_actions)

            # Record turn data
            match_data.add_turn(turn, game.players)

            # Check if game is over
            if not game_continues:
                break

        return match_data

    def run_simulation(self, num_matches: int, progress_callback=None) -> SimulationResult:
        """
        Run multiple matches
        progress_callback: Optional function called with (current, total) after each match
        """
        result = SimulationResult()
        result.total_matches = num_matches
        result.start_time = datetime.now().isoformat()

        for i in range(num_matches):
            match_data = self.run_match(i + 1)
            result.add_match(match_data)

            if progress_callback:
                progress_callback(i + 1, num_matches)

        result.end_time = datetime.now().isoformat()
        return result


def simulate_matches(num_matches: int) -> str:
    """
    Convenience function to simulate matches and return CSV
    """
    simulator = Simulator(max_turns=50)
    result = simulator.run_simulation(num_matches)
    return result.to_csv()
