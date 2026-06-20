'use client';

import React, { useEffect, useState, useRef } from 'react';
import { invoiceService } from '@/services/invoice.service';
import { contractService } from '@/services/contract.service';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate, formatDateInput } from '@/utils/format';
import { PAYMENT_STATUS, PAYMENT_STATUS_COLORS } from '@/constants/invoices';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const SearchableSelect = ({ label, id, value, onChange, options, placeholder, error, required, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    opt.value.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="flex flex-col gap-1.5 relative w-full" ref={containerRef}>
      <label className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-neutral-900 border-neutral-200 cursor-pointer flex items-center justify-between hover:border-neutral-300 transition-all ${
          disabled ? 'bg-neutral-50 text-neutral-400 cursor-not-allowed border-neutral-200' : ''
        } ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        }`}
      >
        <span className={selectedOption ? 'text-neutral-900 font-medium' : 'text-neutral-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg z-50 overflow-hidden flex flex-col max-h-60">
          <div className="p-2 border-b border-neutral-100 bg-neutral-50/50">
            <input
              type="text"
              placeholder="Gõ để tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-white text-neutral-800"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-neutral-50">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2.5 text-xs text-neutral-500 italic">Không tìm thấy kết quả</div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`px-3 py-2.5 text-xs cursor-pointer hover:bg-neutral-50 transition-colors flex items-center justify-between ${
                    opt.value === value ? 'bg-brand/5 text-brand font-bold' : 'text-neutral-700'
                  }`}
                >
                  <span>{opt.label}</span>
                  {opt.value === value && (
                    <svg className="w-3.5 h-3.5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
};

export default function InvoicesManagement() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [activeContracts, setActiveContracts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const [filters, setFilters] = useState({
    status: '',
    month: '',
    year: '',
    keyword: '',
    page: 1,
    limit: 10,
  });

  const [stats, setStats] = useState({
    total: 0,
    unpaid: 0,
    paid: 0,
    partiallyPaid: 0,
    pendingConfirm: 0,
  });

  // Modal control states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceDetailsData, setInvoiceDetailsData] = useState(null);

  // Form states for creating invoice
  const [createForm, setCreateForm] = useState({
    contractId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    dueDate: formatDateInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
  });
  const [selectedContractInfo, setSelectedContractInfo] = useState(null);
  const [roomReadings, setRoomReadings] = useState([]); // Array of { roomId, roomNumber, electricityIndex, waterIndex, oldElectricIndex, oldWaterIndex }
  const [createErrors, setCreateErrors] = useState({});

  // Form states for recording payment
  const [paymentForm, setPaymentForm] = useState({
    amountPaid: '',
    paymentMethod: 'Chuyển khoản',
    payerName: '',
    transactionId: '',
  });
  const [paymentErrors, setPaymentErrors] = useState({});

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const queryParams = {
        ...filters,
        status: filters.status || undefined,
        month: filters.month || undefined,
        year: filters.year || undefined,
        keyword: filters.keyword.trim() || undefined,
      };

      const result = await invoiceService.getInvoices(queryParams);
      if (result.success) {
        setInvoices(result.data || []);
        setPagination(result.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
      }

      // Fetch summary stats
      const allResult = await invoiceService.getInvoices({ limit: 10000 });
      if (allResult.success && allResult.data) {
        const list = allResult.data;
        let unpaid = 0;
        let paid = 0;
        let partiallyPaid = 0;
        let pendingConfirm = 0;

        list.forEach(inv => {
          if (inv.paymentStatus === PAYMENT_STATUS.UNPAID) unpaid++;
          else if (inv.paymentStatus === PAYMENT_STATUS.PAID) paid++;
          else if (inv.paymentStatus === PAYMENT_STATUS.PARTIALLY_PAID) partiallyPaid++;
          else if (inv.paymentStatus === PAYMENT_STATUS.PENDING_CONFIRMATION) pendingConfirm++;
        });

        setStats({
          total: list.length,
          unpaid,
          paid,
          partiallyPaid,
          pendingConfirm,
        });
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách hóa đơn:', err);
      toast.error('Không thể tải danh sách hóa đơn.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActiveContracts = async () => {
    try {
      const res = await contractService.getContracts({ status: 'Đang hiệu lực', limit: 1000 });
      if (res.success) {
        setActiveContracts(res.data || []);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách hợp đồng:', err);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchInvoices();
    });
  }, [filters]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchActiveContracts();
    });
  }, []);

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters(prev => ({ ...prev, [id]: value, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      month: '',
      year: '',
      keyword: '',
      page: 1,
      limit: 10,
    });
  };

  // View details handler
  const handleOpenDetail = async (invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailModalOpen(true);
    setInvoiceDetailsData(null);
    try {
      const detail = await invoiceService.getInvoiceById(invoice.id);
      setInvoiceDetailsData(detail);
    } catch (err) {
      console.error('Lỗi tải chi tiết hóa đơn:', err);
      toast.error('Không thể tải chi tiết hóa đơn.');
    }
  };

  // Re-fetch detail utility
  const refreshDetail = async (invoiceId) => {
    try {
      const detail = await invoiceService.getInvoiceById(invoiceId);
      setInvoiceDetailsData(detail);
      // Also update lists
      fetchInvoices();
    } catch (err) {
      console.error(err);
    }
  };

  // Open creation modal
  const handleOpenCreateModal = () => {
    setCreateForm({
      contractId: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      dueDate: formatDateInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    });
    setSelectedContractInfo(null);
    setRoomReadings([]);
    setCreateErrors({});
    setIsCreateModalOpen(true);
  };

  // On contract selection
  const handleContractSelect = async (contractId) => {
    setCreateForm(prev => ({ ...prev, contractId }));
    setCreateErrors(prev => ({ ...prev, contractId: null }));
    const contract = activeContracts.find(c => c.id === contractId);
    if (!contract) {
      setSelectedContractInfo(null);
      setRoomReadings([]);
      return;
    }

    setSelectedContractInfo(contract);

    // Fetch previous invoice detailed settings for contract to autofill previous indices
    toast.loading('Đang tải chỉ số điện nước cũ...', { id: 'fetch-readings' });
    try {
      const prevInvoicesRes = await invoiceService.getInvoices({ contractId: contractId, limit: 1 });
      let roomIndicesMap = {};

      if (prevInvoicesRes.success && prevInvoicesRes.data?.length > 0) {
        const lastInvoice = await invoiceService.getInvoiceById(prevInvoicesRes.data[0].id);
        if (lastInvoice && lastInvoice.invoiceDetails) {
          lastInvoice.invoiceDetails.forEach(detail => {
            if (!roomIndicesMap[detail.roomId]) {
              roomIndicesMap[detail.roomId] = { elec: 0, water: 0 };
            }
            if (detail.service?.name === 'Điện') {
              roomIndicesMap[detail.roomId].elec = detail.newIndex || 0;
            }
            if (detail.service?.name === 'Nước') {
              roomIndicesMap[detail.roomId].water = detail.newIndex || 0;
            }
          });
        }
      }

      // Map rooms and their old indices
      const readings = (contract.contractDetails || []).map(detail => {
        const oldElec = roomIndicesMap[detail.roomId]?.elec || 0;
        const oldWater = roomIndicesMap[detail.roomId]?.water || 0;
        return {
          roomId: detail.roomId,
          roomNumber: detail.room?.roomNumber || detail.roomId,
          oldElectricIndex: oldElec,
          oldWaterIndex: oldWater,
          electricityIndex: oldElec, // Default input to old value
          waterIndex: oldWater, // Default input to old value
        };
      });

      setRoomReadings(readings);
      toast.success('Đã tải chỉ số cũ.', { id: 'fetch-readings' });
    } catch (err) {
      console.error('Lỗi khi tải chỉ số cũ:', err);
      toast.error('Không thể tự động tải chỉ số cũ. Mặc định là 0.', { id: 'fetch-readings' });
      
      const readings = (contract.contractDetails || []).map(detail => ({
        roomId: detail.roomId,
        roomNumber: detail.room?.roomNumber || detail.roomId,
        oldElectricIndex: 0,
        oldWaterIndex: 0,
        electricityIndex: 0,
        waterIndex: 0,
      }));
      setRoomReadings(readings);
    }
  };

  const handleReadingChange = (roomId, field, val) => {
    setRoomReadings(prev =>
      prev.map(r => (r.roomId === roomId ? { ...r, [field]: val } : r))
    );
    // clear errors for this room
    if (createErrors[roomId]) {
      setCreateErrors(prev => ({ ...prev, [roomId]: null }));
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateErrors({});

    let errors = {};
    if (!createForm.contractId) {
      errors.contractId = 'Vui lòng chọn hợp đồng';
    }
    if (!createForm.dueDate) {
      errors.dueDate = 'Vui lòng chọn hạn thanh toán';
    }

    // Check if billing month overlaps with lease duration
    if (selectedContractInfo && selectedContractInfo.contractDetails) {
      const month = parseInt(createForm.month, 10);
      const year = parseInt(createForm.year, 10);
      const billingMonthStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const billingMonthEnd = new Date(year, month, 0, 23, 59, 59, 999);

      let hasValidLease = false;
      for (const detail of selectedContractInfo.contractDetails) {
        const sDate = new Date(detail.startDate);
        const eDate = new Date(detail.endDate);

        if (sDate <= billingMonthEnd && eDate >= billingMonthStart) {
          hasValidLease = true;
          break;
        }
      }

      if (!hasValidLease) {
        errors.month = `Kỳ thanh toán ${month}/${year} không nằm trong thời hạn thuê của hợp đồng này!`;
      }
    }

    // Validate room readings
    roomReadings.forEach(r => {
      const elecVal = parseFloat(r.electricityIndex);
      const waterVal = parseFloat(r.waterIndex);

      if (isNaN(elecVal) || elecVal < 0) {
        errors[r.roomId + '_elec'] = 'Chỉ số điện không hợp lệ';
      } else if (elecVal < r.oldElectricIndex) {
        errors[r.roomId + '_elec'] = `Chỉ số mới phải >= chỉ số cũ (${r.oldElectricIndex})`;
      }

      if (isNaN(waterVal) || waterVal < 0) {
        errors[r.roomId + '_water'] = 'Chỉ số nước không hợp lệ';
      } else if (waterVal < r.oldWaterIndex) {
        errors[r.roomId + '_water'] = `Chỉ số mới phải >= chỉ số cũ (${r.oldWaterIndex})`;
      }
    });

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      toast.error('Vui lòng kiểm tra lại thông tin nhập liệu');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        contractId: createForm.contractId,
        month: parseInt(createForm.month, 10),
        year: parseInt(createForm.year, 10),
        dueDate: new Date(createForm.dueDate),
        roomReadings: roomReadings.map(r => ({
          roomId: r.roomId,
          electricityIndex: parseInt(r.electricityIndex, 10),
          waterIndex: parseInt(r.waterIndex, 10),
        })),
      };

      await invoiceService.createInvoice(payload);
      toast.success('Lập hóa đơn thành công!');
      setIsCreateModalOpen(false);
      fetchInvoices();
    } catch (err) {
      toast.error(err.message || 'Lỗi lập hóa đơn.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open record payment modal
  const handleOpenPaymentModal = (invoice, prefilledAmount = null) => {
    setSelectedInvoice(invoice);
    
    // Calculate remaining balance
    const total = Number(invoice.totalAmount);
    const totalPaidBefore = (invoice.payments || []).reduce((sum, p) => sum + Number(p.amountPaid), 0);
    const balance = Math.max(0, total - totalPaidBefore);

    // Prefill name using customer details if present
    const customerName = invoice.contract?.customer?.fullName || '';

    setPaymentForm({
      amountPaid: prefilledAmount !== null ? prefilledAmount : balance,
      paymentMethod: 'Chuyển khoản',
      payerName: customerName,
      transactionId: '',
    });
    setPaymentErrors({});
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentErrors({});

    let errors = {};
    const amt = parseFloat(paymentForm.amountPaid);
    if (isNaN(amt) || amt <= 0) {
      errors.amountPaid = 'Số tiền nộp phải lớn hơn 0';
    }
    if (!paymentForm.paymentMethod) {
      errors.paymentMethod = 'Vui lòng chọn phương thức';
    }

    if (Object.keys(errors).length > 0) {
      setPaymentErrors(errors);
      return;
    }

    setIsSubmittingPayment(true);
    try {
      await invoiceService.recordPayment(selectedInvoice.id, {
        amountPaid: amt,
        paymentMethod: paymentForm.paymentMethod,
        payerName: paymentForm.payerName.trim() || undefined,
        transactionId: paymentForm.transactionId.trim() || undefined,
      });

      toast.success('Ghi nhận thanh toán thành công!');
      setIsPaymentModalOpen(false);
      fetchInvoices();
      if (isDetailModalOpen && selectedInvoice) {
        refreshDetail(selectedInvoice.id);
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi ghi nhận thanh toán.');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Helper lists for selects
  const contractOptions = activeContracts.map(c => ({
    value: c.id,
    label: `${c.customer?.fullName || 'Khách lẻ'} - Hợp đồng ${c.id} (${(c.contractDetails || []).map(cd => cd.room?.roomNumber).join(', ')})`,
  }));

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `Tháng ${i + 1}`,
  }));

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = new Date().getFullYear() - 2 + i;
    return { value: y, label: `Năm ${y}` };
  });

  const paymentMethods = ['Chuyển khoản', 'Tiền mặt', 'Thẻ tín dụng', 'Khác'];

  const columns = [
    {
      header: 'Mã Hóa Đơn',
      key: 'id',
      render: (inv) => <span className="font-bold text-neutral-900">{inv.id}</span>,
    },
    {
      header: 'Khách Hàng & Hợp Đồng',
      key: 'customer',
      render: (inv) => (
        <div className="space-y-0.5">
          <p className="font-bold text-neutral-900">{inv.contract?.customer?.fullName || '-'}</p>
          <p className="text-xs text-slate-500">Mã hợp đồng: {inv.contractId}</p>
        </div>
      ),
    },
    {
      header: 'Phòng',
      key: 'rooms',
      render: (inv) => {
        const details = inv.contract?.contractDetails || [];
        return (
          <span className="font-medium text-neutral-800">
            {details.map(d => `Phòng ${d.room?.roomNumber || d.roomId}`).join(', ')}
          </span>
        );
      },
    },
    {
      header: 'Kỳ Thanh Toán',
      key: 'period',
      render: (inv) => (
        <span className="font-medium text-neutral-800">
          Tháng {inv.paymentMonth}/{inv.paymentYear}
        </span>
      ),
    },
    {
      header: 'Tổng Tiền',
      key: 'totalAmount',
      render: (inv) => <span className="font-bold text-neutral-950">{formatCurrency(inv.totalAmount)}</span>,
    },
    {
      header: 'Ngày Hết Hạn',
      key: 'dueDate',
      render: (inv) => <span>{formatDate(inv.dueDate)}</span>,
    },
    {
      header: 'Trạng Thái',
      key: 'paymentStatus',
      render: (inv) => (
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap ${
          PAYMENT_STATUS_COLORS[inv.paymentStatus] || 'bg-neutral-100 text-neutral-800 border-neutral-200'
        }`}>
          {inv.paymentStatus}
        </span>
      ),
    },
    {
      header: 'Thao tác',
      key: 'actions',
      render: (inv) => {
        const isPaid = inv.paymentStatus === PAYMENT_STATUS.PAID;
        return (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenDetail(inv)}
            >
              Chi tiết
            </Button>
            {!isPaid && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenPaymentModal(inv)}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
              >
                Thanh toán
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Quản lý hóa đơn</h2>
          <p className="text-slate-500 text-sm mt-1">
            Lập hóa đơn tiền thuê phòng, phí dịch vụ hàng tháng và theo dõi công nợ thanh toán.
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} variant="primary">
          <svg className="w-5 h-5 -ml-1 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Lập hóa đơn mới
        </Button>
      </div>

      {/* Summary dashboard statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 bg-white border border-neutral-100 flex items-center gap-4">
          <div className="p-3 bg-neutral-50 border border-neutral-100 text-neutral-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Tổng hóa đơn</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.total}</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-neutral-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-xs text-amber-500 font-semibold uppercase tracking-wider">Chưa thanh toán</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.unpaid}</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-neutral-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-xs text-emerald-500 font-semibold uppercase tracking-wider">Đã thanh toán</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.paid}</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-neutral-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-xs text-blue-500 font-semibold uppercase tracking-wider">Thanh toán một phần</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.partiallyPaid}</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-neutral-100 flex items-center gap-4">
          <div className="p-3 bg-purple-50 border border-purple-100 text-purple-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-xs text-purple-500 font-semibold uppercase tracking-wider">Chờ xác nhận</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.pendingConfirm}</p>
          </div>
        </Card>
      </div>

      {/* Filter and search bar */}
      <Card className="p-5 bg-white border border-neutral-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="keyword" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Tìm kiếm</label>
            <input
              type="text"
              id="keyword"
              value={filters.keyword}
              onChange={handleFilterChange}
              placeholder="Nhập tên khách, mã hóa đơn..."
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all placeholder-neutral-400"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="status" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Trạng thái</label>
            <select
              id="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            >
              <option value="">Tất cả trạng thái</option>
              {Object.values(PAYMENT_STATUS).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="month" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Tháng kỳ thanh toán</label>
            <select
              id="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            >
              <option value="">Tất cả tháng</option>
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="year" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Năm</label>
            <select
              id="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            >
              <option value="">Tất cả năm</option>
              {yearOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="w-full h-9"
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      </Card>

      {/* Main invoices data table */}
      <Table
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        emptyMessage="Không tìm thấy hóa đơn nào."
      />

      {/* Pagination controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
          <p className="text-xs text-neutral-400 font-medium">
            Hiển thị hóa đơn {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} của {pagination.total}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Trước
            </Button>
            {Array.from({ length: pagination.pages }, (_, index) => {
              const pageNum = index + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold border flex items-center justify-center transition-all cursor-pointer ${
                    pagination.page === pageNum
                      ? 'bg-brand text-white border-brand'
                      : 'border-neutral-200 text-neutral-600 bg-white hover:bg-neutral-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* CREATE INVOICE MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => !isSubmitting && setIsCreateModalOpen(false)}
        title="Lập hóa đơn mới"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-5 text-neutral-900 text-left">
          {/* Scrollable Container */}
          <div className="max-h-[60vh] overflow-y-auto pr-1.5 space-y-4">
            <SearchableSelect
              label="Hợp đồng đang hiệu lực"
              id="contractSelect"
              value={createForm.contractId}
              onChange={handleContractSelect}
              options={contractOptions}
              placeholder="Chọn hợp đồng để lập hóa đơn..."
              required
              error={createErrors.contractId}
            />

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Tháng kỳ thanh toán</label>
                <select
                  value={createForm.month}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, month: parseInt(e.target.value, 10) }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-neutral-900 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                >
                  {monthOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Năm</label>
                <select
                  value={createForm.year}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, year: parseInt(e.target.value, 10) }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-neutral-900 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                >
                  {yearOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Hạn thanh toán"
                id="dueDate"
                type="date"
                required
                value={createForm.dueDate}
                onChange={(e) => setCreateForm(prev => ({ ...prev, dueDate: e.target.value }))}
                error={createErrors.dueDate}
              />
            </div>

            {createErrors.month && (
              <div className="text-xs text-red-500 font-semibold bg-red-50 border border-red-200 p-2.5 rounded-lg text-left">
                {createErrors.month}
              </div>
            )}

            {selectedContractInfo && roomReadings.length > 0 && (
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <h4 className="font-bold text-sm text-neutral-800 uppercase tracking-wide">
                  Chỉ số Điện / Nước theo phòng
                </h4>

                <div className="space-y-3">
                  {roomReadings.map((reading) => (
                    <div key={reading.roomId} className="bg-slate-50 border border-neutral-200/80 p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5">
                        <span className="font-bold text-neutral-900">Phòng {reading.roomNumber}</span>
                        <span className="text-xs text-neutral-500">Mã: {reading.roomId}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Electricity Indexes */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600 block">
                            Chỉ số điện (kWh)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={reading.electricityIndex}
                              onChange={(e) => handleReadingChange(reading.roomId, 'electricityIndex', e.target.value)}
                              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-neutral-900 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all ${
                                createErrors[reading.roomId + '_elec'] ? 'border-red-500' : ''
                              }`}
                              min={reading.oldElectricIndex}
                            />
                            <span className="text-[10px] text-neutral-500 block mt-1 font-medium">
                              Chỉ số cũ: <strong className="text-neutral-800">{reading.oldElectricIndex}</strong> kWh
                            </span>
                            {createErrors[reading.roomId + '_elec'] && (
                              <span className="text-xs text-red-500 block mt-0.5">{createErrors[reading.roomId + '_elec']}</span>
                            )}
                          </div>
                        </div>

                        {/* Water Indexes */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600 block">
                            Chỉ số nước (m3)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={reading.waterIndex}
                              onChange={(e) => handleReadingChange(reading.roomId, 'waterIndex', e.target.value)}
                              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-neutral-900 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all ${
                                createErrors[reading.roomId + '_water'] ? 'border-red-500' : ''
                              }`}
                              min={reading.oldWaterIndex}
                            />
                            <span className="text-[10px] text-neutral-500 block mt-1 font-medium">
                              Chỉ số cũ: <strong className="text-neutral-800">{reading.oldWaterIndex}</strong> m3
                            </span>
                            {createErrors[reading.roomId + '_water'] && (
                              <span className="text-xs text-red-500 block mt-0.5">{createErrors[reading.roomId + '_water']}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting || !selectedContractInfo}
            >
              {isSubmitting ? 'Đang lập hóa đơn...' : 'Lập hóa đơn'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* INVOICE DETAIL MODAL */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi tiết hóa đơn dịch vụ"
        className="!max-w-3xl"
      >
        {selectedInvoice && (
          <div className="space-y-5 text-neutral-900 text-left max-h-[78vh] overflow-y-auto pr-1">
            {/* Header info */}
            <div className="grid grid-cols-2 gap-4 border-b border-neutral-150 pb-4">
              <div>
                <span className="block text-xs text-neutral-400 font-bold uppercase tracking-wider">Mã hóa đơn:</span>
                <span className="font-extrabold text-neutral-950 text-base">{selectedInvoice.id}</span>
              </div>
              <div>
                <span className="block text-xs text-neutral-400 font-bold uppercase tracking-wider">Trạng thái:</span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border mt-1 ${
                  PAYMENT_STATUS_COLORS[invoiceDetailsData?.paymentStatus || selectedInvoice.paymentStatus] || 'bg-neutral-100 text-neutral-800'
                }`}>
                  {invoiceDetailsData?.paymentStatus || selectedInvoice.paymentStatus}
                </span>
              </div>
            </div>

            {/* Loading detailed nested response */}
            {!invoiceDetailsData ? (
              <div className="py-12 text-center text-neutral-500">
                Đang tải chi tiết phí dịch vụ...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Customer details */}
                  <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-2">
                    <h4 className="font-bold text-neutral-800 uppercase tracking-wide border-b border-slate-200 pb-1">
                      Thông tin khách hàng
                    </h4>
                    <div className="space-y-1">
                      <p><span className="text-neutral-400">Họ tên:</span> <strong className="text-neutral-800">{invoiceDetailsData.contract?.customer?.fullName}</strong></p>
                      <p><span className="text-neutral-400">Số điện thoại:</span> <strong className="text-neutral-800">{invoiceDetailsData.contract?.customer?.phoneNumber}</strong></p>
                      <p><span className="text-neutral-400">Email:</span> <strong className="text-neutral-800">{invoiceDetailsData.contract?.customer?.email || 'N/A'}</strong></p>
                    </div>
                  </div>

                  {/* Lease terms */}
                  <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-2">
                    <h4 className="font-bold text-neutral-800 uppercase tracking-wide border-b border-slate-200 pb-1">
                      Hợp đồng & Kỳ thanh toán
                    </h4>
                    <div className="space-y-1">
                      <p><span className="text-neutral-400">Mã hợp đồng:</span> <strong className="text-neutral-800">{invoiceDetailsData.contractId}</strong></p>
                      <p><span className="text-neutral-400">Kỳ thanh toán:</span> <strong className="text-neutral-800">Tháng {invoiceDetailsData.paymentMonth}/{invoiceDetailsData.paymentYear}</strong></p>
                      <p><span className="text-neutral-400">Hạn nộp:</span> <strong className="text-red-600">{formatDate(invoiceDetailsData.dueDate)}</strong></p>
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
                        {invoiceDetailsData.invoiceDetails?.map((detail, index) => {
                          const isIndexService = detail.service?.name === 'Điện' || detail.service?.name === 'Nước';
                          const roomLabel = invoiceDetailsData.contract?.contractDetails?.find(cd => cd.roomId === detail.roomId)?.room?.roomNumber || detail.roomId;
                          
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
                      <strong className="text-neutral-900 font-bold text-sm">{formatCurrency(invoiceDetailsData.totalAmount)}</strong>
                    </div>
                    {(() => {
                      const totalPaid = (invoiceDetailsData.payments || []).reduce((sum, p) => sum + Number(p.amountPaid), 0);
                      const debt = Math.max(0, Number(invoiceDetailsData.totalAmount) - totalPaid);
                      return (
                        <>
                          <div className="flex justify-between border-b border-neutral-200 pb-2">
                            <span className="text-neutral-500 font-medium">Đã thanh toán:</span>
                            <strong className="text-emerald-700 font-bold">{formatCurrency(totalPaid)}</strong>
                          </div>
                          <div className="flex justify-between pt-1">
                            <span className="text-neutral-500 font-semibold">Còn lại cần thu:</span>
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
                  {(!invoiceDetailsData.payments || invoiceDetailsData.payments.length === 0) ? (
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
                          {invoiceDetailsData.payments.map((p, pIdx) => {
                            const isReceiptLink = p.transactionId && (p.transactionId.startsWith('http') || p.transactionId.startsWith('/'));
                            return (
                              <tr key={p.id || pIdx} className="hover:bg-neutral-50/40">
                                <td className="px-4 py-2.5 text-neutral-600 font-mono">
                                  {formatDate(p.paymentDate)}
                                </td>
                                <td className="px-4 py-2.5 font-medium text-neutral-800">
                                  {p.payerName || 'N/A'}
                                </td>
                                <td className="px-4 py-2.5 text-neutral-700">
                                  {p.paymentMethod}
                                </td>
                                <td className="px-4 py-2.5 text-neutral-600">
                                  {isReceiptLink ? (
                                    <a
                                      href={p.transactionId}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-brand hover:underline font-medium inline-flex items-center gap-1"
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

                {/* Confirm Pending Payment Action */}
                {invoiceDetailsData.paymentStatus === PAYMENT_STATUS.PENDING_CONFIRMATION && invoiceDetailsData.payments?.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="text-xs text-left">
                        <strong className="text-purple-950 font-bold block text-sm">Giao dịch thanh toán chờ đối soát xác nhận</strong>
                        <p className="text-purple-800 mt-1">
                          Khách hàng đã tải lên biên lai và yêu cầu xác nhận số tiền{' '}
                          <strong className="text-purple-950 font-bold">
                            {formatCurrency(invoiceDetailsData.payments[0].amountPaid)}
                          </strong>
                          . Kiểm tra ảnh giao dịch để đảm bảo tiền đã chuyển khoản thực tế.
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2.5">
                      <Button
                        variant="primary"
                        size="sm"
                        className="bg-purple-700 text-white border-purple-700 hover:bg-purple-800"
                        onClick={() => handleOpenPaymentModal(invoiceDetailsData, Number(invoiceDetailsData.payments[0].amountPaid))}
                      >
                        Xác nhận & Khớp giao dịch
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Modal Actions footer */}
            <div className="flex justify-end gap-2.5 pt-4 border-t border-neutral-100">
              {invoiceDetailsData && invoiceDetailsData.paymentStatus !== PAYMENT_STATUS.PAID && (
                <Button
                  variant="primary"
                  onClick={() => handleOpenPaymentModal(invoiceDetailsData)}
                >
                  Ghi nhận thanh toán
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* RECORD PAYMENT MODAL */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => !isSubmittingPayment && setIsPaymentModalOpen(false)}
        title="Ghi nhận thanh toán hóa đơn"
        size="md"
      >
        {selectedInvoice && (
          <form onSubmit={handlePaymentSubmit} className="space-y-4 text-neutral-900 text-left">
            <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl text-xs space-y-1.5">
              <p><span className="text-neutral-500 font-medium">Hóa đơn:</span> <strong className="text-neutral-800">{selectedInvoice.id}</strong></p>
              <p><span className="text-neutral-500 font-medium">Khách hàng:</span> <strong className="text-neutral-800">{selectedInvoice.contract?.customer?.fullName}</strong></p>
              <p><span className="text-neutral-500 font-medium">Kỳ thanh toán:</span> <strong className="text-neutral-800">Tháng {selectedInvoice.paymentMonth}/{selectedInvoice.paymentYear}</strong></p>
              <p><span className="text-neutral-500 font-medium">Tổng tiền hóa đơn:</span> <strong className="text-neutral-850">{formatCurrency(selectedInvoice.totalAmount)}</strong></p>
            </div>

            <Input
              label="Số tiền nộp (VND)"
              id="amountPaid"
              type="number"
              required
              value={paymentForm.amountPaid}
              onChange={(e) => setPaymentForm(prev => ({ ...prev, amountPaid: e.target.value }))}
              error={paymentErrors.amountPaid}
            />

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-sm font-medium text-slate-700">Phương thức thanh toán *</label>
              <select
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-neutral-900 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
              >
                {paymentMethods.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <Input
              label="Tên người nộp tiền"
              id="payerName"
              placeholder="Nhập tên người nộp (mặc định tên khách thuê)"
              value={paymentForm.payerName}
              onChange={(e) => setPaymentForm(prev => ({ ...prev, payerName: e.target.value }))}
            />

            <Input
              label="Mã giao dịch ngân hàng / Tham chiếu"
              id="transactionId"
              placeholder="Nhập mã giao dịch FT... nếu có"
              value={paymentForm.transactionId}
              onChange={(e) => setPaymentForm(prev => ({ ...prev, transactionId: e.target.value }))}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                disabled={isSubmittingPayment}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmittingPayment}
              >
                {isSubmittingPayment ? 'Đang cập nhật...' : 'Ghi nhận'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
