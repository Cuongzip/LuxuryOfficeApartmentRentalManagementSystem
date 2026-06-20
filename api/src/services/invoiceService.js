import prisma from "../config/database.js";
import { AppError, generateId } from "../utils/index.js";
import { ID_PREFIXES, CONTRACT_STATUS, PAYMENT_STATUS, ROLES } from "../constants/index.js";

const getOrCreateStandardServices = async () => {
  let electricService = await prisma.service.findFirst({
    where: { name: "Điện" },
  });
  if (!electricService) {
    electricService = await prisma.service.create({
      data: {
        id: generateId(ID_PREFIXES.SERVICE),
        name: "Điện",
        unit: "kWh",
        currentPrice: 4000,
      },
    });
  }

  let waterService = await prisma.service.findFirst({
    where: { name: "Nước" },
  });
  if (!waterService) {
    waterService = await prisma.service.create({
      data: {
        id: generateId(ID_PREFIXES.SERVICE),
        name: "Nước",
        unit: "m3",
        currentPrice: 18000,
      },
    });
  }

  let rentService = await prisma.service.findFirst({
    where: { name: "Tiền thuê phòng" },
  });
  if (!rentService) {
    rentService = await prisma.service.create({
      data: {
        id: generateId(ID_PREFIXES.SERVICE),
        name: "Tiền thuê phòng",
        unit: "Tháng",
        currentPrice: 0,
      },
    });
  }

  return { electricService, waterService, rentService };
};

export const getInvoices = async ({
  page = 1,
  limit = 10,
  status,
  month,
  year,
  keyword,
  contractId,
}, user) => {
  const where = {};

  if (contractId) {
    where.contractId = contractId;
  }

  if (user.role === ROLES.CUSTOMER) {
    const customer = await prisma.customer.findUnique({
      where: { accountId: user.id },
    });
    if (!customer) {
      return {
        data: [],
        pagination: { page: 1, limit, total: 0, pages: 0 },
      };
    }
    where.contract = { customerId: customer.id };
  }

  if (status) {
    where.paymentStatus = status;
  }
  if (month) {
    where.paymentMonth = parseInt(month, 10);
  }
  if (year) {
    where.paymentYear = parseInt(year, 10);
  }

  if (keyword && keyword.trim() !== "") {
    const kw = keyword.trim();
    where.OR = [
      { id: { contains: kw } },
      {
        contract: {
          customer: {
            fullName: { contains: kw },
          },
        },
      },
      {
        contract: {
          contractDetails: {
            some: {
              room: {
                roomNumber: { contains: kw },
              },
            },
          },
        },
      },
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      include: {
        contract: {
          include: {
            customer: true,
            contractDetails: {
              include: {
                room: {
                  include: {
                    building: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  return {
    data: invoices,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
};

export const getInvoiceById = async (id, user) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      contract: {
        include: {
          customer: true,
          employee: true,
          contractDetails: {
            include: {
              room: {
                include: {
                  building: true,
                },
              },
            },
          },
        },
      },
      payments: {
        orderBy: { paymentDate: "desc" },
      },
      invoiceDetails: {
        include: {
          service: true,
        },
      },
    },
  });

  if (!invoice) {
    throw new AppError("Hóa đơn không tồn tại", 404);
  }

  if (user.role === ROLES.CUSTOMER) {
    const customer = await prisma.customer.findUnique({
      where: { accountId: user.id },
    });
    if (!customer || invoice.contract.customerId !== customer.id) {
      throw new AppError("Bạn không có quyền truy cập hóa đơn này", 403);
    }
  }

  return invoice;
};

export const createInvoice = async ({
  contractId,
  month,
  year,
  dueDate,
  roomReadings,
}) => {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      contractDetails: {
        include: {
          room: true,
        },
      },
    },
  });

  if (!contract) {
    throw new AppError("Hợp đồng không tồn tại", 404);
  }

  if (contract.status !== CONTRACT_STATUS.ACTIVE) {
    throw new AppError(`Hợp đồng không khả dụng (Trạng thái: ${contract.status})`, 400);
  }

  const billingMonthStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const billingMonthEnd = new Date(year, month, 0, 23, 59, 59, 999);

  let hasValidLease = false;
  for (const detail of contract.contractDetails) {
    const sDate = new Date(detail.startDate);
    const eDate = new Date(detail.endDate);

    if (sDate <= billingMonthEnd && eDate >= billingMonthStart) {
      hasValidLease = true;
      break;
    }
  }

  if (!hasValidLease) {
    throw new AppError(
      `Kỳ thanh toán ${month}/${year} không nằm trong thời hạn thuê của bất kỳ phòng nào trong hợp đồng này!`,
      400
    );
  }

  const existingInvoice = await prisma.invoice.findFirst({
    where: {
      contractId,
      paymentMonth: month,
      paymentYear: year,
    },
  });

  if (existingInvoice) {
    throw new AppError(`Hóa đơn của kỳ thanh toán ${month}/${year} đã tồn tại cho hợp đồng này.`, 400);
  }

  const { electricService, waterService, rentService } = await getOrCreateStandardServices();

  const detailsToCreate = [];
  let calculatedTotal = 0;

  for (const detail of contract.contractDetails) {
    const roomId = detail.roomId;
    const reading = roomReadings.find((r) => r.roomId === roomId);

    if (!reading) {
      throw new AppError(`Vui lòng cung cấp chỉ số điện nước cho phòng ${detail.room?.roomNumber || roomId}`, 400);
    }

    const { electricityIndex, waterIndex } = reading;

    const rentAmount = Number(detail.agreedPrice);
    detailsToCreate.push({
      contractId,
      roomId,
      serviceId: rentService.id,
      oldIndex: null,
      newIndex: null,
      quantity: 1,
      unitPrice: rentAmount,
    });
    calculatedTotal += rentAmount;

    const lastElectricDetail = await prisma.invoiceDetail.findFirst({
      where: {
        contractId,
        roomId,
        serviceId: electricService.id,
      },
      orderBy: {
        invoice: {
          createdAt: "desc",
        },
      },
    });

    const oldElectricIndex = lastElectricDetail ? lastElectricDetail.newIndex : 0;
    if (electricityIndex < oldElectricIndex) {
      throw new AppError(
        `Chỉ số điện mới (${electricityIndex}) không được nhỏ hơn chỉ số cũ (${oldElectricIndex}) cho phòng ${detail.room?.roomNumber || roomId}!`,
        400
      );
    }

    const electricQty = electricityIndex - oldElectricIndex;
    const electricPrice = Number(electricService.currentPrice);
    const electricAmount = electricQty * electricPrice;

    detailsToCreate.push({
      contractId,
      roomId,
      serviceId: electricService.id,
      oldIndex: oldElectricIndex,
      newIndex: electricityIndex,
      quantity: electricQty,
      unitPrice: electricPrice,
    });
    calculatedTotal += electricAmount;

    const lastWaterDetail = await prisma.invoiceDetail.findFirst({
      where: {
        contractId,
        roomId,
        serviceId: waterService.id,
      },
      orderBy: {
        invoice: {
          createdAt: "desc",
        },
      },
    });

    const oldWaterIndex = lastWaterDetail ? lastWaterDetail.newIndex : 0;
    if (waterIndex < oldWaterIndex) {
      throw new AppError(
        `Chỉ số nước mới (${waterIndex}) không được nhỏ hơn chỉ số cũ (${oldWaterIndex}) cho phòng ${detail.room?.roomNumber || roomId}!`,
        400
      );
    }

    const waterQty = waterIndex - oldWaterIndex;
    const waterPrice = Number(waterService.currentPrice);
    const waterAmount = waterQty * waterPrice;

    detailsToCreate.push({
      contractId,
      roomId,
      serviceId: waterService.id,
      oldIndex: oldWaterIndex,
      newIndex: waterIndex,
      quantity: waterQty,
      unitPrice: waterPrice,
    });
    calculatedTotal += waterAmount;

    const activeRoomServices = await prisma.roomService.findMany({
      where: {
        contractId,
        roomId,
        startDate: { lte: new Date() },
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } },
        ],
      },
      include: {
        service: true,
      },
    });

    for (const rs of activeRoomServices) {
      if (rs.service.name === "Điện" || rs.service.name === "Nước" || rs.service.name === "Tiền thuê phòng") {
        continue;
      }

      const svcPrice = Number(rs.service.currentPrice);
      const svcAmount = rs.quantity * svcPrice;

      detailsToCreate.push({
        contractId,
        roomId,
        serviceId: rs.serviceId,
        oldIndex: null,
        newIndex: null,
        quantity: rs.quantity,
        unitPrice: svcPrice,
      });
      calculatedTotal += svcAmount;
    }
  }

  const invoiceId = generateId(ID_PREFIXES.INVOICE);
  const resolvedDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const newInvoice = await prisma.$transaction(async (tx) => {
    const inv = await tx.invoice.create({
      data: {
        id: invoiceId,
        contractId,
        paymentMonth: month,
        paymentYear: year,
        dueDate: resolvedDueDate,
        paymentStatus: PAYMENT_STATUS.UNPAID,
        totalAmount: calculatedTotal,
      },
    });

    for (const d of detailsToCreate) {
      await tx.invoiceDetail.create({
        data: {
          invoiceId: inv.id,
          contractId: d.contractId,
          roomId: d.roomId,
          serviceId: d.serviceId,
          oldIndex: d.oldIndex,
          newIndex: d.newIndex,
          quantity: d.quantity,
          unitPrice: d.unitPrice,
        },
      });
    }

    return inv;
  });

  return newInvoice;
};

export const recordPayment = async (invoiceId, { amountPaid, paymentMethod, payerName, transactionId }) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      payments: true,
    },
  });

  if (!invoice) {
    throw new AppError("Hóa đơn không tồn tại", 404);
  }

  const totalAmount = Number(invoice.totalAmount);
  const totalPaidBefore = invoice.payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);
  const remainingDebt = totalAmount - totalPaidBefore;

  if (remainingDebt <= 0) {
    throw new AppError("Hóa đơn này đã được thanh toán đầy đủ", 400);
  }

  const amountToPay = Number(amountPaid);
  if (amountToPay <= 0) {
    throw new AppError("Số tiền thanh toán phải lớn hơn 0", 400);
  }

  const paymentId = generateId(ID_PREFIXES.PAYMENT);
  const newTotalPaid = totalPaidBefore + amountToPay;
  const newDebt = totalAmount - newTotalPaid;

  let newStatus = PAYMENT_STATUS.PARTIALLY_PAID;
  if (newDebt <= 0) {
    newStatus = PAYMENT_STATUS.PAID;
  }

  const updatedInvoice = await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        id: paymentId,
        invoiceId,
        amountPaid: amountToPay,
        paymentMethod,
        payerName: payerName || null,
        transactionId: transactionId || null,
        paymentDate: new Date(),
      },
    });

    return tx.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentStatus: newStatus,
      },
      include: {
        payments: true,
      },
    });
  });

  return updatedInvoice;
};

export const submitPaymentRequest = async (
  invoiceId,
  { amountPaid, paymentMethod, payerName, transactionId },
  receiptFile,
  customerUserId
) => {
  const customer = await prisma.customer.findUnique({
    where: { accountId: customerUserId },
  });

  if (!customer) {
    throw new AppError("Khách hàng không tồn tại hoặc tài khoản không hợp lệ", 404);
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      contract: true,
      payments: true,
    },
  });

  if (!invoice) {
    throw new AppError("Hóa đơn không tồn tại", 404);
  }

  if (invoice.contract.customerId !== customer.id) {
    throw new AppError("Bạn không có quyền thanh toán hóa đơn này", 403);
  }

  const totalAmount = Number(invoice.totalAmount);
  const totalPaidBefore = invoice.payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);
  const remainingDebt = totalAmount - totalPaidBefore;

  if (remainingDebt <= 0) {
    throw new AppError("Hóa đơn này đã được thanh toán đầy đủ", 400);
  }

  if (invoice.paymentStatus === PAYMENT_STATUS.PENDING_CONFIRMATION) {
    throw new AppError("Hóa đơn này đang có yêu cầu thanh toán chờ xác nhận", 400);
  }

  const paymentId = generateId(ID_PREFIXES.PAYMENT);
  const resolvedTransactionId = transactionId || (receiptFile ? `/static/uploads/${receiptFile.filename}` : null);

  const updatedInvoice = await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        id: paymentId,
        invoiceId,
        amountPaid: Number(amountPaid),
        paymentMethod,
        payerName: payerName || customer.fullName,
        transactionId: resolvedTransactionId,
        paymentDate: new Date(),
      },
    });

    return tx.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentStatus: PAYMENT_STATUS.PENDING_CONFIRMATION,
      },
      include: {
        payments: true,
      },
    });
  });

  return updatedInvoice;
};
