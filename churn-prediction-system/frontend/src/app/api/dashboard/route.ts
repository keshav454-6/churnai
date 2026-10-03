import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const totalCustomers = await prisma.customer.count();
    
    if (totalCustomers === 0) {
      return NextResponse.json({
        kpis: {
          totalCustomers: 0,
          churnedCustomers: 0,
          activeCustomers: 0,
          churnRate: 0,
          avgMonthlyCharges: 0,
          avgTenure: 0,
          totalComplaints: 0
        },
        charts: {
          churnDistribution: [],
          churnByContract: [],
          churnByTenure: [],
          monthlyChargesVsChurn: [],
          complaintsVsChurn: [],
          paymentMethodVsChurn: []
        }
      });
    }

    const churnedCustomers = await prisma.customer.count({ where: { churn: true } });
    const activeCustomers = totalCustomers - churnedCustomers;
    const churnRate = ((churnedCustomers / totalCustomers) * 100).toFixed(2);

    const aggregates = await prisma.customer.aggregate({
      _avg: {
        monthlyCharges: true,
        tenure: true
      },
      _sum: {
        complaints: true
      }
    });

    // Chart 1: Churn Distribution
    const churnDistribution = [
      { name: 'Churn (Yes)', value: churnedCustomers },
      { name: 'Active (No)', value: activeCustomers }
    ];

    // Chart 2: Churn by Contract
    const byContractRaw = await prisma.customer.groupBy({
      by: ['contractType', 'churn'],
      _count: { _all: true }
    });

    const churnByContract = Array.from(new Set(byContractRaw.map(r => r.contractType))).map(type => {
      const yes = byContractRaw.find(r => r.contractType === type && r.churn === true)?._count._all || 0;
      const no = byContractRaw.find(r => r.contractType === type && r.churn === false)?._count._all || 0;
      return { contractType: type || 'Unknown', Yes: yes, No: no };
    });

    // Chart 3: Churn by Tenure Group (0-12, 13-24, 25-48, 49+)
    // Doing it simply in memory for the demo, since SQLite/MySQL group by ranges is tricky without raw query
    const customers = await prisma.customer.findMany({
      select: { tenure: true, churn: true, monthlyCharges: true, complaints: true, paymentMethod: true }
    });

    const tenureGroups = { '0-12m': {Yes: 0, No: 0}, '13-24m': {Yes: 0, No: 0}, '25-48m': {Yes: 0, No: 0}, '49m+': {Yes: 0, No: 0} };
    const chargeGroups = { '$0-30': {Yes:0, No:0}, '$31-60': {Yes:0, No:0}, '$61-90': {Yes:0, No:0}, '$91+': {Yes:0, No:0} };
    const complaintGroups = { '0': {Yes:0, No:0}, '1': {Yes:0, No:0}, '2': {Yes:0, No:0}, '3+': {Yes:0, No:0} };
    const paymentGroups: Record<string, {Yes: number, No: number}> = {};

    customers.forEach(c => {
      const churnStatus = c.churn ? 'Yes' : 'No';
      
      // Tenure
      const t = c.tenure || 0;
      if (t <= 12) tenureGroups['0-12m'][churnStatus]++;
      else if (t <= 24) tenureGroups['13-24m'][churnStatus]++;
      else if (t <= 48) tenureGroups['25-48m'][churnStatus]++;
      else tenureGroups['49m+'][churnStatus]++;

      // Charges
      const m = c.monthlyCharges ? Number(c.monthlyCharges) : 0;
      if (m <= 30) chargeGroups['$0-30'][churnStatus]++;
      else if (m <= 60) chargeGroups['$31-60'][churnStatus]++;
      else if (m <= 90) chargeGroups['$61-90'][churnStatus]++;
      else chargeGroups['$91+'][churnStatus]++;

      // Complaints
      const comp = c.complaints || 0;
      if (comp === 0) complaintGroups['0'][churnStatus]++;
      else if (comp === 1) complaintGroups['1'][churnStatus]++;
      else if (comp === 2) complaintGroups['2'][churnStatus]++;
      else complaintGroups['3+'][churnStatus]++;

      // Payment Method
      const pay = c.paymentMethod || 'Unknown';
      if (!paymentGroups[pay]) paymentGroups[pay] = {Yes: 0, No: 0};
      paymentGroups[pay][churnStatus]++;
    });

    const churnByTenure = Object.keys(tenureGroups).map(k => ({ group: k, ...tenureGroups[k as keyof typeof tenureGroups] }));
    const monthlyChargesVsChurn = Object.keys(chargeGroups).map(k => ({ group: k, ...chargeGroups[k as keyof typeof chargeGroups] }));
    const complaintsVsChurn = Object.keys(complaintGroups).map(k => ({ group: k, ...complaintGroups[k as keyof typeof complaintGroups] }));
    const paymentMethodVsChurn = Object.keys(paymentGroups).map(k => ({ method: k, ...paymentGroups[k] }));

    return NextResponse.json({
      kpis: {
        totalCustomers,
        churnedCustomers,
        activeCustomers,
        churnRate,
        avgMonthlyCharges: aggregates._avg.monthlyCharges?.toFixed(2) || 0,
        avgTenure: aggregates._avg.tenure?.toFixed(1) || 0,
        totalComplaints: aggregates._sum.complaints || 0
      },
      charts: {
        churnDistribution,
        churnByContract,
        churnByTenure,
        monthlyChargesVsChurn,
        complaintsVsChurn,
        paymentMethodVsChurn
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
