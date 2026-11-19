/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const serializeBigInt = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return Number(obj);
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === 'object') {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, serializeBigInt(v)]));
  }
  return obj;
};

const MOCK_EDA = {
  churnDist: [
    { churn: false, count: 6 },
    { churn: true, count: 4 }
  ],
  avgComplaints: [
    { churn: false, avgComplaints: 0.33 },
    { churn: true, avgComplaints: 2.75 }
  ],
  contractChurn: [
    { contractType: 'Month-to-month', churn: false, count: 2 },
    { contractType: 'Month-to-month', churn: true, count: 4 },
    { contractType: 'One year', churn: false, count: 2 },
    { contractType: 'One year', churn: true, count: 0 },
    { contractType: 'Two year', churn: false, count: 2 },
    { contractType: 'Two year', churn: true, count: 0 }
  ],
  paymentChurn: [
    { paymentMethod: 'Electronic check', churn: true, count: 3 },
    { paymentMethod: 'Electronic check', churn: false, count: 1 },
    { paymentMethod: 'Credit card (automatic)', churn: true, count: 1 },
    { paymentMethod: 'Credit card (automatic)', churn: false, count: 2 },
    { paymentMethod: 'Bank transfer (automatic)', churn: false, count: 2 },
    { paymentMethod: 'Mailed check', churn: false, count: 1 }
  ],
  avgCharges: [
    { churn: false, avgCharges: 63.83 },
    { churn: true, avgCharges: 81.62 }
  ]
};

export async function GET() {
  try {
    const churnDist = await prisma.$queryRaw`
      SELECT churn, COUNT(*) as count 
      FROM Customer 
      GROUP BY churn
    `;

    const avgComplaints = await prisma.$queryRaw`
      SELECT churn, AVG(complaints) as avgComplaints 
      FROM Customer 
      GROUP BY churn
    `;

    const contractChurn = await prisma.$queryRaw`
      SELECT contractType, churn, COUNT(*) as count 
      FROM Customer 
      GROUP BY contractType, churn
    `;

    const paymentChurn = await prisma.$queryRaw`
      SELECT paymentMethod, churn, COUNT(*) as count 
      FROM Customer 
      GROUP BY paymentMethod, churn
    `;

    const avgCharges = await prisma.$queryRaw`
      SELECT churn, AVG(monthlyCharges) as avgCharges 
      FROM Customer 
      GROUP BY churn
    `;

    return NextResponse.json(serializeBigInt({
      churnDist,
      avgComplaints,
      contractChurn,
      paymentChurn,
      avgCharges
    }));
  } catch (error) {
    console.warn('Database offline on serverless, returning mock EDA:', error);
    return NextResponse.json(MOCK_EDA);
  }
}
