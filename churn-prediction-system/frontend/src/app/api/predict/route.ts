import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customerData = body; // raw form data mapped to python schemas

    // Send to Python ML Service
    const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const mlResponse = await fetch(`${ML_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData)
    });

    if (!mlResponse.ok) {
      const err = await mlResponse.text();
      return NextResponse.json({ error: `ML Service Prediction Error: ${err}` }, { status: 500 });
    }

    const data = await mlResponse.json();
    
    // Find active model ID for history tracking
    const activeModel = await prisma.mLModel.findFirst({
      where: { isActive: true, modelType: 'SUPERVISED' }
    });

    // Save Prediction in DB (Phase 11 Requirement)
    if (customerData.customer_id) {
      // Find customer internal ID
      const customer = await prisma.customer.findUnique({
        where: { customerId: customerData.customer_id }
      });

      if (customer) {
        await prisma.prediction.create({
          data: {
            customerId: customerData.customer_id,
            predictedChurn: data.predicted_churn,
            probability: data.probability,
            modelId: activeModel ? activeModel.id : null,
            riskCategory: data.probability > 0.7 ? 'High' : (data.probability > 0.4 ? 'Medium' : 'Low')
          }
        });
      }
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error predicting churn:', error);
    return NextResponse.json({ error: 'Failed to execute prediction' }, { status: 500 });
  }
}
