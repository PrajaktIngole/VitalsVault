import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib

# load dataset
data = pd.read_csv("diabetes.csv")

X = data.drop("Outcome", axis=1)
y = data["Outcome"]

# split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# train model
model = RandomForestClassifier(n_estimators=200)

model.fit(X_train, y_train)

# evaluate
pred = model.predict(X_test)

print(classification_report(y_test, pred))

# save model
joblib.dump(model, "diabetes_model.pkl")

print("Diabetes model trained & saved")