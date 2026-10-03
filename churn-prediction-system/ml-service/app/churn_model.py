import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
from app.preprocessing import fetch_customer_data, preprocess_data_for_training

def train_model(model_type="random_forest", raw_data=None):
    """
    Fetches data, preprocesses it, trains the requested model, evaluates it, and saves it.
    """
    if raw_data is None:
        raw_data = fetch_customer_data()
    if len(raw_data) < 10:
        raise ValueError("Not enough data to train a model. Please import more customers.")

    X, y, preprocessor = preprocess_data_for_training(raw_data)
    
    # Stratified split to handle churn class imbalance
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Select model
    if model_type == "logistic_regression":
        model = LogisticRegression(max_iter=1000, class_weight='balanced')
    elif model_type == "decision_tree":
        model = DecisionTreeClassifier(max_depth=5, class_weight='balanced', random_state=42)
    elif model_type == "random_forest":
        model = RandomForestClassifier(n_estimators=100, max_depth=10, class_weight='balanced', random_state=42)
    else:
        raise ValueError("Unsupported model_type. Choose from logistic_regression, decision_tree, random_forest")
        
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1] if hasattr(model, "predict_proba") else y_pred
    
    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, zero_division=0)),
        "f1": float(f1_score(y_test, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, y_prob)),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist()
    }
    
    # Save Model
    os.makedirs('/tmp/models', exist_ok=True)
    model_path = f"/tmp/models/{model_type}.joblib"
    joblib.dump(model, model_path)
    
    return metrics, model_path
