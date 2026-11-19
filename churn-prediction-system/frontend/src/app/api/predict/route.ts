import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customerData = body; // raw form data mapped to python schemas

    let data;
    const ML_URL = process.env.ML_SERVICE_URL || 'https://ml-service-smoky-two.vercel.app';
    
    try {
      const mlResponse = await fetch(`${ML_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });

      if (mlResponse.ok) {
        data = await mlResponse.json();
      }
    } catch (err) {
      console.warn('ML Service unreachable, falling back to local heuristic:', err);
    }

    if (!data) {
      // Heuristic fallback for serverless demo
      const complaints = Number(customerData.complaints || 0);
      const tenure = Number(customerData.tenure || 12);
      const monthly = Number(customerData.monthly_charges || 50);
      const latePay = Number(customerData.late_payments || 0);
      const contract = customerData.contract_type || 'Month-to-month';

      let score = 0.15;
      if (contract === 'Month-to-month') score += 0.3;
      if (complaints > 0) score += complaints * 0.15;
      if (latePay > 0) score += latePay * 0.15;
      if (tenure < 6) score += 0.2;
      if (monthly > 80) score += 0.1;

      const prob = Math.min(0.95, Math.max(0.05, score));
      data = {
        predicted_churn: prob > 0.5,
        probability: Math.round(prob * 100) / 100,
        risk_category: prob > 0.7 ? 'High' : (prob > 0.4 ? 'Medium' : 'Low')
      };
    }

    // Try saving Prediction in DB if available
    try {
      const activeModel = await prisma.mLModel.findFirst({
        where: { isActive: true, modelType: 'SUPERVISED' }
      });

      if (customerData.customer_id) {
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
    } catch (dbErr) {
      console.warn('Database offline on serverless, skipped saving prediction record:', dbErr);
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error predicting churn:', error);
    return NextResponse.json({ error: 'Failed to execute prediction' }, { status: 500 });
  }
}
