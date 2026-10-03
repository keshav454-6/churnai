import os
import joblib
import numpy as np
from sklearn.cluster import KMeans
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from app.preprocessing import fetch_customer_data

def train_segmentation(k=3, raw_data=None):
    """
    Trains a K-Means model on numeric customer data to find segments.
    """
    if raw_data is None:
        raw_data = fetch_customer_data()
    if len(raw_data) < k:
        raise ValueError("Not enough data to form clusters.")

    # Select only continuous numeric features for clustering as per best practices
    # (avoiding target 'churn' and strict categorical IDs)
    features_list = []
    customer_ids = []
    
    for row in raw_data:
        customer_ids.append(row['customerId'])
        feat = [
            float(row['tenure']) if row['tenure'] is not None else np.nan,
            float(row['monthlyCharges']) if row['monthlyCharges'] is not None else np.nan,
            float(row['totalCharges']) if row['totalCharges'] is not None else np.nan,
            float(row['numberOfServices']) if row['numberOfServices'] is not None else np.nan,
            float(row['complaints']) if row['complaints'] is not None else np.nan,
            float(row['customerSupportCalls']) if row['customerSupportCalls'] is not None else np.nan,
            float(row['latePayments']) if row['latePayments'] is not None else np.nan
        ]
        features_list.append(feat)
        
    X = np.array(features_list)
    
    # Preprocess
    pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    X_scaled = pipeline.fit_transform(X)
    
    # Train KMeans
    kmeans = KMeans(n_clusters=k, random_state=42, n_init='auto')
    clusters = kmeans.fit_predict(X_scaled)
    
    # Count members
    unique, counts = np.unique(clusters, return_counts=True)
    cluster_counts = {f"Cluster_{int(c)}": int(count) for c, count in zip(unique, counts)}
    
    # Get cluster centers (in original scale)
    centers_scaled = kmeans.cluster_centers_
    centers_original = pipeline.named_steps['scaler'].inverse_transform(centers_scaled)
    
    feature_names = ['tenure', 'monthlyCharges', 'totalCharges', 'numberOfServices', 'complaints', 'supportCalls', 'latePayments']
    
    cluster_centers = []
    for i, center in enumerate(centers_original):
        center_dict = {feature_names[j]: float(center[j]) for j in range(len(feature_names))}
        cluster_centers.append(center_dict)
        
    # Save model
    os.makedirs('../models', exist_ok=True)
    joblib.dump({'pipeline': pipeline, 'kmeans': kmeans}, '../models/segmentation.joblib')
    
    # In a fully integrated system, we would push `customer_ids` and `clusters` array back to the Next.js API via webhook or direct MySQL update.
    # We leave that for the FastAPI endpoint to handle.
    
    return {
        "cluster_centers": cluster_centers,
        "cluster_counts": cluster_counts,
        "assignments": [{"customer_id": cid, "cluster": int(c)} for cid, c in zip(customer_ids, clusters)]
    }
