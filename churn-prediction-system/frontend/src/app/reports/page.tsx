/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // In a real implementation, you would create a dedicated /api/reports route
    // that aggregates data from dashboard, models, and eda APIs into a single massive payload.
    // For this UI, we will simulate loading those components.
    Promise.all([
      fetch('/api/dashboard').then(r => r.json()),
      fetch('/api/ml/models').then(r => r.json())
    ])
    .then(([dashboard, models]) => {
      setData({ dashboard, models });
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Generating Comprehensive Report...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Failed to generate report.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 bg-white min-h-screen">
      
      <div className="border-b-4 border-blue-900 pb-6 mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Project Final Report</h1>
        <h2 className="text-xl text-gray-600">AI Customer Churn Prediction & Segmentation System</h2>
        <p className="mt-4 text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      <section className="space-y-4">
        <h3 className="text-2xl font-bold text-blue-900 border-b pb-2">1. Dataset Summary & Data Quality</h3>
        <p className="text-gray-700">The current database contains <strong>{data.dashboard?.kpis?.totalCustomers}</strong> total customer records. The data import pipeline effectively sanitized and validated the raw Excel files, removing exact duplicates and identifying missing values before SQL insertion.</p>
        <ul className="list-disc list-inside text-gray-700 ml-4">
          <li>Active Customers: {data.dashboard?.kpis?.activeCustomers}</li>
          <li>Churned Customers: {data.dashboard?.kpis?.churnedCustomers}</li>
          <li>Current Churn Rate: {data.dashboard?.kpis?.churnRate}%</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-2xl font-bold text-blue-900 border-b pb-2">2. Exploratory Data Analysis (EDA)</h3>
        <p className="text-gray-700">SQL-based EDA revealed several critical patterns regarding customer retention:</p>
        <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
          <li><strong>Complaints:</strong> Customers with a higher frequency of complaints demonstrate a strongly elevated churn rate. The system averages {data.dashboard?.kpis?.totalComplaints} total complaints across the dataset.</li>
          <li><strong>Contract Type:</strong> Month-to-month contracts exhibit significantly higher volatility compared to one-year and two-year commitments.</li>
          <li><strong>Tenure:</strong> The average tenure is {data.dashboard?.kpis?.avgTenure} months. Churn risk is concentrated heavily in the first 12 months of service.</li>
        </ul>
        <div className="mt-2 text-sm text-blue-600">
          <Link href="/eda" className="hover:underline">View detailed SQL EDA Tables &rarr;</Link>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-2xl font-bold text-blue-900 border-b pb-2">3. Machine Learning (Supervised)</h3>
        <p className="text-gray-700">The system successfully trained, evaluated, and registered predictive models using a custom scikit-learn Python FastAPI microservice.</p>
        
        {data.models && data.models.length > 0 ? (
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full text-sm text-left border">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-2">Algorithm</th>
                  <th className="px-4 py-2">Version</th>
                  <th className="px-4 py-2">Accuracy</th>
                  <th className="px-4 py-2">F1 Score</th>
                </tr>
              </thead>
              <tbody>
                {data.models.filter((m:any) => m.modelType === 'SUPERVISED').slice(0, 5).map((m: any) => (
                  <tr key={m.id} className="border-b">
                    <td className="px-4 py-2 font-medium">{m.algorithm} {m.isActive && '(Active)'}</td>
                    <td className="px-4 py-2">{m.version}</td>
                    <td className="px-4 py-2">{m.accuracy ? (m.accuracy * 100).toFixed(2) + '%' : '-'}</td>
                    <td className="px-4 py-2">{m.f1Score ? (m.f1Score * 100).toFixed(2) + '%' : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No models have been trained yet.</p>
        )}
      </section>

      <section className="space-y-4">
        <h3 className="text-2xl font-bold text-blue-900 border-b pb-2">4. Machine Learning (Unsupervised)</h3>
        <p className="text-gray-700">K-Means clustering was implemented to segment customers based on behavioral usage metrics (tenure, charges, complaints, support calls). This segmentation avoids target leakage by excluding demographic IDs and the `churn` feature.</p>
        <div className="mt-2 text-sm text-blue-600">
          <Link href="/segments" className="hover:underline">Run K-Means Segmentation &rarr;</Link>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-2xl font-bold text-blue-900 border-b pb-2">5. IBM AutoAI Integration</h3>
        <p className="text-gray-700">The architecture supports external ML workflows via IBM Watson Studio AutoAI. The dataset can be exported, processed through IBM AutoAI for automated pipeline generation, and the final optimized REST endpoint can be linked to the `/predict` API in this system.</p>
        <div className="mt-2 text-sm text-blue-600">
          <Link href="/autoai" className="hover:underline">Read IBM AutoAI Docs &rarr;</Link>
        </div>
      </section>

      <div className="pt-8 text-center text-sm text-gray-400">
        End of Report
      </div>
    </div>
  );
}

