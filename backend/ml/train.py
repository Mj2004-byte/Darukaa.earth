import os
import numpy as np
from backend.ml.model import EnvironmentalRiskNet, HAS_TORCH
from backend.ml.preprocessing import normalize_features

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pt")

if HAS_TORCH:
    import torch
    import torch.nn as nn
    import torch.optim as optim

def generate_synthetic_training_data(n_samples: int = 1000):
    np.random.seed(42)
    rainfall = np.random.uniform(400, 2500, n_samples)
    temp = np.random.uniform(15, 38, n_samples)
    tree_cover = np.random.uniform(10, 95, n_samples)
    biomass = np.random.uniform(20, 300, n_samples)
    carbon_stock = np.random.uniform(30, 400, n_samples)
    biodiversity = np.random.uniform(10, 98, n_samples)
    sequestration = np.random.uniform(2, 30, n_samples)

    X_raw = np.column_stack([rainfall, temp, tree_cover, biomass, carbon_stock, biodiversity, sequestration])
    X_norm = np.zeros_like(X_raw)

    for i in range(n_samples):
        X_norm[i] = normalize_features(X_raw[i].tolist())

    risk_raw = (
        (1.0 - (tree_cover / 100.0)) * 0.30 +
        (1.0 - (biodiversity / 100.0)) * 0.25 +
        (1.0 - (biomass / 300.0)) * 0.20 +
        (1.0 - (sequestration / 30.0)) * 0.15 +
        (temp / 40.0) * 0.10
    )

    y = np.clip(risk_raw + np.random.normal(0, 0.03, n_samples), 0.0, 1.0).reshape(-1, 1)

    return X_norm, y

def train_and_save_model():
    print("Generating synthetic ecological training dataset...")
    X_norm, y = generate_synthetic_training_data(1200)

    if HAS_TORCH:
        X_train = torch.tensor(X_norm, dtype=torch.float32)
        y_train = torch.tensor(y, dtype=torch.float32)
        model = EnvironmentalRiskNet(input_dim=7)
        criterion = nn.MSELoss()
        optimizer = optim.Adam(model.parameters(), lr=0.01)

        model.train()
        epochs = 100
        for epoch in range(epochs):
            optimizer.zero_grad()
            predictions = model(X_train)
            loss = criterion(predictions, y_train)
            loss.backward()
            optimizer.step()

        model.eval()
        torch.save(model.state_dict(), MODEL_PATH)
        print(f"PyTorch model saved to {MODEL_PATH}")
        return model
    else:
        model = EnvironmentalRiskNet(input_dim=7)
        print("NumPy neural network model initialized successfully.")
        return model

if __name__ == "__main__":
    train_and_save_model()
