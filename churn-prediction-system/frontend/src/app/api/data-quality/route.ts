import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MOCK_CUSTOMERS } from '@/lib/mock-data';

export async function GET() {
  try {
    const totalRecords = await prisma.customer.count();
    
    if (totalRecords > 0) {
      const churnYes = await prisma.customer.count({ where: { churn: true } });
      const churnNo = await prisma.customer.count({ where: { churn: false } });
      const missingGender = await prisma.customer.count({ where: { gender: null } });
      const missingTotalCharges = await prisma.customer.count({ where: { totalCharges: null } });

      let status = 'Good';
      if ((missingGender + missingTotalCharges) / totalRecords > 0.1) status = 'Needs Attention';

      return NextResponse.json({
        dataset: {
          totalRecords,
          missingValues: missingGender + missingTotalCharges,
          status
        },
        churnDistribution: {
          yes: churnYes,
          no: churnNo
        },
        columnQuality: [
          { name: 'customer_id', missing: 0, valid: totalRecords, status: 'Good' },
          { name: 'age', missing: 0, valid: totalRecords, status: 'Good' },
          { name: 'gender', missing: missingGender, valid: totalRecords - missingGender, status: missingGender > 0 ? 'Needs Attention' : 'Good' },
          { name: 'total_charges', missing: missingTotalCharges, valid: totalRecords - missingTotalCharges, status: missingTotalCharges > 0 ? 'Needs Attention' : 'Good' },
        ]
      });
    }
  } catch (error) {
    console.warn('Database offline on serverless, returning mock data quality:', error);
  }

  // Fallback metrics
  const total = MOCK_CUSTOMERS.length;
  const churnYes = MOCK_CUSTOMERS.filter(c => c.churn).length;
  const churnNo = total - churnYes;

  return NextResponse.json({
    dataset: {
      totalRecords: total,
      missingValues: 0,
      status: 'Good'
    },
    churnDistribution: {
      yes: churnYes,
      no: churnNo
    },
    columnQuality: [
      { name: 'customer_id', missing: 0, valid: total, status: 'Good' },
      { name: 'age', missing: 0, valid: total, status: 'Good' },
      { name: 'gender', missing: 0, valid: total, status: 'Good' },
      { name: 'total_charges', missing: 0, valid: total, status: 'Good' },
    ]
  });
}
