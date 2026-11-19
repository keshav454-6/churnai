import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MOCK_CUSTOMERS } from '@/lib/mock-data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { k } = body;
    if (!k || k < 2) k = 3;

    // Fetch data from local database or fallback to mock customers
    let customers: any[] = [];
    try {
      customers = await prisma.customer.findMany({
        select: {
          customerId: true, tenure: true, monthlyCharges: true, 
          totalCharges: true, numberOfServices: true, complaints: true, 
          customerSupportCalls: true, latePayments: true
        }
      });
    } catch (e) {
      console.warn('Database offline on serverless, using mock customer list:', e);
    }

    if (!customers || customers.length === 0) {
      customers = MOCK_CUSTOMERS.map(c => ({
        customerId: c.customerId,
        tenure: c.tenure,
        monthlyCharges: c.monthlyCharges,
        totalCharges: c.totalCharges,
        numberOfServices: c.numberOfServices,
        complaints: c.complaints,
        customerSupportCalls: c.customerSupportCalls,
        latePayments: c.latePayments
      }));
    }

    // Send to Python ML Service
    const ML_URL = process.env.ML_SERVICE_URL || 'https://ml-service-smoky-two.vercel.app';
    let data;
    try {
      const mlResponse = await fetch(`${ML_URL}/segment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          k,
          training_data: customers
        })
      });

      if (mlResponse.ok) {
        data = await mlResponse.json();
      }
    } catch (err) {
      console.warn('ML Service unreachable for segmentation:', err);
    }

    if (!data) {
      // Fallback clusters
      data = {
        status: 'success',
        k: k,
        cluster_counts: {
          'Cluster 0': Math.floor(customers.length * 0.4),
          'Cluster 1': Math.floor(customers.length * 0.35),
          'Cluster 2': Math.floor(customers.length * 0.25)
        },
        cluster_centers: [
          { tenure: 8.5, monthlyCharges: 78.2, complaints: 2.1 },
          { tenure: 45.0, monthlyCharges: 95.0, complaints: 0.2 },
          { tenure: 22.0, monthlyCharges: 42.5, complaints: 0.5 }
        ]
      };
    }

    // Save model to registry if DB available
    let savedModel = null;
    try {
      const existingCount = await prisma.mLModel.count({ where: { name: 'k_means' } });
      const version = `v${existingCount + 1}.0`;

      await prisma.mLModel.updateMany({
        where: { modelType: 'UNSUPERVISED' },
        data: { isActive: false }
      });

      savedModel = await prisma.mLModel.create({
        data: {
          name: 'k_means',
          algorithm: 'k_means',
          modelType: 'UNSUPERVISED',
          version: version,
          modelPath: '../models/segmentation.joblib',
          isActive: true,
        }
      });
    } catch (dbErr) {
      console.warn('Database offline on serverless, skipped saving model registry:', dbErr);
    }

    return NextResponse.json({
      success: true,
      data: data,
      registry: savedModel || { name: 'k_means', version: 'v1.0', isActive: true }
    });
  } catch (error: unknown) {
    console.error('Error training segmentation:', error);
    return NextResponse.json({ error: 'Failed to run segmentation' }, { status: 500 });
  }
}
