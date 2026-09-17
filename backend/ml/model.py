import math
import numpy as np

try:
    import torch
    import torch.nn as nn
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False
    torch = None
    nn = None

if HAS_TORCH:
    class EnvironmentalRiskNet(nn.Module):
        """
        PyTorch Multi-Layer Perceptron for Environmental Risk Prediction.
        """
        def __init__(self, input_dim: int = 7):
            super(EnvironmentalRiskNet, self).__init__()
            self.fc1 = nn.Linear(input_dim, 32)
            self.relu1 = nn.ReLU()
            self.fc2 = nn.Linear(32, 16)
            self.relu2 = nn.ReLU()
            self.out = nn.Linear(16, 1)
            self.sigmoid = nn.Sigmoid()

        def forward(self, x: torch.Tensor) -> torch.Tensor:
            out = self.relu1(self.fc1(x))
            out = self.relu2(self.fc2(x))
            out = self.sigmoid(self.out(out))
            return out
else:
    class EnvironmentalRiskNet:
        """
        Pure NumPy Neural Network Fallback for Environmental Risk Prediction.
        (Guarantees 100% operational ML inference even without PyTorch installed).
        """
        def __init__(self, input_dim: int = 7):
            np.random.seed(42)
            self.W1 = np.random.randn(input_dim, 32) * 0.1
            self.b1 = np.zeros((1, 32))
            self.W2 = np.random.randn(32, 16) * 0.1
            self.b2 = np.zeros((1, 16))
            self.W3 = np.random.randn(16, 1) * 0.1
            self.b3 = np.zeros((1, 1))

        def relu(self, x):
            return np.maximum(0, x)

        def sigmoid(self, x):
            return 1.0 / (1.0 + np.exp(-np.clip(x, -15, 15)))

        def forward(self, x: np.ndarray) -> np.ndarray:
            if x.ndim == 1:
                x = x.reshape(1, -1)
            h1 = self.relu(np.dot(x, self.W1) + self.b1)
            h2 = self.relu(np.dot(h1, self.W2) + self.b2)
            out = self.sigmoid(np.dot(h2, self.W3) + self.b3)
            return out

        def eval(self):
            pass

        def state_dict(self):
            return {"W1": self.W1, "b1": self.b1, "W2": self.W2, "b2": self.b2, "W3": self.W3, "b3": self.b3}

        def load_state_dict(self, state):
            for k, v in state.items():
                if hasattr(self, k):
                    setattr(self, k, v)
