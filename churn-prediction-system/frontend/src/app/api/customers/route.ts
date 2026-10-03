import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { customerId: { contains: search } },
        { contractType: { contains: search } },
      ]
    } : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count({ where })
    ]);

    return NextResponse.json({
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.customerId || !body.contractType) {
      return NextResponse.json({ error: 'customerId and contractType are required' }, { status: 400 });
    }

    const existing = await prisma.customer.findUnique({
      where: { customerId: body.customerId }
    });

    if (existing) {
      return NextResponse.json({ error: 'Customer ID already exists' }, { status: 400 });
    }

    const customer = await prisma.customer.create({
      data: {
        customerId: body.customerId,
        age: body.age ? Number(body.age) : null,
        gender: body.gender,
        tenure: body.tenure ? Number(body.tenure) : null,
        contractType: body.contractType,
        monthlyCharges: body.monthlyCharges ? Number(body.monthlyCharges) : null,
        totalCharges: body.totalCharges ? Number(body.totalCharges) : null,
        paymentMethod: body.paymentMethod,
        internetService: body.internetService,
        numberOfServices: body.numberOfServices ? Number(body.numberOfServices) : null,
        complaints: body.complaints ? Number(body.complaints) : 0,
        customerSupportCalls: body.customerSupportCalls ? Number(body.customerSupportCalls) : 0,
        usageFrequency: body.usageFrequency,
        latePayments: body.latePayments ? Number(body.latePayments) : 0,
        churn: body.churn === true || body.churn === 'true'
      }
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
