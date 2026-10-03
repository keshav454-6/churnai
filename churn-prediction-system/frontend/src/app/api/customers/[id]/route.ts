import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        predictions: { orderBy: { createdAt: 'desc' }, take: 5 },
        segments: { orderBy: { createdAt: 'desc' }, take: 5 }
      }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const body = await request.json();
    
    // Check if customer exists
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        age: body.age !== undefined ? Number(body.age) : undefined,
        gender: body.gender,
        tenure: body.tenure !== undefined ? Number(body.tenure) : undefined,
        contractType: body.contractType,
        monthlyCharges: body.monthlyCharges !== undefined ? Number(body.monthlyCharges) : undefined,
        totalCharges: body.totalCharges !== undefined ? Number(body.totalCharges) : undefined,
        paymentMethod: body.paymentMethod,
        internetService: body.internetService,
        numberOfServices: body.numberOfServices !== undefined ? Number(body.numberOfServices) : undefined,
        complaints: body.complaints !== undefined ? Number(body.complaints) : undefined,
        customerSupportCalls: body.customerSupportCalls !== undefined ? Number(body.customerSupportCalls) : undefined,
        usageFrequency: body.usageFrequency,
        latePayments: body.latePayments !== undefined ? Number(body.latePayments) : undefined,
        churn: body.churn !== undefined ? (body.churn === true || body.churn === 'true') : undefined
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    await prisma.customer.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
