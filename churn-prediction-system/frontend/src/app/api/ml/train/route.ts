import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { modelType } = body; // e.g. "random_forest"

    // Fetch training data from local database
    const customers = await prisma.customer.findMany({
      select: {
        customerId: true, age: true, gender: true, tenure: true,
        contractType: true, monthlyCharges: true, totalCharges: true,
        paymentMethod: true, internetService: true, numberOfServices: true,
        complaints: true, customerSupportCalls: true, usageFrequency: true,
        latePayments: true, churn: true
      }
    });

    // Proxy request to Python FastAPI ML Service with data
    const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const mlResponse = await fetch(`${ML_URL}/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        model_type: modelType,
        training_data: customers
      })
    });

    if (!mlResponse.ok) {
      const err = await mlResponse.text();
      return NextResponse.json({ error: `ML Service Error: ${err}` }, { status: 500 });
    }

    const data = await mlResponse.json();

    // Determine basic versioning strategy based on count
    const existingCount = await prisma.mLModel.count({
      where: { name: modelType }
    });
    const version = `v${existingCount + 1}.0`;

    // Deactivate previous active models of this type if needed, or globally.
    // Assuming only 1 active supervised model at a time.
    await prisma.mLModel.updateMany({
      where: { modelType: 'SUPERVISED' },
      data: { isActive: false }
    });

    // Save to Model Registry
    const savedModel = await prisma.mLModel.create({
      data: {
        name: modelType,
        algorithm: modelType,
        modelType: 'SUPERVISED',
        version: version,
        accuracy: data.accuracy,
        precision: data.precision,
        recall: data.recall,
        f1Score: data.f1,
        modelPath: `../models/${modelType}.joblib`,
        isActive: true,
      }
    });

    return NextResponse.json({
      success: true,
      metrics: data,
      registry: savedModel
    });
  } catch (error: unknown) {
    console.error('Error training model:', error);
    return NextResponse.json({ error: 'Failed to train model' }, { status: 500 });
  }
}
