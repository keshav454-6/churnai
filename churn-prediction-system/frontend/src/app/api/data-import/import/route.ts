import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { validRows, fileName, totalRows } = body;

    if (!validRows || !Array.isArray(validRows)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // 1. Check for existing customer IDs in the database to avoid overwriting
    const incomingIds = validRows.map(r => String(r.data.customer_id));
    
    const existingCustomers = await prisma.customer.findMany({
      where: {
        customerId: { in: incomingIds }
      },
      select: { customerId: true }
    });
    
    const existingIds = new Set(existingCustomers.map(c => c.customerId));

    // Filter out rows that already exist in DB
    const rowsToInsert = validRows.filter(r => !existingIds.has(String(r.data.customer_id)));
    const dbDuplicateCount = validRows.length - rowsToInsert.length;

    // 2. Prepare data for Prisma
    const prismaData = rowsToInsert.map(r => ({
      customerId: String(r.data.customer_id),
      age: r.data.age ? Number(r.data.age) : null,
      gender: r.data.gender ? String(r.data.gender) : null,
      tenure: r.data.tenure ? Number(r.data.tenure) : null,
      contractType: r.data.contract_type ? String(r.data.contract_type) : null,
      monthlyCharges: r.data.monthly_charges ? Number(r.data.monthly_charges) : null,
      totalCharges: r.data.total_charges ? Number(r.data.total_charges) : null,
      paymentMethod: r.data.payment_method ? String(r.data.payment_method) : null,
      internetService: r.data.internet_service ? String(r.data.internet_service) : null,
      numberOfServices: r.data.number_of_services ? Number(r.data.number_of_services) : null,
      complaints: r.data.complaints ? Number(r.data.complaints) : 0,
      customerSupportCalls: r.data.customer_support_calls ? Number(r.data.customer_support_calls) : 0,
      usageFrequency: r.data.usage_frequency ? String(r.data.usage_frequency) : null,
      latePayments: r.data.late_payments ? Number(r.data.late_payments) : 0,
      churn: Boolean(r.data.churn)
    }));

    // 3. Insert into DB (using a transaction to ensure either all valid records insert or none, and history is updated)
    let successfulRows = 0;
    
    if (prismaData.length > 0) {
      await prisma.$transaction(async (tx) => {
        const createResult = await tx.customer.createMany({
          data: prismaData,
          skipDuplicates: true // extra safety net
        });
        successfulRows = createResult.count;
      });
    }

    const failedRows = totalRows - successfulRows;
    const status = successfulRows === totalRows ? 'SUCCESS' : (successfulRows > 0 ? 'PARTIAL' : 'FAILED');

    // 4. Record Import History
    await prisma.importHistory.create({
      data: {
        fileName: fileName || 'Unknown File',
        fileType: 'Excel',
        totalRows: totalRows,
        successfulRows: successfulRows,
        failedRows: failedRows,
        status: status,
        errorMessage: dbDuplicateCount > 0 ? `${dbDuplicateCount} records ignored (already exist in DB).` : null
      }
    });

    return NextResponse.json({
      success: true,
      totalRows,
      successfulRows,
      failedRows,
      dbDuplicateCount,
      status
    });

  } catch (error: unknown) {
    console.error('Error importing data:', error);
    return NextResponse.json({ error: 'Failed to import records' }, { status: 500 });
  }
}
