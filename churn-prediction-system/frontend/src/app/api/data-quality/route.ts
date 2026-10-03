import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalRecords = await prisma.customer.count();
    
    // Simplified metrics for now. In a real app, you might do deeper column-level null checks via raw SQL.
    const churnYes = await prisma.customer.count({ where: { churn: true } });
    const churnNo = await prisma.customer.count({ where: { churn: false } });

    // Assuming our schema enforces most data quality anyway via import validation
    // We can count missing optional fields
    const missingGender = await prisma.customer.count({ where: { gender: null } });
    const missingTotalCharges = await prisma.customer.count({ where: { totalCharges: null } });

    // Determine status
    let status = 'Good';
    if (totalRecords === 0) status = 'Poor';
    else if ((missingGender + missingTotalCharges) / totalRecords > 0.1) status = 'Needs Attention';

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
        { name: 'age', missing: 0, valid: totalRecords, status: 'Good' }, // assuming required
        { name: 'gender', missing: missingGender, valid: totalRecords - missingGender, status: missingGender > 0 ? 'Needs Attention' : 'Good' },
        { name: 'total_charges', missing: missingTotalCharges, valid: totalRecords - missingTotalCharges, status: missingTotalCharges > 0 ? 'Needs Attention' : 'Good' },
      ]
    });
  } catch (error) {
    console.error('Error fetching data quality metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
