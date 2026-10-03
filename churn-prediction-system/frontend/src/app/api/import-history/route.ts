import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const history = await prisma.importHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching import history:', error);
    return NextResponse.json({ error: 'Failed to fetch import history' }, { status: 500 });
  }
}
