from fastapi import FastAPI, HTTPException
import joblib
import os
from .schemas import (
    CustomerData, PredictionResponse, 
    TrainRequest, TrainResponse,
    SegmentationRequest, SegmentationResponse
)
from .preprocessing import preprocess_inference_data
from .churn_model import train_model
from .segmentation import train_segmentation

app = FastAPI(title="AI Churn Prediction & Segmentation API")

@app.get("/")
def read_root():
    return {"message": "ML Service is running"}

@app.post("/predict", response_model=PredictionResponse)
def predict_churn(customer: CustomerData):
    try:
        # Load the default model (random_forest by default, or whichever is active)
        model_path = "../models/random_forest.joblib"
        if not os.path.exists(model_path):
            raise HTTPException(status_code=404, detail="Model not trained yet.")
            
        model = joblib.load(model_path)
        
        # Preprocess
        X = preprocess_inference_data(customer)
        
        # Predict
        prediction = model.predict(X)[0]
        
        if hasattr(model, "predict_proba"):
            probability = float(model.predict_proba(X)[0][1])
        else:
            probability = 1.0 if prediction == 1 else 0.0
            
        return PredictionResponse(
            customer_id=customer.customer_id,
            predicted_churn=bool(prediction == 1),
            probability=probability,
            model_name="Random Forest",
            model_version="1.0"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train", response_model=TrainResponse)
def trigger_training(req: TrainRequest):
    try:
        metrics, path = train_model(req.model_type, raw_data=req.training_data)
        return TrainResponse(
            status="success",
            model_name=req.model_type,
            **metrics
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/segment", response_model=SegmentationResponse)
def trigger_segmentation(req: SegmentationRequest):
    try:
        results = train_segmentation(req.k)
        
        # NOTE: In a real system, we would take `results['assignments']` and bulk update 
        # the MySQL `customer_segments` table directly from here or via an API call back to Next.js.
        # We omit the raw update here for brevity since the backend isn't reachable with current creds.

        return SegmentationResponse(
            status="success",
            cluster_centers=results["cluster_centers"],
            cluster_counts=results["cluster_counts"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
