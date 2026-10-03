/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer 
} from 'recharts';

const COLORS = ['#ef4444', '#22c55e']; // Red for Churn, Green for Active

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!data) return null;

  const { kpis, charts } = data;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900">Project Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Customers" value={kpis.totalCustomers} />
        <KPICard title="Churned" value={kpis.churnedCustomers} valueColor="text-red-600" />
        <KPICard title="Active" value={kpis.activeCustomers} valueColor="text-green-600" />
        <KPICard title="Churn Rate" value={`${kpis.churnRate}%`} />
        <KPICard title="Avg Monthly Charges" value={`$${kpis.avgMonthlyCharges}`} />
        <KPICard title="Avg Tenure (Months)" value={kpis.avgTenure} />
        <KPICard title="Total Complaints" value={kpis.totalComplaints} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="Churn Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={charts.churnDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#8884d8" dataKey="value" label>
                {charts.churnDistribution.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Churn by Contract Type">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.churnByContract}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="contractType" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="Yes" stackId="a" fill="#ef4444" name="Churned" />
              <Bar dataKey="No" stackId="a" fill="#22c55e" name="Active" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="Churn by Tenure">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.churnByTenure}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="group" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="Yes" stackId="a" fill="#ef4444" name="Churned" />
              <Bar dataKey="No" stackId="a" fill="#22c55e" name="Active" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Charges vs Churn">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.monthlyChargesVsChurn}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="group" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="Yes" stackId="a" fill="#ef4444" name="Churned" />
              <Bar dataKey="No" stackId="a" fill="#22c55e" name="Active" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="Complaints vs Churn">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.complaintsVsChurn}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="group" label={{ value: 'Number of Complaints', position: 'insideBottom', offset: -5 }} />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="Yes" stackId="a" fill="#ef4444" name="Churned" />
              <Bar dataKey="No" stackId="a" fill="#22c55e" name="Active" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Payment Method vs Churn">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.paymentMethodVsChurn}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="method" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="Yes" stackId="a" fill="#ef4444" name="Churned" />
              <Bar dataKey="No" stackId="a" fill="#22c55e" name="Active" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

    </div>
  );
}

function KPICard({ title, value, valueColor = 'text-gray-900' }: { title: string, value: string | number, valueColor?: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-6">{title}</h2>
      {children}
    </div>
  );
}

