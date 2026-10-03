/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';

export default function PredictPage() {
  const [formData, setFormData] = useState({
    customer_id: 'CUST-NEW-001',
    age: 45,
    gender: 'Female',
    tenure: 12,
    contract_type: 'Month-to-month',
    monthly_charges: 75.5,
    total_charges: 906.0,
    payment_method: 'Electronic check',
    internet_service: 'Fiber optic',
    number_of_services: 2,
    complaints: 1,
    customer_support_calls: 3,
    usage_frequency: 'High',
    late_payments: 1
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    // Numeric fields
    const numFields = ['age', 'tenure', 'monthly_charges', 'total_charges', 'number_of_services', 'complaints', 'customer_support_calls', 'late_payments'];
    setFormData(prev => ({
      ...prev,
      [name]: numFields.includes(name) ? Number(value) : value
    }));
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to predict churn');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Real-Time Churn Prediction</h1>
      <p className="text-gray-600">Enter customer details below to predict their likelihood of churning using the currently active ML model.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
          <form onSubmit={handlePredict} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer ID</label>
              <input type="text" name="customer_id" value={formData.customer_id} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 bg-white text-gray-900 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 bg-white text-gray-900 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 bg-white text-gray-900 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tenure (Months)</label>
              <input type="number" name="tenure" value={formData.tenure} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 bg-white text-gray-900 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contract Type</label>
              <select name="contract_type" value={formData.contract_type} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 bg-white text-gray-900 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                <option value="Month-to-month">Month-to-month</option>
                <option value="One year">One year</option>
                <option value="Two year">Two year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Internet Service</label>
              <select name="internet_service" value={formData.internet_service} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 bg-white text-gray-900 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                <option value="DSL">DSL</option>
                <option value="Fiber optic">Fiber optic</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Monthly Charges ($)</label>
              <input type="number" step="0.01" name="monthly_charges" value={formData.monthly_charges} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 bg-white text-gray-900 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer Support Calls</label>
              <input type="number" name="customer_support_calls" value={formData.customer_support_calls} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 bg-white text-gray-900 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Complaints</label>
              <input type="number" name="complaints" value={formData.complaints} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 bg-white text-gray-900 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Late Payments</label>
              <input type="number" name="late_payments" value={formData.late_payments} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 bg-white text-gray-900 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            
            <div className="md:col-span-2 pt-4">
              <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md disabled:opacity-50 hover:bg-blue-700 transition">
                {loading ? 'Analyzing with ML Model...' : 'Predict Churn Risk'}
              </button>
            </div>
          </form>
        </div>

        {/* Results Panel */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Prediction Result</h2>
          
          {error && <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
          
          {!result && !error && !loading && (
            <p className="text-gray-500 text-sm text-center py-8">Fill the form and submit to see the prediction.</p>
          )}

          {result && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-2">Churn Risk</p>
                {result.predicted_churn ? (
                  <div className="inline-block px-6 py-3 bg-red-100 text-red-800 text-3xl font-bold rounded-lg border border-red-200">HIGH RISK</div>
                ) : (
                  <div className="inline-block px-6 py-3 bg-green-100 text-green-800 text-3xl font-bold rounded-lg border border-green-200">LOW RISK</div>
                )}
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Probability of Churn</span>
                  <span className="font-bold">{(result.probability * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full ${result.predicted_churn ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${result.probability * 100}%` }}></div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 text-sm text-gray-600 space-y-1">
                <p><strong>Model Used:</strong> {result.model_name}</p>
                <p><strong>Version:</strong> {result.model_version}</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

