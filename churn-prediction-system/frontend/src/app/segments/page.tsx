/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';

export default function SegmentationPage() {
  const [k, setK] = useState(3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrain = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ k })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate segments');
      setResult(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Customer Segmentation (K-Means)</h1>
      <p className="text-gray-600">Train an unsupervised K-Means model to discover behavioral customer segments based on their usage, billing, and support profiles.</p>

      <div className="bg-white p-6 rounded-lg shadow-sm border flex items-end gap-4 max-w-xl">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Number of Clusters (K)</label>
          <input 
            type="number" 
            min="2" max="10" 
            value={k} 
            onChange={(e) => setK(Number(e.target.value))}
            className="w-full p-2 border rounded-md"
            disabled={loading}
          />
        </div>
        <button 
          onClick={handleTrain} 
          disabled={loading}
          className="px-6 py-2 bg-purple-600 text-white font-medium rounded-md disabled:opacity-50 hover:bg-purple-700"
        >
          {loading ? 'Clustering...' : 'Generate Segments'}
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">{error}</div>}

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.keys(result.cluster_counts).map((clusterKey, i) => (
              <div key={clusterKey} className="bg-white p-6 rounded-lg shadow-sm border border-t-4 border-t-purple-500">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Cluster {i}</h3>
                <p className="text-sm text-gray-500 mb-4"><strong>{result.cluster_counts[clusterKey]}</strong> Customers</p>
                
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Characteristics</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  {result.cluster_centers[i] && Object.entries(result.cluster_centers[i]).map(([feat, val]) => (
                    <li key={feat} className="flex justify-between">
                      <span>{feat}:</span>
                      <span className="font-medium">{Number(val).toFixed(1)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h2 className="text-lg font-bold text-blue-900 mb-2">Segment Interpretation</h2>
            <p className="text-sm text-blue-800">
              Based on the characteristics above, you can assign descriptive names to these clusters (e.g., &quot;High Tenure / Low Support&quot; vs &quot;New / High Complaints&quot;). 
              In a full production environment, these assignments are written back to the MySQL <code>CustomerSegment</code> table to allow for targeted marketing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

