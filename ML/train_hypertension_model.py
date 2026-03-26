import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

data = pd.read_csv("cardio_train.csv", sep=";")

# feature engineering
data["BMI"] = data["weight"] / ((data["height"]/100)**2)

X = data[["age","BMI","ap_hi","ap_lo"]]
y = data["cardio"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestClassifier(
    n_estimators=20,     # 🔥 reduce trees (very important)
    max_depth=4,         # 🔥 limit depth
    random_state=42
)

model.fit(X_train, y_train)

joblib.dump(model, "hypertension_model.pkl", compress=3)

print("Hypertension model trained & saved")