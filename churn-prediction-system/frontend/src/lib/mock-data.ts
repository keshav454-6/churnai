export interface CustomerRecord {
  id: number;
  customerId: string;
  age: number | null;
  gender: string | null;
  tenure: number | null;
  contractType: string;
  monthlyCharges: number | null;
  totalCharges: number | null;
  paymentMethod: string | null;
  internetService: string | null;
  numberOfServices: number | null;
  complaints: number;
  customerSupportCalls: number;
  usageFrequency: string | null;
  latePayments: number;
  churn: boolean;
  createdAt: string;
}

export const MOCK_CUSTOMERS: CustomerRecord[] = [
  {
    id: 1,
    customerId: 'CUST-001',
    age: 35,
    gender: 'Male',
    tenure: 12,
    contractType: 'Month-to-month',
    monthlyCharges: 55.5,
    totalCharges: 666.0,
    paymentMethod: 'Electronic check',
    internetService: 'DSL',
    numberOfServices: 2,
    complaints: 1,
    customerSupportCalls: 2,
    usageFrequency: 'High',
    latePayments: 0,
    churn: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    customerId: 'CUST-002',
    age: 42,
    gender: 'Female',
    tenure: 2,
    contractType: 'Month-to-month',
    monthlyCharges: 85.0,
    totalCharges: 170.0,
    paymentMethod: 'Credit card (automatic)',
    internetService: 'Fiber optic',
    numberOfServices: 3,
    complaints: 3,
    customerSupportCalls: 4,
    usageFrequency: 'Medium',
    latePayments: 1,
    churn: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    customerId: 'CUST-003',
    age: 28,
    gender: 'Male',
    tenure: 24,
    contractType: 'One year',
    monthlyCharges: 45.0,
    totalCharges: 1080.0,
    paymentMethod: 'Mailed check',
    internetService: 'No',
    numberOfServices: 1,
    complaints: 0,
    customerSupportCalls: 1,
    usageFrequency: 'Low',
    latePayments: 0,
    churn: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    customerId: 'CUST-004',
    age: 65,
    gender: 'Female',
    tenure: 72,
    contractType: 'Two year',
    monthlyCharges: 110.5,
    totalCharges: 7956.0,
    paymentMethod: 'Bank transfer (automatic)',
    internetService: 'Fiber optic',
    numberOfServices: 5,
    complaints: 0,
    customerSupportCalls: 0,
    usageFrequency: 'High',
    latePayments: 0,
    churn: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 5,
    customerId: 'CUST-005',
    age: 51,
    gender: 'Male',
    tenure: 1,
    contractType: 'Month-to-month',
    monthlyCharges: 70.0,
    totalCharges: 70.0,
    paymentMethod: 'Electronic check',
    internetService: 'Fiber optic',
    numberOfServices: 1,
    complaints: 2,
    customerSupportCalls: 3,
    usageFrequency: 'High',
    latePayments: 2,
    churn: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 6,
    customerId: 'CUST-006',
    age: 29,
    gender: 'Female',
    tenure: 36,
    contractType: 'One year',
    monthlyCharges: 62.0,
    totalCharges: 2232.0,
    paymentMethod: 'Bank transfer (automatic)',
    internetService: 'DSL',
    numberOfServices: 3,
    complaints: 0,
    customerSupportCalls: 1,
    usageFrequency: 'Medium',
    latePayments: 0,
    churn: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 7,
    customerId: 'CUST-007',
    age: 48,
    gender: 'Male',
    tenure: 4,
    contractType: 'Month-to-month',
    monthlyCharges: 92.5,
    totalCharges: 370.0,
    paymentMethod: 'Electronic check',
    internetService: 'Fiber optic',
    numberOfServices: 4,
    complaints: 4,
    customerSupportCalls: 5,
    usageFrequency: 'High',
    latePayments: 1,
    churn: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 8,
    customerId: 'CUST-008',
    age: 38,
    gender: 'Female',
    tenure: 18,
    contractType: 'Month-to-month',
    monthlyCharges: 40.0,
    totalCharges: 720.0,
    paymentMethod: 'Credit card (automatic)',
    internetService: 'DSL',
    numberOfServices: 2,
    complaints: 1,
    customerSupportCalls: 2,
    usageFrequency: 'Low',
    latePayments: 0,
    churn: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 9,
    customerId: 'CUST-009',
    age: 55,
    gender: 'Male',
    tenure: 60,
    contractType: 'Two year',
    monthlyCharges: 105.0,
    totalCharges: 6300.0,
    paymentMethod: 'Credit card (automatic)',
    internetService: 'Fiber optic',
    numberOfServices: 4,
    complaints: 0,
    customerSupportCalls: 0,
    usageFrequency: 'High',
    latePayments: 0,
    churn: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 10,
    customerId: 'CUST-010',
    age: 31,
    gender: 'Female',
    tenure: 8,
    contractType: 'Month-to-month',
    monthlyCharges: 79.0,
    totalCharges: 632.0,
    paymentMethod: 'Electronic check',
    internetService: 'Fiber optic',
    numberOfServices: 2,
    complaints: 2,
    customerSupportCalls: 3,
    usageFrequency: 'Medium',
    latePayments: 1,
    churn: true,
    createdAt: new Date().toISOString()
  }
];

export function getMockDashboardData() {
  const totalCustomers = MOCK_CUSTOMERS.length;
  const churnedCustomers = MOCK_CUSTOMERS.filter(c => c.churn).length;
  const activeCustomers = totalCustomers - churnedCustomers;
  const churnRate = ((churnedCustomers / totalCustomers) * 100).toFixed(2);

  const totalChargesSum = MOCK_CUSTOMERS.reduce((acc, c) => acc + (c.monthlyCharges || 0), 0);
  const avgMonthlyCharges = (totalChargesSum / totalCustomers).toFixed(2);

  const totalTenureSum = MOCK_CUSTOMERS.reduce((acc, c) => acc + (c.tenure || 0), 0);
  const avgTenure = (totalTenureSum / totalCustomers).toFixed(1);

  const totalComplaints = MOCK_CUSTOMERS.reduce((acc, c) => acc + (c.complaints || 0), 0);

  const churnDistribution = [
    { name: 'Churn (Yes)', value: churnedCustomers },
    { name: 'Active (No)', value: activeCustomers }
  ];

  // Group by Contract
  const contractMap: Record<string, { Yes: number; No: number }> = {};
  MOCK_CUSTOMERS.forEach(c => {
    const type = c.contractType || 'Unknown';
    if (!contractMap[type]) contractMap[type] = { Yes: 0, No: 0 };
    if (c.churn) contractMap[type].Yes++;
    else contractMap[type].No++;
  });
  const churnByContract = Object.keys(contractMap).map(type => ({
    contractType: type,
    Yes: contractMap[type].Yes,
    No: contractMap[type].No
  }));

  // Tenure Groups
  const tenureGroups: Record<string, { Yes: number; No: number }> = {
    '0-12m': { Yes: 0, No: 0 },
    '13-24m': { Yes: 0, No: 0 },
    '25-48m': { Yes: 0, No: 0 },
    '49m+': { Yes: 0, No: 0 }
  };
  const chargeGroups: Record<string, { Yes: number; No: number }> = {
    '$0-30': { Yes: 0, No: 0 },
    '$31-60': { Yes: 0, No: 0 },
    '$61-90': { Yes: 0, No: 0 },
    '$91+': { Yes: 0, No: 0 }
  };
  const complaintGroups: Record<string, { Yes: number; No: number }> = {
    '0': { Yes: 0, No: 0 },
    '1': { Yes: 0, No: 0 },
    '2': { Yes: 0, No: 0 },
    '3+': { Yes: 0, No: 0 }
  };
  const paymentGroups: Record<string, { Yes: number; No: number }> = {};

  MOCK_CUSTOMERS.forEach(c => {
    const churnStatus = c.churn ? 'Yes' : 'No';
    const t = c.tenure || 0;
    if (t <= 12) tenureGroups['0-12m'][churnStatus]++;
    else if (t <= 24) tenureGroups['13-24m'][churnStatus]++;
    else if (t <= 48) tenureGroups['25-48m'][churnStatus]++;
    else tenureGroups['49m+'][churnStatus]++;

    const m = c.monthlyCharges || 0;
    if (m <= 30) chargeGroups['$0-30'][churnStatus]++;
    else if (m <= 60) chargeGroups['$31-60'][churnStatus]++;
    else if (m <= 90) chargeGroups['$61-90'][churnStatus]++;
    else chargeGroups['$91+'][churnStatus]++;

    const comp = c.complaints || 0;
    if (comp === 0) complaintGroups['0'][churnStatus]++;
    else if (comp === 1) complaintGroups['1'][churnStatus]++;
    else if (comp === 2) complaintGroups['2'][churnStatus]++;
    else complaintGroups['3+'][churnStatus]++;

    const pay = c.paymentMethod || 'Unknown';
    if (!paymentGroups[pay]) paymentGroups[pay] = { Yes: 0, No: 0 };
    paymentGroups[pay][churnStatus]++;
  });

  const churnByTenure = Object.keys(tenureGroups).map(k => ({ group: k, ...tenureGroups[k] }));
  const monthlyChargesVsChurn = Object.keys(chargeGroups).map(k => ({ group: k, ...chargeGroups[k] }));
  const complaintsVsChurn = Object.keys(complaintGroups).map(k => ({ group: k, ...complaintGroups[k] }));
  const paymentMethodVsChurn = Object.keys(paymentGroups).map(k => ({ method: k, ...paymentGroups[k] }));

  return {
    kpis: {
      totalCustomers,
      churnedCustomers,
      activeCustomers,
      churnRate,
      avgMonthlyCharges,
      avgTenure,
      totalComplaints
    },
    charts: {
      churnDistribution,
      churnByContract,
      churnByTenure,
      monthlyChargesVsChurn,
      complaintsVsChurn,
      paymentMethodVsChurn
    }
  };
}
