import math
import numpy as np
import pandas as pd

def train_q_table_from_history(history_data, num_states=11, num_actions=10, alpha=0.1, gamma=0.9):
    """
    Trains a Q-table from history data using Q-learning.

    :param history_data: list of lists [performance_level, difficulty_level, correct_bool]
    :param num_states: int, number of performance levels (default 11)
    :param num_actions: int, number of difficulty levels (default 10)
    :param alpha: float, learning rate
    :param gamma: float, discount factor
    :return: tuple of (Q-table as ndarray, function to select best difficulty)
    """

    Questions = np.zeros((num_states, num_actions))

    for state, action_difficulty, correct in history_data:
        action = action_difficulty - 1  # difficulty levels 1-10 → action index 0-9

        if correct:
            reward = 1 + action_difficulty / 10  # positive reward for success
        else:
            reward = -math.log(action_difficulty + 1) / 5  # negative reward for failure

        next_state = state  # assuming performance level remains the same
        best_next_q = np.max(Questions[next_state])  # best possible future reward
        Questions[state, action] += alpha * (reward + gamma * best_next_q - Questions[state, action])

    def select_difficulty(performance_level):
        """
        Given a performance level (0-10), returns the best difficulty level (1-10).
        """
        return int(np.argmax(Questions[performance_level])) + 1

    return select_difficulty

# Example usage with requested format:
history = [
    [5, 3, True],
    [5, 4, False],
    [7, 5, True],
    [7, 6, True],
    [4, 5, False],
    [3, 2, True]
]

get_best_difficulty = train_q_table_from_history(history)

# Test: What difficulty to give a user with performance level 5?
best_difficulty = get_best_difficulty(5)
print("Recommended Difficulty:", best_difficulty)
