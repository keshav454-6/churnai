import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { k } = body;

    // Send to Python ML Service
    const mlResponse = await fetch('http://localhost:8000/segment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ k })
    });

    if (!mlResponse.ok) {
      const err = await mlResponse.text();
      return NextResponse.json({ error: `ML Service Error: ${err}` }, { status: 500 });
    }

    const data = await mlResponse.json();

    // The data contains cluster_centers and cluster_counts, but the assignments are ideally bulk uploaded.
    // Since we mocked out the bulk upload in the Python side for brevity, let's document it here.
    // In a production system, python would return a large array of {customer_id, cluster} 
    // or perform direct DB injection.
    
    // Save model to registry
    const existingCount = await prisma.mLModel.count({ where: { name: 'k_means' } });
    const version = `v${existingCount + 1}.0`;

    await prisma.mLModel.updateMany({
      where: { modelType: 'UNSUPERVISED' },
      data: { isActive: false }
    });

    const savedModel = await prisma.mLModel.create({
      data: {
        name: 'k_means',
        algorithm: 'k_means',
        modelType: 'UNSUPERVISED',
        version: version,
        modelPath: '../models/segmentation.joblib',
        isActive: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: data,
      registry: savedModel
    });
  } catch (error: unknown) {
    console.error('Error training segmentation:', error);
    return NextResponse.json({ error: 'Failed to run segmentation' }, { status: 500 });
  }
}
