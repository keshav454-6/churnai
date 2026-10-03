'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch(`/api/customers/${id}`);
        if (!res.ok) throw new Error('Customer not found');
        const data = await res.json();
        setCustomer(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCustomer();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/customers');
      } else {
        alert('Failed to delete customer');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting customer');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error || !customer) return <div className="p-8 text-red-600 text-center">{error || 'Not found'}</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Customer Details: {customer.customerId}</h1>
        <div className="flex gap-4">
          <button className="px-4 py-2 border rounded-md hover:bg-gray-50" onClick={() => router.push('/customers')}>Back</button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Customer Information</h2>
          <div className="space-y-2 text-gray-700">
            <p><span className="font-medium w-40 inline-block">Age:</span> {customer.age ?? '-'}</p>
            <p><span className="font-medium w-40 inline-block">Gender:</span> {customer.gender ?? '-'}</p>
            <p><span className="font-medium w-40 inline-block">Created At:</span> {new Date(customer.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Churn Info */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Churn Status</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-700 w-40">Actual Churn:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${customer.churn ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {customer.churn ? 'YES' : 'NO'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-4">Prediction history will appear below when ML models are run.</p>
          </div>
        </div>

        {/* Service & Billing */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Service & Billing</h2>
          <div className="space-y-2 text-gray-700">
            <p><span className="font-medium w-48 inline-block">Contract Type:</span> {customer.contractType ?? '-'}</p>
            <p><span className="font-medium w-48 inline-block">Tenure (Months):</span> {customer.tenure ?? '-'}</p>
            <p><span className="font-medium w-48 inline-block">Monthly Charges:</span> ${customer.monthlyCharges ?? '-'}</p>
            <p><span className="font-medium w-48 inline-block">Total Charges:</span> ${customer.totalCharges ?? '-'}</p>
            <p><span className="font-medium w-48 inline-block">Payment Method:</span> {customer.paymentMethod ?? '-'}</p>
            <p><span className="font-medium w-48 inline-block">Internet Service:</span> {customer.internetService ?? '-'}</p>
            <p><span className="font-medium w-48 inline-block">Number of Services:</span> {customer.numberOfServices ?? '-'}</p>
          </div>
        </div>

        {/* Support */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Support & Usage</h2>
          <div className="space-y-2 text-gray-700">
            <p><span className="font-medium w-48 inline-block">Complaints:</span> {customer.complaints}</p>
            <p><span className="font-medium w-48 inline-block">Support Calls:</span> {customer.customerSupportCalls}</p>
            <p><span className="font-medium w-48 inline-block">Late Payments:</span> {customer.latePayments}</p>
            <p><span className="font-medium w-48 inline-block">Usage Frequency:</span> {customer.usageFrequency ?? '-'}</p>
          </div>
        </div>
      </div>

      {/* Predictions and Segments History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Prediction History</h2>
          {customer.predictions && customer.predictions.length > 0 ? (
            <ul className="space-y-3">
              {customer.predictions.map((p: any) => (
                <li key={p.id} className="text-sm bg-gray-50 p-3 rounded">
                  <p><strong>Predicted Churn:</strong> {p.predictedChurn ? 'Yes' : 'No'}</p>
                  <p><strong>Probability:</strong> {p.probability}</p>
                  <p className="text-gray-500 text-xs">{new Date(p.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No predictions recorded.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Segment History</h2>
          {customer.segments && customer.segments.length > 0 ? (
             <ul className="space-y-3">
             {customer.segments.map((s: any) => (
               <li key={s.id} className="text-sm bg-gray-50 p-3 rounded">
                 <p><strong>Cluster:</strong> {s.cluster} {s.segmentName ? `(${s.segmentName})` : ''}</p>
                 <p className="text-gray-500 text-xs">{new Date(s.createdAt).toLocaleString()}</p>
               </li>
             ))}
           </ul>
          ) : (
            <p className="text-sm text-gray-500">No segments assigned.</p>
          )}
        </div>
      </div>

    </div>
  );
}
