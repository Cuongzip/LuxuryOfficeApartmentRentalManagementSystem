import prisma from "../src/config/database.js";
import * as invoiceService from "../src/services/invoiceService.js";
import { PAYMENT_STATUS } from "../src/constants/index.js";

async function runTests() {
  console.log("--- Starting Invoices & Payments Integration Tests ---");
  const contractId = "HDCCNNYXAU";
  const month = 6;
  const year = 2026;

  try {
    // 0. Clean up any existing invoice for month=6, year=2026 to ensure repeatability
    console.log("Cleaning up previous test data if any...");
    const oldInvoice = await prisma.invoice.findFirst({
      where: { contractId, paymentMonth: month, paymentYear: year },
    });
    if (oldInvoice) {
      await prisma.payment.deleteMany({ where: { invoiceId: oldInvoice.id } });
      await prisma.invoiceDetail.deleteMany({ where: { invoiceId: oldInvoice.id } });
      await prisma.invoice.delete({ where: { id: oldInvoice.id } });
      console.log("Deleted old invoice", oldInvoice.id);
    }

    // 1. Create Invoice
    console.log("\n1. Testing invoice creation...");
    const roomReadings = [
      { roomId: "PX69AUJ0B", electricityIndex: 120, waterIndex: 15 },
      { roomId: "PX69AUJ0X", electricityIndex: 210, waterIndex: 28 },
    ];

    const invoice = await invoiceService.createInvoice({
      contractId,
      month,
      year,
      roomReadings,
    });

    console.log("Invoice created successfully. ID:", invoice.id);
    console.log("Invoice Total Amount:", Number(invoice.totalAmount));
    console.log("Expected Total Amount: 8093998");

    if (Number(invoice.totalAmount) !== 8093998) {
      throw new Error(`Total amount mismatch! Got ${invoice.totalAmount}, expected 8093998`);
    }
    console.log("✅ Invoice creation test passed.");

    // 2. Prevent duplicate invoicing
    console.log("\n2. Testing duplicate invoice prevention...");
    try {
      await invoiceService.createInvoice({
        contractId,
        month,
        year,
        roomReadings,
      });
      throw new Error("Duplicate invoice created but should have failed!");
    } catch (error) {
      if (error.statusCode === 400 && error.message.includes("đã tồn tại")) {
        console.log("✅ Duplicate prevention test passed (failed correctly with:", error.message, ")");
      } else {
        throw error;
      }
    }

    // 3. Test index ordering constraint
    console.log("\n3. Testing index ordering validation...");
    try {
      // Create invoice for month=7, year=2026 with smaller electricity reading
      const smallerReadings = [
        { roomId: "PX69AUJ0B", electricityIndex: 50, waterIndex: 15 }, // 50 is less than 120
        { roomId: "PX69AUJ0X", electricityIndex: 210, waterIndex: 28 },
      ];
      await invoiceService.createInvoice({
        contractId,
        month: 7,
        year: 2026,
        roomReadings: smallerReadings,
      });
      throw new Error("Invoice created with smaller index than previous but should have failed!");
    } catch (error) {
      if (error.statusCode === 400 && error.message.includes("không được nhỏ hơn chỉ số cũ")) {
        console.log("✅ Index ordering validation test passed (failed correctly with:", error.message, ")");
      } else {
        throw error;
      }
    }

    // 4. Submit Payment Request (Customer)
    console.log("\n4. Testing customer payment request...");
    // Customer account: TK8O8RZ89U
    const submitRes = await invoiceService.submitPaymentRequest(
      invoice.id,
      {
        amountPaid: 4000000,
        paymentMethod: "Chuyển khoản",
        transactionId: "TX123456",
        payerName: "Cuong Huynh",
      },
      null, // No uploaded file mock
      "TK8O8RZ89U"
    );

    console.log("Submitted payment request. Status:", submitRes.paymentStatus);
    if (submitRes.paymentStatus !== PAYMENT_STATUS.PENDING_CONFIRMATION) {
      throw new Error(`Expected status to be ${PAYMENT_STATUS.PENDING_CONFIRMATION}, got ${submitRes.paymentStatus}`);
    }
    console.log("✅ Customer payment request test passed.");

    // 5. Reconcile / Record Payment (Staff)
    console.log("\n5. Testing manager recording payment...");
    // Remaining balance is 8093998 - 4000000 = 4093998
    const finalRes = await invoiceService.recordPayment(invoice.id, {
      amountPaid: 4093998,
      paymentMethod: "Chuyển khoản",
      payerName: "Cuong Huynh",
      transactionId: "TX654321",
    });

    console.log("Manager updated payment. Status:", finalRes.paymentStatus);
    if (finalRes.paymentStatus !== PAYMENT_STATUS.PAID) {
      throw new Error(`Expected status to be ${PAYMENT_STATUS.PAID}, got ${finalRes.paymentStatus}`);
    }
    console.log("✅ Manager payment recording test passed.");

    // 6. Clean up test data
    console.log("\nCleaning up test invoice & payment records...");
    await prisma.payment.deleteMany({ where: { invoiceId: invoice.id } });
    await prisma.invoiceDetail.deleteMany({ where: { invoiceId: invoice.id } });
    await prisma.invoice.delete({ where: { id: invoice.id } });
    console.log("Test data cleaned up successfully.");

    console.log("\n🎉 ALL TESTS COMPLETED SUCCESSFULLY! 🎉");
  } catch (error) {
    console.error("\n❌ Test Suite Failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
