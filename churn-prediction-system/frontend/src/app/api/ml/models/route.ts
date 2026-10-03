import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const models = await prisma.mLModel.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(models);
  } catch (error: unknown) {
    console.error('Error fetching models:', error);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}
