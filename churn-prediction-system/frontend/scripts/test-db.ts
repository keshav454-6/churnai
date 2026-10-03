import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
  console.log('--- Starting Database Verification ---');
  
  try {
    // 1. Connection check & insertion (Create)
    console.log('1. Attempting to insert test customer...');
    const testCustomer = await prisma.customer.create({
      data: {
        customerId: 'TEST-VERIFY-001',
        age: 99,
        gender: 'Other',
        churn: false
      }
    });
    console.log(`✅ Inserted test customer with id: ${testCustomer.id}`);

    // 2. Retrieval (Read)
    console.log('2. Attempting to retrieve test customer...');
    const retrieved = await prisma.customer.findUnique({
      where: { customerId: 'TEST-VERIFY-001' }
    });
    
    if (retrieved && retrieved.age === 99) {
      console.log('✅ Successfully retrieved test customer.');
    } else {
      throw new Error('Retrieved customer does not match expected data.');
    }

    // 3. Deletion (Delete)
    console.log('3. Attempting to delete test customer...');
    await prisma.customer.delete({
      where: { customerId: 'TEST-VERIFY-001' }
    });
    console.log('✅ Successfully deleted test customer.');

    console.log('--- Database Verification: PASS ---');
  } catch (error) {
    console.error('❌ Database Verification: FAIL');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
