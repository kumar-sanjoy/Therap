import math
import numpy as np
import pandas as pd

def train_q_table_from_history(history_data, num_states=11, num_actions=10, alpha=0.1, gamma=0.9):
    """
    Trains a Q-table from history data using Q-learning.
    
    :param history_data: list of tuples (performance_level, difficulty_level, correct)
    :param num_states: int, number of performance levels (default 11)
    :param num_actions: int, number of difficulty levels (default 10)
    :param alpha: float, learning rate
    :param gamma: float, discount factor
    :return: tuple of (Q-table as ndarray, function to select best difficulty)
    """

    Q = np.zeros((num_states, num_actions))

    for state, action_difficulty, correct in history_data:
        action = action_difficulty - 1  # difficulty levels 1-10 → action index 0-9

        if correct:
            reward = 1 + action_difficulty / 10  # positive reward for success
        else:
            reward = -math.log(action_difficulty + 1) / 5  # negative reward for failure

        next_state = state  # assuming performance level remains the same
        best_next_q = np.max(Q[next_state])  # best possible future reward
        Q[state, action] += alpha * (reward + gamma * best_next_q - Q[state, action])

    def select_difficulty(performance_level):
        """
        Given a performance level (0–10), returns the best difficulty level (1–10).
        """
        return int(np.argmax(Q[performance_level])) + 1

    return Q, select_difficulty

# Example usage:
history = [
    (5, 3, 1),
    (5, 4, 0),
    (7, 5, 1),
    (7, 6, 1),
    (4, 5, 0),
    (3, 2, 1)
]

q_table, get_best_difficulty = train_q_table_from_history(history)

# Test: What difficulty to give a user with performance level 5?
best_difficulty = get_best_difficulty(5)
print("Recommended Difficulty:", best_difficulty)

# Optional: convert Q-table to DataFrame
# q_df = pd.DataFrame(q_table, columns=[f'Difficulty_{i+1}' for i in range(10)])
# q_df.index.name = "Performance_Level"
# print(q_df.round(2))
