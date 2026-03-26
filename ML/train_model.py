# Hypertention model script

# import pandas as pd
# import numpy as np
# from sklearn.ensemble import RandomForestClassifier
# import joblib

# # Create synthetic dataset
# np.random.seed(42)

# data = pd.DataFrame({
#     "age": np.random.randint(20, 70, 500),
#     "bmi": np.random.uniform(18, 35, 500),
#     "systolic": np.random.randint(100, 180, 500),
#     "diastolic": np.random.randint(60, 110, 500)
# })

# # Create risk label
# data["risk"] = np.where(
#     (data["systolic"] > 140) | 
#     (data["diastolic"] > 90) |
#     (data["bmi"] > 30),
#     1,
#     0
# )

# X = data[["age", "bmi", "systolic", "diastolic"]]
# y = data["risk"]

# model = RandomForestClassifier()
# model.fit(X, y)

# joblib.dump(model, "hypertension_model.pkl")

# print("Model trained and saved ✅")


# import pandas as pd
# import numpy as np
# from sklearn.ensemble import RandomForestClassifier
# import joblib

# np.random.seed(42)

# # =============================
# # 1️⃣ Hypertension Dataset
# # =============================
# hypertension_data = pd.DataFrame({
#     "age": np.random.randint(20, 70, 500),
#     "bmi": np.random.uniform(18, 35, 500),
#     "systolic": np.random.randint(100, 180, 500),
#     "diastolic": np.random.randint(60, 110, 500)
# })

# hypertension_data["risk"] = np.where(
#     (hypertension_data["systolic"] > 140) |
#     (hypertension_data["diastolic"] > 90) |
#     (hypertension_data["bmi"] > 30),
#     1,
#     0
# )

# X_h = hypertension_data[["age", "bmi", "systolic", "diastolic"]]
# y_h = hypertension_data["risk"]

# hypertension_model = RandomForestClassifier()
# hypertension_model.fit(X_h, y_h)

# joblib.dump(hypertension_model, "hypertension_model.pkl")


# # =============================
# # 2️⃣ Diabetes Dataset
# # =============================
# diabetes_data = pd.DataFrame({
#     "age": np.random.randint(20, 70, 500),
#     "bmi": np.random.uniform(18, 35, 500),
#     "sugar": np.random.randint(70, 200, 500),
#     "activity_level": np.random.randint(0, 3, 500),  # 0=Low,1=Medium,2=High
#     "family_history": np.random.randint(0, 2, 500)   # 0=No,1=Yes
# })

# diabetes_data["risk"] = np.where(
#     (diabetes_data["sugar"] > 140) |
#     (diabetes_data["bmi"] > 30) |
#     (diabetes_data["family_history"] == 1),
#     1,
#     0
# )

# X_d = diabetes_data[["age", "bmi", "sugar", "activity_level", "family_history"]]
# y_d = diabetes_data["risk"]

# diabetes_model = RandomForestClassifier()
# diabetes_model.fit(X_d, y_d)

# joblib.dump(diabetes_model, "diabetes_model.pkl")

# print("Both models trained and saved ✅")




