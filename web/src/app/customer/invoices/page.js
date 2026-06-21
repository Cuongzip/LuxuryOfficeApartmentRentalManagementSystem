'use client';

import React, { useEffect, useState } from 'react';
import { invoiceService } from '@/services/invoice.service';
import { Table } from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format';
import { PAYMENT_STATUS, PAYMENT_STATUS_COLORS } from '@/constants/invoices';
import toast from 'react-hot-toast';

export default function CustomerInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amountPaid: '',
    paymentMethod: 'Chuyển khoản',
    payerName: '',
    receiptFile: null,
  });
  const [paymentErrors, setPaymentErrors] = useState({});

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const res = await invoiceService.getInvoices({
        status: statusFilter || undefined,
        month: monthFilter || undefined,
        year: yearFilter || undefined,
        limit: 1000,
      });
      setInvoices(res?.data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Lỗi khi tải danh sách hóa đơn.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, monthFilter, yearFilter]);

  const handleViewDetails = async (invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailsOpen(true);
    setIsDetailsLoading(true);
    try {
      const detailed = await invoiceService.getInvoiceById(invoice.id);
      setSelectedInvoice(detailed);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      toast.error('Lỗi khi tải chi tiết hóa đơn.');
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleOpenPayment = (invoice, e) => {
    if (e) e.stopPropagation();

    const unpaidAmount = getRemainingBalance(invoice);
    setSelectedInvoice(invoice);
    setPaymentForm({
      amountPaid: unpaidAmount.toString(),
      paymentMethod: 'Chuyển khoản',
      payerName: user?.fullName || '',
      receiptFile: null,
    });
    setPaymentErrors({});
    setIsPaymentOpen(true);
  };

  const getRemainingBalance = (invoice) => {
    if (!invoice) return 0;
    const total = Number(invoice.totalAmount) || 0;
    const paid = (invoice.payments || []).reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
    return Math.max(total - paid, 0);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setPaymentErrors(prev => ({ ...prev, receiptFile: 'Biên lai phải là một file hình ảnh (jpg, png,...)!' }));
        return;
      }
      setPaymentForm(prev => ({ ...prev, receiptFile: file }));
      setPaymentErrors(prev => ({ ...prev, receiptFile: null }));
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    const remaining = getRemainingBalance(selectedInvoice);
    const amountVal = Number(paymentForm.amountPaid);

    // Validations
    const errors = {};
    if (!paymentForm.amountPaid || isNaN(amountVal) || amountVal <= 0) {
      errors.amountPaid = 'Số tiền thanh toán phải lớn hơn 0';
    } else if (amountVal > remaining) {
      errors.amountPaid = `Số tiền không được lớn hơn dư nợ còn lại (${formatCurrency(remaining)})`;
    }

    if (!paymentForm.payerName.trim()) {
      errors.payerName = 'Vui lòng nhập họ tên người thanh toán';
    }

    if (!paymentForm.receiptFile) {
      errors.receiptFile = 'Vui lòng đính kèm hình ảnh biên lai/minh chứng chuyển khoản';
    }

    if (Object.keys(errors).length > 0) {
      setPaymentErrors(errors);
      return;
    }

    setIsSubmittingPayment(true);
    try {
      const formData = new FormData();
      formData.append('amountPaid', amountVal);
      formData.append('paymentMethod', paymentForm.paymentMethod);
      formData.append('payerName', paymentForm.payerName.trim());
      formData.append('receipt', paymentForm.receiptFile);

      await invoiceService.submitPaymentRequest(selectedInvoice.id, formData);
      toast.success('Gửi minh chứng thanh toán thành công! Chờ xác nhận từ Ban quản lý.');
      setIsPaymentOpen(false);
      fetchInvoices();

      // Close details modal if it was open in the background
      setIsDetailsOpen(false);
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error(error.message || 'Lỗi khi gửi yêu cầu thanh toán.');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const columns = [
    {
      header: 'Kỳ hóa đơn',
      key: 'billingCycle',
      render: (inv) => <span className="font-bold text-neutral-900">Tháng {inv.paymentMonth}/{inv.paymentYear}</span>,
    },
    {
      header: 'Mã hóa đơn',
      key: 'id',
      render: (inv) => <span className="text-neutral-500 font-medium">{inv.id}</span>,
    },
    {
      header: 'Hạn thanh toán',
      key: 'dueDate',
      render: (inv) => formatDate(inv.dueDate),
    },
    {
      header: 'Tổng tiền',
      key: 'totalAmount',
      render: (inv) => <span className="font-semibold text-neutral-900">{formatCurrency(inv.totalAmount)}</span>,
    },
    {
      header: 'Dư nợ',
      key: 'debt',
      render: (inv) => {
        const remaining = getRemainingBalance(inv);
        return <span className={`font-semibold ${remaining > 0 ? 'text-amber-600' : 'text-neutral-500'}`}>{formatCurrency(remaining)}</span>;
      },
    },
    {
      header: 'Trạng thái',
      key: 'paymentStatus',
      render: (inv) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${PAYMENT_STATUS_COLORS[inv.paymentStatus] || 'bg-neutral-100 text-neutral-800'}`}>
          {inv.paymentStatus}
        </span>
      ),
    },
    {
      header: 'Thao tác',
      key: 'action',
      render: (inv) => {
        const remaining = getRemainingBalance(inv);
        const showPayBtn = remaining > 0 && inv.paymentStatus !== PAYMENT_STATUS.PENDING_CONFIRMATION;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewDetails(inv)}
              className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-neutral-200/50 shadow-xs"
            >
              Chi tiết
            </button>
            {showPayBtn && (
              <button
                onClick={(e) => handleOpenPayment(inv, e)}
                className="px-3.5 py-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Thanh toán
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Hóa đơn dịch vụ</h2>
        <p className="text-neutral-500 text-xs mt-1">
          Theo dõi các hóa đơn thuê phòng, chỉ số sử dụng điện nước hàng tháng và thực hiện thanh toán trực tuyến.
        </p>
      </div>

      <Card className="p-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${statusFilter === ''
                ? 'bg-brand text-white border-brand'
                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                }`}
            >
              Tất cả
            </button>
            {Object.values(PAYMENT_STATUS).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${statusFilter === status
                  ? 'bg-brand text-white border-brand'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Month Filter */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-neutral-500 font-semibold uppercase">Tháng</label>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-neutral-200 rounded-lg bg-white text-neutral-800 focus:outline-none"
              >
                <option value="">Tất cả</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>Tháng {m}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-neutral-500 font-semibold uppercase">Năm</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-neutral-200 rounded-lg bg-white text-neutral-800 focus:outline-none"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <Table
          columns={columns}
          data={invoices}
          isLoading={isLoading}
          onRowClick={handleViewDetails}
          emptyMessage="Không tìm thấy hóa đơn nào phù hợp với bộ lọc."
        />
      </Card>

      {/* Invoice Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedInvoice(null);
        }}
        title="Chi tiết hóa đơn dịch vụ"
        className="!max-w-3xl"
      >
        {isDetailsLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-2">
            <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-neutral-500">Đang tải chi tiết hóa đơn...</p>
          </div>
        ) : selectedInvoice ? (
          <div className="space-y-5 text-neutral-900 text-left max-h-[78vh] overflow-y-auto pr-1">
            {/* Header info */}
            <div className="grid grid-cols-2 gap-4 border-b border-neutral-150 pb-4">
              <div>
                <span className="block text-xs text-neutral-400 font-bold uppercase tracking-wider">Mã hóa đơn:</span>
                <span className="font-extrabold text-neutral-950 text-base">{selectedInvoice.id}</span>
              </div>
              <div>
                <span className="block text-xs text-neutral-400 font-bold uppercase tracking-wider">Trạng thái:</span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border mt-1 ${PAYMENT_STATUS_COLORS[selectedInvoice.paymentStatus] || 'bg-neutral-100 text-neutral-800'
                  }`}>
                  {selectedInvoice.paymentStatus}
                </span>
              </div>
            </div>

            {/* Main Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Customer details */}
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-2">
                <h4 className="font-bold text-neutral-800 uppercase tracking-wide border-b border-slate-200 pb-1">
                  Thông tin khách hàng
                </h4>
                <div className="space-y-1">
                  <p><span className="text-neutral-400">Họ tên:</span> <strong className="text-neutral-800">{selectedInvoice.contract?.customer?.fullName}</strong></p>
                  <p><span className="text-neutral-400">Số điện thoại:</span> <strong className="text-neutral-800">{selectedInvoice.contract?.customer?.phoneNumber}</strong></p>
                </div>
              </div>

              {/* Lease terms */}
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-2">
                <h4 className="font-bold text-neutral-800 uppercase tracking-wide border-b border-slate-200 pb-1">
                  Hợp đồng & Kỳ thanh toán
                </h4>
                <div className="space-y-1">
                  <p><span className="text-neutral-400">Mã hợp đồng:</span> <strong className="text-neutral-800">{selectedInvoice.contractId}</strong></p>
                  <p><span className="text-neutral-400">Kỳ thanh toán:</span> <strong className="text-neutral-800">Tháng {selectedInvoice.paymentMonth}/{selectedInvoice.paymentYear}</strong></p>
                  <p><span className="text-neutral-400">Hạn nộp:</span> <strong className="text-red-600">{formatDate(selectedInvoice.dueDate)}</strong></p>
                </div>
              </div>
            </div>

            {/* Line Items breakdown list */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-neutral-800 uppercase tracking-wide border-b border-slate-100 pb-1">
                Chi tiết phí dịch vụ
              </h4>

              <div className="border border-neutral-200 rounded-xl overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse min-w-[650px]">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 font-semibold text-neutral-600 whitespace-nowrap">
                      <th className="px-4 py-2.5">Tên phí / Dịch vụ</th>
                      <th className="px-4 py-2.5">Phòng</th>
                      <th className="px-4 py-2.5 text-right">Chỉ số cũ/mới</th>
                      <th className="px-4 py-2.5 text-right">Số lượng</th>
                      <th className="px-4 py-2.5 text-right">Đơn giá</th>
                      <th className="px-4 py-2.5 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {selectedInvoice.invoiceDetails?.map((detail, index) => {
                      const isIndexService = detail.service?.name === 'Điện' || detail.service?.name === 'Nước';
                      const roomLabel = selectedInvoice.contract?.contractDetails?.find(cd => cd.roomId === detail.roomId)?.room?.roomNumber || detail.roomId;

                      return (
                        <tr key={index} className="hover:bg-neutral-50/40">
                          <td className="px-4 py-2.5 font-medium text-neutral-800">
                            {detail.service?.name}
                          </td>
                          <td className="px-4 py-2.5 text-neutral-600">
                            Phòng {roomLabel}
                          </td>
                          <td className="px-4 py-2.5 text-right text-neutral-600 font-mono">
                            {isIndexService ? `${detail.oldIndex} → ${detail.newIndex}` : '-'}
                          </td>
                          <td className="px-4 py-2.5 text-right text-neutral-800 font-medium">
                            {detail.quantity} {detail.service?.unit}
                          </td>
                          <td className="px-4 py-2.5 text-right text-neutral-600">
                            {formatCurrency(detail.unitPrice)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-bold text-neutral-900">
                            {formatCurrency(Number(detail.quantity) * Number(detail.unitPrice))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Amount details */}
            <div className="flex justify-end">
              <div className="w-80 space-y-2 border border-slate-100 p-4 rounded-xl bg-slate-50/50 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Tổng tiền hóa đơn:</span>
                  <strong className="text-neutral-900 font-bold text-sm">{formatCurrency(selectedInvoice.totalAmount)}</strong>
                </div>
                {(() => {
                  const totalPaid = (selectedInvoice.payments || []).reduce((sum, p) => sum + Number(p.amountPaid), 0);
                  const debt = Math.max(0, Number(selectedInvoice.totalAmount) - totalPaid);
                  return (
                    <>
                      <div className="flex justify-between border-b border-neutral-200 pb-2">
                        <span className="text-neutral-500 font-medium">Đã thanh toán:</span>
                        <strong className="text-emerald-700 font-bold">{formatCurrency(totalPaid)}</strong>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-neutral-500 font-semibold">Còn lại cần thanh toán:</span>
                        <strong className="text-red-600 font-extrabold text-sm">{formatCurrency(debt)}</strong>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Payment History Section */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-neutral-800 uppercase tracking-wide border-b border-slate-100 pb-1">
                Lịch sử thanh toán giao dịch
              </h4>
              {(!selectedInvoice.payments || selectedInvoice.payments.length === 0) ? (
                <p className="text-xs text-neutral-400 italic">Chưa có giao dịch thanh toán nào được ghi nhận cho hóa đơn này.</p>
              ) : (
                <div className="border border-neutral-200 rounded-xl overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse min-w-[650px]">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 font-semibold text-neutral-600 whitespace-nowrap">
                        <th className="px-4 py-2.5">Thời gian</th>
                        <th className="px-4 py-2.5">Người nộp</th>
                        <th className="px-4 py-2.5">Phương thức</th>
                        <th className="px-4 py-2.5">Mã giao dịch / Biên lai</th>
                        <th className="px-4 py-2.5 text-right">Số tiền nộp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {selectedInvoice.payments.map((p, pIdx) => {
                        const isReceiptLink = p.transactionId && (p.transactionId.startsWith('http') || p.transactionId.startsWith('/'));
                        const receiptUrl = isReceiptLink
                          ? (p.transactionId.startsWith('http')
                            ? p.transactionId
                            : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:3000'}${p.transactionId}`)
                          : null;

                        return (
                          <tr key={p.id || pIdx} className="hover:bg-neutral-50/40">
                            <td className="px-4 py-2.5 text-neutral-600 font-mono">
                              {formatDateTime(p.paymentDate)}
                            </td>
                            <td className="px-4 py-2.5 font-medium text-neutral-800">
                              {p.payerName || 'N/A'}
                            </td>
                            <td className="px-4 py-2.5 text-neutral-700">
                              {p.paymentMethod}
                            </td>
                            <td className="px-4 py-2.5 text-neutral-600">
                              {receiptUrl ? (
                                <a
                                  href={receiptUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-brand hover:underline font-bold inline-flex items-center gap-1"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  Xem ảnh biên lai
                                </a>
                              ) : (
                                p.transactionId || '-'
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-right font-bold text-emerald-700">
                              {formatCurrency(p.amountPaid)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pending Confirmation Alert Box */}
            {selectedInvoice.paymentStatus === PAYMENT_STATUS.PENDING_CONFIRMATION && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-xs text-left">
                  <strong className="text-amber-950 font-bold block text-sm">Giao dịch đang chờ xác nhận</strong>
                  <p className="text-amber-800 mt-1 leading-relaxed">
                    Minh chứng thanh toán của bạn đã được tải lên thành công và đang được Ban quản lý đối soát. Hóa đơn sẽ được cập nhật trạng thái ngay sau khi giao dịch được xác nhận.
                  </p>
                </div>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="flex justify-end gap-2.5 pt-4 border-t border-neutral-100">
              {getRemainingBalance(selectedInvoice) > 0 && selectedInvoice.paymentStatus !== PAYMENT_STATUS.PENDING_CONFIRMATION && (
                <Button
                  variant="primary"
                  onClick={() => handleOpenPayment(selectedInvoice)}
                >
                  Thanh toán ngay
                </Button>
              )}
              <Button variant="outline" onClick={() => {
                setIsDetailsOpen(false);
                setSelectedInvoice(null);
              }}>
                Đóng
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Submit Payment Proof Modal */}
      <Modal
        isOpen={isPaymentOpen}
        onClose={() => {
          if (!isSubmittingPayment) setIsPaymentOpen(false);
        }}
        title="Gửi minh chứng thanh toán"
        size="md"
      >
        {selectedInvoice && (
          <form onSubmit={handleSubmitPayment} className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200/50 rounded-xl space-y-2 text-xs">
              <p className="text-neutral-700">
                Bạn đang gửi minh chứng thanh toán cho hóa đơn kỳ: <strong>Tháng {selectedInvoice.paymentMonth}/{selectedInvoice.paymentYear}</strong>
              </p>
              <div className="flex justify-between items-center text-neutral-700 pt-1 border-t border-amber-200/30">
                <span>Dư nợ cần thanh toán:</span>
                <strong className="text-amber-800 text-sm">{formatCurrency(getRemainingBalance(selectedInvoice))}</strong>
              </div>
            </div>

            <div className="space-y-3.5">
              {/* Amount Paid input */}
              <Input
                label="Số tiền thanh toán (VNĐ)"
                id="amountPaid"
                type="number"
                value={paymentForm.amountPaid}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, amountPaid: e.target.value }))}
                error={paymentErrors.amountPaid}
                placeholder="Nhập số tiền chuyển khoản..."
                required
              />

              {/* Payer Name input */}
              <Input
                label="Họ tên người thanh toán"
                id="payerName"
                value={paymentForm.payerName}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, payerName: e.target.value }))}
                error={paymentErrors.payerName}
                placeholder="Tên người chuyển khoản..."
                required
              />

              {/* Payment Method dropdown (styled manually as input is basic text field) */}
              <div className="flex flex-col gap-1.5 text-xs text-left">
                <label htmlFor="paymentMethod" className="font-semibold text-neutral-500 uppercase tracking-wider">
                  Phương thức thanh toán
                </label>
                <select
                  id="paymentMethod"
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full px-4 py-3 text-neutral-800 bg-white border border-neutral-200 rounded-xl focus:outline-none text-xs"
                >
                  <option value="Chuyển khoản">Chuyển khoản ngân hàng</option>
                  <option value="Tiền mặt">Tiền mặt</option>
                  <option value="Ví điện tử">Ví điện tử</option>
                </select>
              </div>

              {/* Receipt File input */}
              <div className="flex flex-col gap-1.5 text-xs text-left">
                <label className="font-semibold text-neutral-500 uppercase tracking-wider">
                  Đính kèm biên lai chuyển khoản (Ảnh chụp)
                </label>
                <div className="relative flex items-center justify-center border-2 border-dashed border-neutral-200 rounded-xl p-6 hover:bg-neutral-50/50 cursor-pointer transition-colors bg-white">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="text-center space-y-1">
                    <svg className="w-8 h-8 text-neutral-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.9 2.9m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <p className="text-xs text-neutral-500 font-medium">
                      {paymentForm.receiptFile ? (
                        <span className="text-brand font-bold">{paymentForm.receiptFile.name}</span>
                      ) : (
                        <span>Nhấp để tải lên hoặc kéo thả tệp hình ảnh vào đây</span>
                      )}
                    </p>
                    <p className="text-[10px] text-neutral-400">Hỗ trợ các định dạng ảnh: PNG, JPG, JPEG, WEBP</p>
                  </div>
                </div>
                {paymentErrors.receiptFile && (
                  <p className="text-xs text-red-500 mt-1 font-semibold">{paymentErrors.receiptFile}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
              <button
                type="button"
                disabled={isSubmittingPayment}
                onClick={() => setIsPaymentOpen(false)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmittingPayment}
                className="px-5 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                {isSubmittingPayment ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang gửi...
                  </>
                ) : (
                  'Gửi yêu cầu xác nhận'
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
