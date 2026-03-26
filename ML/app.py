# from fastapi import FastAPI
# import joblib
# import numpy as np

# app = FastAPI()

# # Load trained model
# model = joblib.load("hypertension_model.pkl")

# @app.post("/predict")
# def predict(data: dict):
#     try:
#         features = np.array([[
#             data["age"],
#             data["bmi"],
#             data["systolic"],
#             data["diastolic"]
#         ]])

#         prediction = model.predict(features)[0]
#         probability = model.predict_proba(features)[0][1]

#         return {
#             "risk": "High Risk" if prediction == 1 else "Low Risk",
#             "probability": round(float(probability) * 100, 2)
#         }

#     except Exception as e:
#         return {"error": str(e)}


from fastapi import FastAPI
import joblib
import numpy as np
import os
import gdown

app = FastAPI()

@app.get("/")
def home():
    return {"message": "ML Service Running 🚀"}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

ht_model_path = os.path.join(BASE_DIR, "hypertension_model.pkl")
db_model_path = os.path.join(BASE_DIR, "diabetes_model.pkl")

# Download models
if not os.path.exists(ht_model_path):
    gdown.download("https://drive.google.com/uc?id=1WVIl21RykYXeWbKu5KqqKwajWYUBm8qR", ht_model_path, quiet=False)

if not os.path.exists(db_model_path):
    gdown.download("https://drive.google.com/uc?id=19U-VjhMJxad08hsOaeekLV6DZGP6AI83", db_model_path, quiet=False)

# # Load models
# hypertension_model = joblib.load(ht_model_path)
# diabetes_model = joblib.load(db_model_path)

@app.post("/predict/hypertension")
def predict_hypertension(data: dict):

    model = joblib.load(ht_model_path)   # 🔥 load here

    features = np.array([[ 
        data["age"], data["bmi"], data["systolic"], data["diastolic"]
    ]])

    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1]

    return {
        "risk": "High Risk" if prediction == 1 else "Low Risk",
        "probability": round(float(probability) * 100, 2)
    }

@app.post("/predict/diabetes")
def predict_diabetes(data: dict):

    model = joblib.load(db_model_path)   # 🔥 load here

    pregnancies = 0
    glucose = data["sugar"]
    blood_pressure = 70
    skin_thickness = 20
    insulin = 0
    bmi = data["bmi"]
    dpf = 0.5 + (data.get("family_history", 0) * 0.3)
    age = data["age"]

    features = np.array([[ 
        pregnancies, glucose, blood_pressure,
        skin_thickness, insulin, bmi, dpf, age
    ]])

    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1]

    return {
        "risk": "High Risk" if prediction == 1 else "Low Risk",
        "probability": round(float(probability) * 100, 2)
    }