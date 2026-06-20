'use client';

import React, { useEffect, useState, useRef } from 'react';
import { contractService } from '@/services/contract.service';
import { roomService } from '@/services/room.service';
import { buildingService } from '@/services/building.service';
import { customerService } from '@/services/customer.service';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate, formatDateInput } from '@/utils/format';
import { CONTRACT_STATUS, CONTRACT_STATUS_COLORS } from '@/constants/contracts';
import { ROOM_STATUS } from '@/constants/rooms';
import { ROLES } from '@/constants/roles';
import { useAuth } from '@/hooks/useAuth';
import { createContractSchema, extendContractSchema, validateForm } from '@/validators';
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

export default function ContractsManagement() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    customerId: '',
    roomId: '',
    status: '',
    page: 1,
    limit: 10,
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const [selectedContract, setSelectedContract] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    cancelled: 0,
  });

  const [formData, setFormData] = useState({
    customerId: '',
    rooms: [], // array of { roomId, agreedPrice, startDate, endDate }
    deposit: '0',
  });
  const [defaultStartDate, setDefaultStartDate] = useState('');
  const [defaultEndDate, setDefaultEndDate] = useState('');
  const [extendData, setExtendData] = useState({
    endDate: '',
  });
  const [cancelData, setCancelData] = useState({
    force: false,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRentalManager = user?.role === ROLES.RENTAL_MANAGER;

  const fetchContracts = async () => {
    setIsLoading(true);
    try {
      const queryParams = {
        ...filters,
        customerId: filters.customerId.trim() || undefined,
        roomId: filters.roomId || undefined,
        status: filters.status || undefined,
      };

      const result = await contractService.getContracts(queryParams);
      if (result.success) {
        setContracts(result.data || []);
        setPagination(result.pagination || { page: 1, limit: 10, total: 0, pages: 1 });

        const allResult = await contractService.getContracts({ limit: 1000 });
        if (allResult.success && allResult.data) {
          const list = allResult.data;
          let active = 0;
          let expired = 0;
          let cancelled = 0;
          list.forEach(c => {
            if (c.status === CONTRACT_STATUS.ACTIVE) active++;
            else if (c.status === CONTRACT_STATUS.EXPIRED) expired++;
            else if (c.status === CONTRACT_STATUS.CANCELLED) cancelled++;
          });
          setStats({
            total: list.length,
            active,
            expired,
            cancelled,
          });
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách hợp đồng:', err);
      toast.error('Không thể tải danh sách hợp đồng.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const roomsData = await roomService.getRooms({ limit: 1000 });
      setRooms(roomsData || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách phòng:', err);
      toast.error('Lỗi khi tải danh sách phòng.');
    }
  };

  const fetchBuildings = async () => {
    try {
      const data = await buildingService.getBuildings({ limit: 1000 });
      setBuildings(data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách tòa nhà:', err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await customerService.getCustomers({ limit: 1000 });
      setCustomers(data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách khách hàng:', err);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchContracts();
    });
  }, [filters]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchRooms();
      fetchBuildings();
      fetchCustomers();
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
      customerId: '',
      roomId: '',
      status: '',
      page: 1,
      limit: 10,
    });
  };

  const handleOpenAddModal = () => {
    setFormData({
      customerId: '',
      rooms: [],
      deposit: '0',
    });
    setDefaultStartDate('');
    setDefaultEndDate('');
    setSelectedBuildingId('');
    setFieldErrors({});
    setIsAddModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (fieldErrors[id]) {
      setFieldErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    if (formData.rooms.length === 0) {
      toast.error('Vui lòng chọn ít nhất một phòng thuê');
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const r of formData.rooms) {
      const roomInfo = rooms.find(room => room.id === r.roomId);
      const roomNum = roomInfo?.roomNumber || r.roomId;
      if (!r.startDate || !r.endDate) {
        toast.error(`Vui lòng nhập ngày bắt đầu và ngày kết thúc cho phòng ${roomNum}`);
        return;
      }
      const sDate = new Date(r.startDate);
      sDate.setHours(0, 0, 0, 0);
      if (sDate < today) {
        toast.error(`Ngày bắt đầu thuê của phòng ${roomNum} không được trước ngày hiện tại`);
        return;
      }
      if (sDate >= new Date(r.endDate)) {
        toast.error(`Ngày kết thúc phải sau ngày bắt đầu cho phòng ${roomNum}`);
        return;
      }
    }

    const validation = validateForm(createContractSchema, formData);
    if (!validation.success) {
      setFieldErrors(validation.errors);
      return;
    }

    const employeeId = user?.employee?.id || user?.employeeId;
    if (!employeeId) {
      toast.error('Không tìm thấy thông tin nhân viên lập hợp đồng. Vui lòng đăng nhập lại.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        employeeId,
        deposit: parseFloat(formData.deposit),
        rooms: formData.rooms.map(r => ({
          roomId: r.roomId,
          agreedPrice: parseFloat(r.agreedPrice) || 0,
          startDate: r.startDate,
          endDate: r.endDate
        }))
      };

      await contractService.createContract(payload);
      toast.success('Lập hợp đồng mới thành công!');
      setIsAddModalOpen(false);
      fetchContracts();
      fetchRooms();
    } catch (err) {
      if (err.errors) {
        setFieldErrors(err.errors);
      } else {
        toast.error(err.message || 'Có lỗi xảy ra khi lập hợp đồng.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenExtendModal = (contract) => {
    setSelectedContract(contract);
    const details = contract.contractDetails?.[0];
    setExtendData({
      endDate: details ? formatDateInput(details.endDate) : '',
    });
    setFieldErrors({});
    setIsExtendModalOpen(true);
  };

  const handleExtendSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const validation = validateForm(extendContractSchema, extendData);
    if (!validation.success) {
      setFieldErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await contractService.extendContract(selectedContract.id, {
        endDate: new Date(extendData.endDate),
      });
      toast.success('Gia hạn hợp đồng thành công!');
      setIsExtendModalOpen(false);
      fetchContracts();
    } catch (err) {
      if (err.errors) {
        setFieldErrors(err.errors);
      } else {
        toast.error(err.message || 'Có lỗi xảy ra khi gia hạn hợp đồng.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCancelModal = (contract) => {
    setSelectedContract(contract);
    setCancelData({
      force: false,
    });
    setIsCancelModalOpen(true);
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await contractService.cancelContract(selectedContract.id, cancelData);
      toast.success('Hủy hợp đồng thành công!');
      setIsCancelModalOpen(false);
      fetchContracts();
      fetchRooms();
    } catch (err) {
      toast.error(err.message || 'Có lỗi xảy ra khi hủy hợp đồng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDetailModal = (contract) => {
    setSelectedContract(contract);
    setIsDetailModalOpen(true);
  };

  // Filter available rooms for creation dropdown
  const availableRooms = rooms.filter(room => room.status === ROOM_STATUS.AVAILABLE);

  const filteredAvailableRooms = selectedBuildingId
    ? availableRooms.filter(room => room.buildingId === selectedBuildingId)
    : [];

  const customerOptions = customers.map(cust => ({
    value: cust.id,
    label: `${cust.fullName} (${cust.id}) - ${cust.phoneNumber}`,
  }));

  const roomOptions = filteredAvailableRooms
    .filter(r => !formData.rooms?.some(item => item.roomId === r.id))
    .map(r => ({
      value: r.id,
      label: `Phòng ${r.roomNumber} - Tầng ${r.floor} (${formatCurrency(r.price)} / Tháng)`,
    }));

  const columns = [
    { header: 'Mã Hợp Đồng', key: 'id' },
    {
      header: 'Khách Hàng',
      key: 'customerName',
      render: (c) => (
        <div>
          <div className="font-semibold text-neutral-900">{c.customer?.fullName || '-'}</div>
          <div className="text-xs text-neutral-500">{c.customerId}</div>
        </div>
      ),
    },
    {
      header: 'Phòng',
      key: 'roomInfo',
      render: (c) => {
        const detail = c.contractDetails?.[0];
        if (!detail) return '-';
        return (
          <div>
            <div className="font-medium text-neutral-900">Phòng {detail.room?.roomNumber || detail.roomId}</div>
            <div className="text-xs text-neutral-500">{detail.room?.building?.name || 'Vãng lai'}</div>
          </div>
        );
      },
    },
    {
      header: 'Thời Hạn',
      key: 'dates',
      render: (c) => {
        const detail = c.contractDetails?.[0];
        if (!detail) return '-';
        return (
          <div className="text-xs space-y-0.5">
            <div><span className="text-neutral-400">Bắt đầu:</span> {formatDate(detail.startDate)}</div>
            <div><span className="text-neutral-400">Hết hạn:</span> {formatDate(detail.endDate)}</div>
          </div>
        );
      },
    },
    {
      header: 'Tiền Cọc',
      key: 'deposit',
      render: (c) => formatCurrency(c.deposit),
    },
    {
      header: 'Trạng Thái',
      key: 'status',
      render: (c) => {
        const colorClass = CONTRACT_STATUS_COLORS[c.status] || 'bg-zinc-100 text-zinc-800 border-zinc-200';
        return (
          <span className={`px-2.5 py-1 text-xs rounded-full font-medium border ${colorClass}`}>
            {c.status}
          </span>
        );
      },
    },
    {
      header: 'Thao tác',
      key: 'actions',
      render: (c) => {
        const isActive = c.status === CONTRACT_STATUS.ACTIVE;
        return (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenDetailModal(c)}
            >
              Chi tiết
            </Button>
            {isRentalManager && isActive && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenExtendModal(c)}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  Gia hạn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenCancelModal(c)}
                  className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                >
                  Hủy bỏ
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Quản lý hợp đồng</h2>
          <p className="text-slate-500 text-sm mt-1">
            Theo dõi, gia hạn và lập hợp đồng thuê văn phòng & căn hộ dịch vụ.
          </p>
        </div>
        {isRentalManager && (
          <Button onClick={handleOpenAddModal} variant="primary">
            <svg className="w-5 h-5 -ml-1 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Lập hợp đồng
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-neutral-100 flex items-center gap-4">
          <div className="p-3 bg-neutral-50 border border-neutral-100 text-neutral-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Tổng hợp đồng</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.total}</p>
          </div>
        </Card>
        <Card className="p-4 bg-white border border-neutral-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-emerald-500 font-semibold uppercase tracking-wider">Đang hiệu lực</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.active}</p>
          </div>
        </Card>
        <Card className="p-4 bg-white border border-neutral-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-red-500 font-semibold uppercase tracking-wider">Đã hết hạn</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.expired}</p>
          </div>
        </Card>
        <Card className="p-4 bg-white border border-neutral-100 flex items-center gap-4">
          <div className="p-3 bg-neutral-100 border border-neutral-200 text-neutral-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Đã hủy bỏ</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.cancelled}</p>
          </div>
        </Card>
      </div>

      <Card className="p-5 bg-white border border-neutral-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="customerId" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Mã Khách Hàng</label>
            <input
              type="text"
              id="customerId"
              value={filters.customerId}
              onChange={handleFilterChange}
              placeholder="Ví dụ: KH0001"
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all placeholder-neutral-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="roomId" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Phòng Thuê</label>
            <select
              id="roomId"
              value={filters.roomId}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            >
              <option value="">Tất cả phòng</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Phòng {r.roomNumber} - {r.building?.name || r.id}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="status" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Trạng Thái</label>
            <select
              id="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Đang hiệu lực">Đang hiệu lực</option>
              <option value="Đã hết hạn">Đã hết hạn</option>
              <option value="Đã hủy">Đã hủy</option>
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

      <Table
        columns={columns}
        data={contracts}
        isLoading={isLoading}
        emptyMessage="Không tìm thấy hợp đồng thuê nào."
      />

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
          <p className="text-xs text-neutral-400 font-medium">
            Hiển thị hợp đồng {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} của {pagination.total}
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

      {isAddModalOpen && (
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Lập hợp đồng thuê mới" size="lg">
          <form onSubmit={handleCreateSubmit} noValidate className="flex flex-col max-h-[70vh]">
            <div className="flex-1 overflow-y-auto pr-1.5 space-y-4 pb-4">
              <SearchableSelect
              label="Khách hàng"
              id="customerId"
              value={formData.customerId}
              onChange={(val) => setFormData(prev => ({ ...prev, customerId: val }))}
              options={customerOptions}
              placeholder="Chọn khách hàng thuê..."
              required
              error={fieldErrors.customerId}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ngày bắt đầu (mặc định)"
                id="defaultStartDate"
                type="date"
                value={defaultStartDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setDefaultStartDate(val);
                  setFormData(prev => ({
                    ...prev,
                    rooms: prev.rooms.map(r => ({
                      ...r,
                      startDate: r.startDate || val
                    }))
                  }));
                }}
              />
              <Input
                label="Ngày kết thúc (mặc định)"
                id="defaultEndDate"
                type="date"
                value={defaultEndDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setDefaultEndDate(val);
                  setFormData(prev => ({
                    ...prev,
                    rooms: prev.rooms.map(r => ({
                      ...r,
                      endDate: r.endDate || val
                    }))
                  }));
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Tòa nhà</label>
                <select
                  value={selectedBuildingId}
                  onChange={(e) => setSelectedBuildingId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-neutral-900 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                >
                  <option value="">-- Chọn tòa nhà --</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <SearchableSelect
                label="Chọn phòng để thêm"
                id="addRoomSelect"
                value=""
                onChange={(roomId) => {
                  if (roomId && !formData.rooms.some(r => r.roomId === roomId)) {
                    const roomInfo = rooms.find(r => r.id === roomId);
                    const newRoom = {
                      roomId: roomId,
                      agreedPrice: roomInfo ? Number(roomInfo.price) : 0,
                      startDate: defaultStartDate || '',
                      endDate: defaultEndDate || '',
                    };
                    setFormData(prev => ({
                      ...prev,
                      rooms: [...prev.rooms, newRoom]
                    }));
                  } else if (roomId) {
                    toast.error('Phòng này đã được chọn');
                  }
                }}
                options={roomOptions}
                placeholder={selectedBuildingId ? "Chọn phòng trống..." : "Chọn tòa nhà trước"}
                required={formData.rooms.length === 0}
                disabled={!selectedBuildingId}
                error={fieldErrors.rooms}
              />
            </div>

            {formData.rooms.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 block">
                  Chi tiết phòng thuê ({formData.rooms.length})
                </label>
                <div className="max-h-80 overflow-y-auto space-y-3 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  {formData.rooms.map((item, idx) => {
                    const roomInfo = rooms.find(r => r.id === item.roomId);
                    if (!roomInfo) return null;
                    return (
                      <div key={item.roomId} className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm space-y-3 relative hover:border-brand/40 transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-sm text-neutral-850">
                              Phòng {roomInfo.roomNumber} - {roomInfo.building?.name || 'Vãng lai'}
                            </span>
                            <span className="text-xs text-neutral-400 block mt-0.5">
                              Tầng {roomInfo.floor} • Giá niêm yết: {formatCurrency(roomInfo.price)}/tháng
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                rooms: prev.rooms.filter(r => r.roomId !== item.roomId)
                              }));
                            }}
                            className="p-1 rounded-md text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                            title="Xóa phòng"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Giá thỏa thuận</label>
                            <input
                              type="number"
                              value={item.agreedPrice}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData(prev => {
                                  const updated = [...prev.rooms];
                                  updated[idx] = { ...updated[idx], agreedPrice: val };
                                  return { ...prev, rooms: updated };
                                });
                              }}
                              className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-lg text-xs bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-medium"
                              placeholder="Giá thuê..."
                              required
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Ngày bắt đầu</label>
                            <input
                              type="date"
                              value={item.startDate}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData(prev => {
                                  const updated = [...prev.rooms];
                                  updated[idx] = { ...updated[idx], startDate: val };
                                  return { ...prev, rooms: updated };
                                });
                              }}
                              className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-lg text-xs bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                              required
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Ngày kết thúc</label>
                            <input
                              type="date"
                              value={item.endDate}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData(prev => {
                                  const updated = [...prev.rooms];
                                  updated[idx] = { ...updated[idx], endDate: val };
                                  return { ...prev, rooms: updated };
                                });
                              }}
                              className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-lg text-xs bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-2.5 bg-brand/5 border border-brand/10 rounded-xl flex items-center justify-between text-xs text-brand font-semibold">
                  <span>Tổng giá thuê thỏa thuận:</span>
                  <span className="text-sm font-bold">
                    {formatCurrency(
                      formData.rooms.reduce((sum, item) => sum + Number(item.agreedPrice || 0), 0)
                    )} / Tháng
                  </span>
                </div>
              </div>
            )}

            <Input
              label="Số tiền đặt cọc (VND)"
              id="deposit"
              type="number"
              value={formData.deposit}
              onChange={handleInputChange}
              required
              error={fieldErrors.deposit}
            />
          </div>

            <div className="border-t border-neutral-100 pt-4 flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Lập hợp đồng
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {isDetailModalOpen && selectedContract && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Chi tiết Hợp đồng ${selectedContract.id}`}
          size="lg"
        >
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between bg-neutral-50 p-4 border border-neutral-100 rounded-xl">
              <div>
                <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block">Trạng thái</span>
                <span className={`inline-block mt-1 px-3 py-1 text-xs rounded-full font-semibold border ${CONTRACT_STATUS_COLORS[selectedContract.status] || 'bg-zinc-100 text-zinc-800 border-zinc-200'}`}>
                  {selectedContract.status}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block">Ngày lập hợp đồng</span>
                <span className="text-sm font-semibold text-neutral-800 mt-1 block">
                  {formatDate(selectedContract.createdDate)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-neutral-200/60 rounded-xl space-y-3">
                <h4 className="font-bold text-neutral-900 border-b border-neutral-100 pb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Thông tin khách hàng
                </h4>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between"><span className="text-neutral-500">Mã khách hàng:</span> <span className="font-semibold text-neutral-800">{selectedContract.customer?.id || selectedContract.customerId}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Họ và tên:</span> <span className="font-semibold text-neutral-800">{selectedContract.customer?.fullName || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Số điện thoại:</span> <span className="font-semibold text-neutral-800">{selectedContract.customer?.phoneNumber || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">CCCD/CMND:</span> <span className="font-semibold text-neutral-800">{selectedContract.customer?.nationalId || '-'}</span></div>
                </div>
              </div>

              <div className="p-4 border border-neutral-200/60 rounded-xl space-y-3">
                <h4 className="font-bold text-neutral-900 border-b border-neutral-100 pb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Nhân viên phụ trách
                </h4>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between"><span className="text-neutral-500">Mã nhân viên:</span> <span className="font-semibold text-neutral-800">{selectedContract.employee?.id || selectedContract.employeeId}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Họ và tên:</span> <span className="font-semibold text-neutral-800">{selectedContract.employee?.fullName || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Số điện thoại:</span> <span className="font-semibold text-neutral-800">{selectedContract.employee?.phoneNumber || '-'}</span></div>
                </div>
              </div>
            </div>

            <div className="p-4 border border-neutral-200/60 rounded-xl space-y-4">
              <h4 className="font-bold text-neutral-900 border-b border-neutral-100 pb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Chi tiết phòng thuê & Điều khoản tài chính
              </h4>

              {selectedContract.contractDetails?.map((detail, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm bg-neutral-50/50 p-3.5 rounded-lg border border-neutral-100">
                    <div><span className="text-neutral-500 block text-xs font-medium uppercase tracking-wider">Số phòng</span> <span className="font-bold text-neutral-800 text-base">Phòng {detail.room?.roomNumber || detail.roomId}</span></div>
                    <div><span className="text-neutral-500 block text-xs font-medium uppercase tracking-wider">Tòa nhà</span> <span className="font-semibold text-neutral-800">{detail.room?.building?.name || 'Vãng lai'}</span></div>
                    <div><span className="text-neutral-500 block text-xs font-medium uppercase tracking-wider">Loại phòng</span> <span className="font-semibold text-neutral-800">{detail.room?.type || '-'}</span></div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="p-3 border border-neutral-100 rounded-lg">
                      <span className="text-neutral-500 block text-xs">Giá thuê thỏa thuận</span>
                      <span className="font-bold text-neutral-900 mt-1 block">{formatCurrency(detail.agreedPrice)}</span>
                    </div>
                    <div className="p-3 border border-neutral-100 rounded-lg">
                      <span className="text-neutral-500 block text-xs">Tiền đặt cọc</span>
                      <span className="font-bold text-neutral-900 mt-1 block">{formatCurrency(selectedContract.deposit)}</span>
                    </div>
                    <div className="p-3 border border-neutral-100 rounded-lg">
                      <span className="text-neutral-500 block text-xs">Diện tích phòng</span>
                      <span className="font-semibold text-neutral-800 mt-1 block">{detail.room?.area ? `${detail.room.area} m²` : '-'}</span>
                    </div>
                    <div className="p-3 border border-neutral-100 rounded-lg">
                      <span className="text-neutral-500 block text-xs">Vị trí tầng</span>
                      <span className="font-semibold text-neutral-800 mt-1 block">Tầng {detail.room?.floor || '-'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t border-neutral-100 pt-3">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-neutral-500">Ngày bắt đầu hiệu lực:</span>
                      <span className="font-bold text-neutral-800">{formatDate(detail.startDate)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-neutral-500">Ngày hết hạn dự kiến:</span>
                      <span className="font-bold text-neutral-800">{formatDate(detail.endDate)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedContract.invoices && selectedContract.invoices.length > 0 && (
              <div className="p-4 border border-neutral-200/60 rounded-xl space-y-3">
                <h4 className="font-bold text-neutral-900 border-b border-neutral-100 pb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Hóa đơn liên quan ({selectedContract.invoices.length})
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-neutral-100 bg-neutral-50 font-semibold text-neutral-600">
                        <th className="px-3 py-2">Mã Hóa Đơn</th>
                        <th className="px-3 py-2">Kỳ Thanh Toán</th>
                        <th className="px-3 py-2">Hạn Thanh Toán</th>
                        <th className="px-3 py-2">Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {selectedContract.invoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td className="px-3 py-2 font-semibold text-neutral-800">{invoice.id}</td>
                          <td className="px-3 py-2">Tháng {invoice.paymentMonth}/{invoice.paymentYear}</td>
                          <td className="px-3 py-2">{formatDate(invoice.dueDate)}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              invoice.paymentStatus.toLowerCase().includes('đã') || invoice.paymentStatus.toLowerCase().includes('paid')
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {invoice.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-neutral-100 pt-4 flex justify-end">
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              Đóng
            </Button>
          </div>
        </Modal>
      )}

      {isExtendModalOpen && selectedContract && (
        <Modal
          isOpen={isExtendModalOpen}
          onClose={() => setIsExtendModalOpen(false)}
          title={`Gia hạn Hợp đồng ${selectedContract.id}`}
          size="sm"
        >
          <form onSubmit={handleExtendSubmit} noValidate className="space-y-4">
            <div className="bg-neutral-50 p-3 border border-neutral-100 rounded-lg text-xs space-y-1 text-neutral-600">
              <div><span className="font-semibold">Phòng thuê:</span> Phòng {selectedContract.contractDetails?.[0]?.room?.roomNumber}</div>
              <div><span className="font-semibold">Hạn hiện tại:</span> {formatDate(selectedContract.contractDetails?.[0]?.endDate)}</div>
            </div>

            <Input
              label="Ngày hết hạn mới"
              id="endDate"
              type="date"
              value={extendData.endDate}
              onChange={(e) => setExtendData({ endDate: e.target.value })}
              required
              error={fieldErrors.endDate}
            />

            <div className="border-t border-neutral-100 pt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsExtendModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Gia hạn
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {isCancelModalOpen && selectedContract && (
        <Modal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          title={`Hủy bỏ Hợp đồng ${selectedContract.id}`}
          size="sm"
        >
          <form onSubmit={handleCancelSubmit} noValidate className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-xl space-y-2 text-sm">
              <p className="font-bold flex items-center gap-1.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Cảnh báo hủy hợp đồng!
              </p>
              <p className="text-xs leading-relaxed text-red-700">
                Hủy hợp đồng sẽ trả trạng thái phòng về <b>Còn trống</b>. Bạn hãy chắc chắn muốn hủy hợp đồng <b>{selectedContract.id}</b> của khách hàng <b>{selectedContract.customer?.fullName}</b>.
              </p>
            </div>

            <div className="flex items-start gap-2.5 p-2 bg-neutral-50 rounded-lg border border-neutral-100">
              <input
                type="checkbox"
                id="force"
                checked={cancelData.force}
                onChange={(e) => setCancelData({ force: e.target.checked })}
                className="mt-1 border-neutral-200 rounded text-brand focus:ring-0 cursor-pointer"
              />
              <label htmlFor="force" className="text-xs text-neutral-600 font-medium select-none cursor-pointer">
                <b>Bỏ qua hóa đơn chưa thanh toán (Force)</b>
                <span className="block text-[10px] text-neutral-400 mt-0.5">Cho phép hủy hợp đồng ngay cả khi khách thuê còn hóa đơn chưa đóng.</span>
              </label>
            </div>

            <div className="border-t border-neutral-100 pt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>
                Bỏ qua
              </Button>
              <Button type="submit" variant="danger" isLoading={isSubmitting}>
                Xác nhận hủy
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
