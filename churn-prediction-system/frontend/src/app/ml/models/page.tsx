/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';

export default function ModelRegistryPage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ml/models')
      .then(res => res.json())
      .then(data => setModels(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Model Registry</h1>
      <p className="text-gray-600">Track and manage all ML models trained within the system.</p>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading models...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Model Type</th>
                <th className="px-4 py-3">Algorithm</th>
                <th className="px-4 py-3">Version</th>
                <th className="px-4 py-3">Accuracy</th>
                <th className="px-4 py-3">F1 Score</th>
                <th className="px-4 py-3">Trained On</th>
              </tr>
            </thead>
            <tbody>
              {models.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center">No models found in the registry.</td></tr>
              ) : (
                models.map((m) => (
                  <tr key={m.id} className={`border-b ${m.isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                    <td className="px-4 py-3">
                      {m.isActive ? (
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-semibold">ACTIVE</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full font-semibold">INACTIVE</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{m.modelType}</td>
                    <td className="px-4 py-3">{m.algorithm}</td>
                    <td className="px-4 py-3">{m.version}</td>
                    <td className="px-4 py-3">{m.accuracy ? (m.accuracy * 100).toFixed(2) + '%' : '-'}</td>
                    <td className="px-4 py-3">{m.f1Score ? (m.f1Score * 100).toFixed(2) + '%' : '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(m.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

