import os
import mysql.connector
from sklearn.feature_extraction import DictVectorizer
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
import numpy as np
import joblib

def get_db_connection():
    db_url = os.environ.get("DATABASE_URL", "mysql://root:YOUR_PASSWORD@localhost:3306/customer_churn_db")
    try:
        parts = db_url.split("://")[1].split("@")
        user_pass = parts[0].split(":")
        host_port_db = parts[1].split("/")
        host_port = host_port_db[0].split(":")
        
        user = user_pass[0]
        password = user_pass[1] if len(user_pass) > 1 else ""
        host = host_port[0]
        port = int(host_port[1]) if len(host_port) > 1 else 3306
        db = host_port_db[1].split("?")[0]
        
        return mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=db,
            port=port
        )
    except Exception as e:
        print(f"Error parsing database URL: {e}")
        raise e

def fetch_customer_data():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT 
            customerId, age, gender, tenure, contractType, monthlyCharges, 
            totalCharges, paymentMethod, internetService, numberOfServices, 
            complaints, customerSupportCalls, usageFrequency, latePayments, churn 
        FROM Customer
    """)
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return data

def preprocess_data_for_training(data):
    """
    Extracts features and target from raw dictionary data.
    Uses DictVectorizer to handle one-hot encoding natively from Python dicts.
    """
    y = []
    features_list = []
    
    for row in data:
        # Separate target
        y.append(1 if row['churn'] else 0)
        
        # Build features dict (ignoring customerId and churn)
        feat = {
            'age': float(row['age']) if row['age'] is not None else np.nan,
            'gender': str(row['gender']) if row['gender'] else 'missing',
            'tenure': float(row['tenure']) if row['tenure'] is not None else np.nan,
            'contractType': str(row['contractType']) if row['contractType'] else 'missing',
            'monthlyCharges': float(row['monthlyCharges']) if row['monthlyCharges'] is not None else np.nan,
            'totalCharges': float(row['totalCharges']) if row['totalCharges'] is not None else np.nan,
            'paymentMethod': str(row['paymentMethod']) if row['paymentMethod'] else 'missing',
            'internetService': str(row['internetService']) if row['internetService'] else 'missing',
            'numberOfServices': float(row['numberOfServices']) if row['numberOfServices'] is not None else np.nan,
            'complaints': float(row['complaints']) if row['complaints'] is not None else np.nan,
            'customerSupportCalls': float(row['customerSupportCalls']) if row['customerSupportCalls'] is not None else np.nan,
            'usageFrequency': str(row['usageFrequency']) if row['usageFrequency'] else 'missing',
            'latePayments': float(row['latePayments']) if row['latePayments'] is not None else np.nan,
        }
        features_list.append(feat)

    # Pipeline: Vectorize Dicts (One-Hot Encodes strings automatically), Impute NaNs, Scale
    pipeline = Pipeline([
        ('vectorizer', DictVectorizer(sparse=False)),
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    X = pipeline.fit_transform(features_list)
    
    # Save the pipeline so we can use it during inference
    os.makedirs('/tmp/models', exist_ok=True)
    joblib.dump(pipeline, '/tmp/models/preprocessor.joblib')
    
    return X, np.array(y), pipeline

def preprocess_inference_data(customer_dict):
    """
    Processes a single customer dict for real-time prediction.
    """
    pipeline = joblib.load('/tmp/models/preprocessor.joblib')
    
    feat = {
        'age': float(customer_dict.age) if customer_dict.age is not None else np.nan,
        'gender': str(customer_dict.gender) if customer_dict.gender else 'missing',
        'tenure': float(customer_dict.tenure) if customer_dict.tenure is not None else np.nan,
        'contractType': str(customer_dict.contract_type) if customer_dict.contract_type else 'missing',
        'monthlyCharges': float(customer_dict.monthly_charges) if customer_dict.monthly_charges is not None else np.nan,
        'totalCharges': float(customer_dict.total_charges) if customer_dict.total_charges is not None else np.nan,
        'paymentMethod': str(customer_dict.payment_method) if customer_dict.payment_method else 'missing',
        'internetService': str(customer_dict.internet_service) if customer_dict.internet_service else 'missing',
        'numberOfServices': float(customer_dict.number_of_services) if customer_dict.number_of_services is not None else np.nan,
        'complaints': float(customer_dict.complaints) if customer_dict.complaints is not None else np.nan,
        'customerSupportCalls': float(customer_dict.customer_support_calls) if customer_dict.customer_support_calls is not None else np.nan,
        'usageFrequency': str(customer_dict.usage_frequency) if customer_dict.usage_frequency else 'missing',
        'latePayments': float(customer_dict.late_payments) if customer_dict.late_payments is not None else np.nan,
    }
    
    X = pipeline.transform([feat])
    return X
