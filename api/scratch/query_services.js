import prisma from "../src/config/database.js";

async function main() {
  try {
    const buildingsCount = await prisma.building.count();
    const roomsCount = await prisma.room.count();
    const customersCount = await prisma.customer.count();
    const employeesCount = await prisma.employee.count();
    const contractsCount = await prisma.contract.count();
    const servicesCount = await prisma.service.count();
    const invoicesCount = await prisma.invoice.count();
    
    console.log({
      buildingsCount,
      roomsCount,
      customersCount,
      employeesCount,
      contractsCount,
      servicesCount,
      invoicesCount
    });

    if (contractsCount > 0) {
      const sampleContract = await prisma.contract.findFirst({
        include: {
          contractDetails: true,
          customer: true
        }
      });
      console.log("Sample contract details:", JSON.stringify(sampleContract, null, 2));
    }
  } catch (error) {
    console.error("Error querying db stats:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
