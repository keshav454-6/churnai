import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const customersData = [
    {
      customerId: 'CUST-001',
      age: 35,
      gender: 'Male',
      tenure: 12,
      contractType: 'Month-to-month',
      monthlyCharges: 55.5,
      totalCharges: 666.0,
      paymentMethod: 'Electronic check',
      internetService: 'DSL',
      numberOfServices: 2,
      complaints: 1,
      customerSupportCalls: 2,
      usageFrequency: 'High',
      latePayments: 0,
      churn: false,
    },
    {
      customerId: 'CUST-002',
      age: 42,
      gender: 'Female',
      tenure: 2,
      contractType: 'Month-to-month',
      monthlyCharges: 85.0,
      totalCharges: 170.0,
      paymentMethod: 'Credit card (automatic)',
      internetService: 'Fiber optic',
      numberOfServices: 3,
      complaints: 3,
      customerSupportCalls: 4,
      usageFrequency: 'Medium',
      latePayments: 1,
      churn: true,
    },
    {
      customerId: 'CUST-003',
      age: 28,
      gender: 'Male',
      tenure: 24,
      contractType: 'One year',
      monthlyCharges: 45.0,
      totalCharges: 1080.0,
      paymentMethod: 'Mailed check',
      internetService: 'No',
      numberOfServices: 1,
      complaints: 0,
      customerSupportCalls: 1,
      usageFrequency: 'Low',
      latePayments: 0,
      churn: false,
    },
    {
      customerId: 'CUST-004',
      age: 65,
      gender: 'Female',
      tenure: 72,
      contractType: 'Two year',
      monthlyCharges: 110.5,
      totalCharges: 7956.0,
      paymentMethod: 'Bank transfer (automatic)',
      internetService: 'Fiber optic',
      numberOfServices: 5,
      complaints: 0,
      customerSupportCalls: 0,
      usageFrequency: 'High',
      latePayments: 0,
      churn: false,
    },
    {
      customerId: 'CUST-005',
      age: 51,
      gender: 'Male',
      tenure: 1,
      contractType: 'Month-to-month',
      monthlyCharges: 70.0,
      totalCharges: 70.0,
      paymentMethod: 'Electronic check',
      internetService: 'Fiber optic',
      numberOfServices: 1,
      complaints: 2,
      customerSupportCalls: 3,
      usageFrequency: 'High',
      latePayments: 2,
      churn: true,
    }
  ];

  for (const c of customersData) {
    const customer = await prisma.customer.upsert({
      where: { customerId: c.customerId },
      update: {},
      create: c,
    });
    console.log(`Created/Updated customer with id: ${customer.customerId}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
