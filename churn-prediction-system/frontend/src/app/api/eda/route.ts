/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to serialize BigInts returned by Raw SQL COUNT(*)
const serializeBigInt = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return Number(obj);
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === 'object') {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, serializeBigInt(v)]));
  }
  return obj;
};

export async function GET() {
  try {
    // 1. Churn Distribution
    const churnDist = await prisma.$queryRaw`
      SELECT churn, COUNT(*) as count 
      FROM Customer 
      GROUP BY churn
    `;

    // 2. Average Complaints by Churn
    const avgComplaints = await prisma.$queryRaw`
      SELECT churn, AVG(complaints) as avgComplaints 
      FROM Customer 
      GROUP BY churn
    `;

    // 3. Contract vs Churn
    const contractChurn = await prisma.$queryRaw`
      SELECT contractType, churn, COUNT(*) as count 
      FROM Customer 
      GROUP BY contractType, churn
    `;

    // 4. Payment Method vs Churn
    const paymentChurn = await prisma.$queryRaw`
      SELECT paymentMethod, churn, COUNT(*) as count 
      FROM Customer 
      GROUP BY paymentMethod, churn
    `;

    // 5. Avg Monthly Charges by Churn
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
    console.error('Error in SQL EDA:', error);
    return NextResponse.json({ error: 'Failed to execute EDA queries' }, { status: 500 });
  }
}

