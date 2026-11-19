import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const MOCK_MODELS = [
  {
    id: 1,
    name: 'random_forest',
    algorithm: 'Random Forest',
    modelType: 'SUPERVISED',
    version: 'v1.0',
    accuracy: 0.88,
    precision: 0.85,
    recall: 0.82,
    f1Score: 0.83,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'k_means',
    algorithm: 'K-Means',
    modelType: 'UNSUPERVISED',
    version: 'v1.0',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export async function GET() {
  try {
    const models = await prisma.mLModel.findMany({
      orderBy: { createdAt: 'desc' }
    });
    if (models && models.length > 0) {
      return NextResponse.json(models);
    }
  } catch (error: unknown) {
    console.warn('Database offline on serverless, returning mock models:', error);
  }
  return NextResponse.json(MOCK_MODELS);
}
