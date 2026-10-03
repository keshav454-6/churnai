'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Customer = {
  id: number;
  customerId: string;
  age: number | null;
  contractType: string;
  tenure: number | null;
  monthlyCharges: number | null;
  complaints: number;
  churn: boolean;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // Separate search string for the effect
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let active = true;
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/customers?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (res.ok && active) {
          setCustomers(data.data);
          setTotalPages(data.meta.totalPages || 1);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchCustomers();
    return () => { active = false; };
  }, [page, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(search);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
        <Link href="/data-import" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Import Data
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input 
            type="text" 
            placeholder="Search by ID or Contract Type..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900">
            Search
          </button>
        </form>

        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading customers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3">Customer ID</th>
                  <th className="px-4 py-3">Age</th>
                  <th className="px-4 py-3">Contract</th>
                  <th className="px-4 py-3">Tenure</th>
                  <th className="px-4 py-3">Monthly $</th>
                  <th className="px-4 py-3">Complaints</th>
                  <th className="px-4 py-3">Churn</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr><td colSpan={8} className="py-4 text-center">No customers found.</td></tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{c.customerId}</td>
                      <td className="px-4 py-3">{c.age ?? '-'}</td>
                      <td className="px-4 py-3">{c.contractType}</td>
                      <td className="px-4 py-3">{c.tenure ?? '-'}</td>
                      <td className="px-4 py-3">{c.monthlyCharges ? `$${c.monthlyCharges}` : '-'}</td>
                      <td className="px-4 py-3">{c.complaints}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.churn ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {c.churn ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/customers/${c.id}`} className="text-blue-600 hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-between items-center pt-4">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
