/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';

export default function DataImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setAnalysisResult(null);
      setImportResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setAnalysisResult(null);
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/data-import/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze file');
      }

      setAnalysisResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!analysisResult || !analysisResult.validRows.length) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/data-import/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          validRows: analysisResult.validRows,
          invalidCount: analysisResult.invalidRows.length,
          fileName: file?.name,
          totalRows: analysisResult.totalRows
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to import data');
      }

      setImportResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Data Import</h1>
      
      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Choose Excel File</h2>
        <div className="flex items-center gap-4">
          <input 
            type="file" 
            accept=".xlsx,.xls" 
            onChange={handleFileChange} 
            className="block w-full max-w-sm text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <button 
            onClick={handleAnalyze} 
            disabled={!file || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 font-medium"
          >
            {loading ? 'Processing...' : 'Analyze File'}
          </button>
        </div>
        {file && <p className="mt-2 text-sm text-gray-500">Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)</p>}
        {error && <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md border border-red-200">{error}</div>}
      </div>

      {/* Analysis Results */}
      {analysisResult && !importResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">File Summary</h2>
              <ul className="space-y-2 text-gray-700">
                <li>Total Rows: <span className="font-semibold">{analysisResult.totalRows}</span></li>
                <li>Valid Rows: <span className="font-semibold text-green-600">{analysisResult.validRows.length}</span></li>
                <li>Invalid Rows: <span className="font-semibold text-red-600">{analysisResult.invalidRows.length}</span></li>
                <li>Duplicate IDs in File: <span className="font-semibold text-orange-600">{analysisResult.duplicatesInFile}</span></li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Missing Values Summary</h2>
              <ul className="space-y-1 text-sm text-gray-700 max-h-40 overflow-y-auto">
                {Object.entries(analysisResult.missingValuesSummary).map(([col, count]) => (
                  <li key={col} className="flex justify-between">
                    <span>{col}:</span>
                    <span className={Number(count) > 0 ? 'text-red-500 font-medium' : ''}>{String(count)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Preview (Valid Data)</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2">Row</th>
                    <th className="px-4 py-2">Customer ID</th>
                    <th className="px-4 py-2">Age</th>
                    <th className="px-4 py-2">Contract</th>
                    <th className="px-4 py-2">Monthly Charges</th>
                    <th className="px-4 py-2">Churn</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisResult.validRows.slice(0, 10).map((row: any, i: number) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-2">{row.rowNumber}</td>
                      <td className="px-4 py-2">{row.data.customer_id}</td>
                      <td className="px-4 py-2">{row.data.age}</td>
                      <td className="px-4 py-2">{row.data.contract_type}</td>
                      <td className="px-4 py-2">{row.data.monthly_charges}</td>
                      <td className="px-4 py-2">{row.data.churn ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6">
              <button 
                onClick={handleImport} 
                disabled={loading || analysisResult.validRows.length === 0}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50 font-medium"
              >
                {loading ? 'Importing...' : `Import ${analysisResult.validRows.length} Valid Records`}
              </button>
            </div>
          </div>

          {analysisResult.invalidRows.length > 0 && (
             <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200">
               <h2 className="text-xl font-semibold mb-4 text-red-700">Invalid Records</h2>
               <ul className="space-y-2 text-sm max-h-60 overflow-y-auto">
                 {analysisResult.invalidRows.map((row: any, i: number) => (
                   <li key={i} className="border-b pb-2">
                     <span className="font-semibold">Row {row.rowNumber}:</span> {row.validation.errors.join(', ')}
                   </li>
                 ))}
               </ul>
             </div>
          )}
        </div>
      )}

      {/* Import Results */}
      {importResult && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200 bg-green-50">
          <h2 className="text-2xl font-bold text-green-800 mb-4">Import Completed</h2>
          <ul className="space-y-2 text-gray-800 text-lg">
            <li>Total Rows processed: <strong>{importResult.totalRows}</strong></li>
            <li>Successfully Imported: <strong className="text-green-600">{importResult.successfulRows}</strong></li>
            <li>Failed / Invalid Rows: <strong className="text-red-600">{importResult.failedRows - importResult.dbDuplicateCount}</strong></li>
            <li>Duplicate rows skipped (already in DB): <strong className="text-orange-600">{importResult.dbDuplicateCount}</strong></li>
            <li>Status: <strong>{importResult.status}</strong></li>
          </ul>
        </div>
      )}
    </div>
  );
}

