/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';

export default function DataQualityPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/data-quality');
        if (!res.ok) throw new Error('Failed to fetch data quality metrics');
        const data = await res.json();
        setMetrics(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return <div className="p-8">Loading data quality metrics...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!metrics) return null;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Data Quality Dashboard</h1>

      {/* Dataset Statistics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Dataset Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-md border">
            <p className="text-sm text-gray-500">Total Records</p>
            <p className="text-2xl font-bold">{metrics.dataset.totalRecords}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-md border">
            <p className="text-sm text-gray-500">Missing Values</p>
            <p className="text-2xl font-bold">{metrics.dataset.missingValues}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-md border">
            <p className="text-sm text-gray-500">Overall Status</p>
            <p className={`text-2xl font-bold ${
              metrics.dataset.status === 'Good' ? 'text-green-600' : 'text-orange-600'
            }`}>
              {metrics.dataset.status}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-md border">
            <p className="text-sm text-gray-500">Completeness %</p>
            <p className="text-2xl font-bold">
              {metrics.dataset.totalRecords > 0 
                ? (100 - (metrics.dataset.missingValues / (metrics.dataset.totalRecords * 15)) * 100).toFixed(2) 
                : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Churn Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Churn Distribution</h2>
        <div className="flex gap-8">
          <div>
            <p className="text-lg">Churn = Yes: <span className="font-bold text-red-600">{metrics.churnDistribution.yes}</span></p>
          </div>
          <div>
            <p className="text-lg">Churn = No: <span className="font-bold text-green-600">{metrics.churnDistribution.no}</span></p>
          </div>
        </div>
        {/* We would use Recharts here in future phases for actual graphs */}
        <div className="mt-4 h-4 bg-gray-200 rounded-full overflow-hidden flex">
          <div 
            style={{ width: `${(metrics.churnDistribution.no / metrics.dataset.totalRecords) * 100}%` }} 
            className="bg-green-500 h-full"
          ></div>
          <div 
            style={{ width: `${(metrics.churnDistribution.yes / metrics.dataset.totalRecords) * 100}%` }} 
            className="bg-red-500 h-full"
          ></div>
        </div>
      </div>

      {/* Column Quality */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Column Quality</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2">Column Name</th>
                <th className="px-4 py-2">Valid Records</th>
                <th className="px-4 py-2">Missing Values</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {metrics.columnQuality.map((col: any) => (
                <tr key={col.name} className="border-b">
                  <td className="px-4 py-2 font-medium">{col.name}</td>
                  <td className="px-4 py-2">{col.valid}</td>
                  <td className="px-4 py-2">{col.missing}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      col.status === 'Good' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {col.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

