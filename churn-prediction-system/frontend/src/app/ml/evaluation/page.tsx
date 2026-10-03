/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';

export default function MLEvaluationPage() {
  const [modelType, setModelType] = useState('random_forest');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrain = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/ml/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to train model');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Supervised Model Evaluation</h1>
      <p className="text-gray-600">Train and evaluate classification models on the customer churn dataset. Stratified train/test splitting is used automatically.</p>

      <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Algorithm</label>
          <select 
            value={modelType} 
            onChange={(e) => setModelType(e.target.value)}
            className="w-full max-w-xs p-2 border rounded-md"
            disabled={loading}
          >
            <option value="logistic_regression">Logistic Regression</option>
            <option value="decision_tree">Decision Tree</option>
            <option value="random_forest">Random Forest</option>
          </select>
        </div>
        <button 
          onClick={handleTrain} 
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
        >
          {loading ? 'Training & Evaluating...' : 'Train Model'}
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">{error}</div>}

      {result && result.metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <MetricCard title="Accuracy" value={(result.metrics.accuracy * 100).toFixed(2) + '%'} />
            <MetricCard title="Precision" value={(result.metrics.precision * 100).toFixed(2) + '%'} />
            <MetricCard title="Recall" value={(result.metrics.recall * 100).toFixed(2) + '%'} />
            <MetricCard title="F1 Score" value={(result.metrics.f1 * 100).toFixed(2) + '%'} />
            <MetricCard title="ROC-AUC" value={(result.metrics.roc_auc * 100).toFixed(2) + '%'} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Confusion Matrix</h2>
            <div className="flex flex-col items-center">
              <table className="text-center border-collapse">
                <tbody>
                  <tr>
                    <td className="p-4"></td>
                    <td className="p-4 font-bold bg-gray-100 border">Predicted Active (0)</td>
                    <td className="p-4 font-bold bg-gray-100 border">Predicted Churn (1)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold bg-gray-100 border">Actual Active (0)</td>
                    <td className="p-4 border bg-green-50 text-green-900 text-xl">{result.metrics.confusion_matrix[0][0]}<br/><span className="text-xs">True Negative</span></td>
                    <td className="p-4 border bg-red-50 text-red-900 text-xl">{result.metrics.confusion_matrix[0][1]}<br/><span className="text-xs">False Positive</span></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold bg-gray-100 border">Actual Churn (1)</td>
                    <td className="p-4 border bg-red-50 text-red-900 text-xl">{result.metrics.confusion_matrix[1][0]}<br/><span className="text-xs">False Negative</span></td>
                    <td className="p-4 border bg-green-50 text-green-900 text-xl">{result.metrics.confusion_matrix[1][1]}<br/><span className="text-xs">True Positive</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-gray-600 text-center">
              This model was automatically saved to the Model Registry as version <strong>{result.registry.version}</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value }: { title: string, value: string }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

