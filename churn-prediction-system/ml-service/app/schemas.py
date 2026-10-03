from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class CustomerData(BaseModel):
    customer_id: str
    age: Optional[float] = None
    gender: Optional[str] = None
    tenure: Optional[float] = 0
    contract_type: str
    monthly_charges: Optional[float] = 0
    total_charges: Optional[float] = 0
    payment_method: Optional[str] = None
    internet_service: Optional[str] = None
    number_of_services: Optional[float] = 1
    complaints: Optional[float] = 0
    customer_support_calls: Optional[float] = 0
    usage_frequency: Optional[str] = None
    late_payments: Optional[float] = 0
    
class PredictionResponse(BaseModel):
    customer_id: str
    predicted_churn: bool
    probability: float
    model_name: str
    model_version: str

class TrainRequest(BaseModel):
    model_type: str = "random_forest"
    training_data: Optional[List[Dict[str, Any]]] = None
    
class TrainResponse(BaseModel):
    status: str
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1: float
    roc_auc: float
    confusion_matrix: List[List[int]]

class SegmentationRequest(BaseModel):
    k: int = 3
    training_data: Optional[List[Dict[str, Any]]] = None
    
class SegmentationResponse(BaseModel):
    status: str
    cluster_centers: List[Dict[str, float]]
    cluster_counts: Dict[str, int]
