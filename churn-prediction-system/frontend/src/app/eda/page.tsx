/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';

export default function EDAPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/eda')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch EDA data');
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Executing SQL Queries...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!data) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Exploratory Data Analysis (SQL)</h1>
      <p className="text-gray-600 mb-8">
        This page performs pure SQL-based data analysis directly on the MySQL database to uncover trends and patterns.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Churn Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Churn Distribution</h2>
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2">Churn Status</th>
                <th className="px-4 py-2">Count</th>
              </tr>
            </thead>
            <tbody>
              {data.churnDist?.map((row: any, i: number) => (
                <tr key={i} className="border-b">
                  <td className="px-4 py-2">{row.churn ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 p-4 bg-blue-50 rounded-md text-sm text-blue-900 border border-blue-100">
            <strong>Observation:</strong> Compares the total active vs churned base to understand class imbalance.
          </div>
        </div>

        {/* Avg Complaints */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Average Complaints by Churn</h2>
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2">Churn Status</th>
                <th className="px-4 py-2">Avg Complaints</th>
              </tr>
            </thead>
            <tbody>
              {data.avgComplaints?.map((row: any, i: number) => (
                <tr key={i} className="border-b">
                  <td className="px-4 py-2">{row.churn ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2">{Number(row.avgComplaints).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 p-4 bg-blue-50 rounded-md text-sm text-blue-900 border border-blue-100">
            <strong>Observation:</strong> Customers with higher complaint counts show a higher observed churn rate in this dataset.
          </div>
        </div>

        {/* Avg Charges */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Average Monthly Charges</h2>
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2">Churn Status</th>
                <th className="px-4 py-2">Avg Monthly Charge ($)</th>
              </tr>
            </thead>
            <tbody>
              {data.avgCharges?.map((row: any, i: number) => (
                <tr key={i} className="border-b">
                  <td className="px-4 py-2">{row.churn ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2">{Number(row.avgCharges).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Contract Type */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Contract Type vs Churn</h2>
          <div className="overflow-y-auto max-h-64">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  <th className="px-4 py-2">Contract Type</th>
                  <th className="px-4 py-2">Churn</th>
                  <th className="px-4 py-2">Count</th>
                </tr>
              </thead>
              <tbody>
                {data.contractChurn?.map((row: any, i: number) => (
                  <tr key={i} className="border-b">
                    <td className="px-4 py-2">{row.contractType}</td>
                    <td className="px-4 py-2">{row.churn ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-2">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

