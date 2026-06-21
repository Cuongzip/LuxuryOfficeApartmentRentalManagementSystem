'use client';

import React, { useEffect, useState } from 'react';
import { occupantService } from '@/services/occupant.service';
import { contractService } from '@/services/contract.service';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import {
  OCCUPANCY_TYPES,
  OCCUPANCY_STATUS,
} from '@/constants';
import { occupantSchema, validateForm } from '@/validators';

export default function SecurityOccupantsManagement() {
  const [occupants, setOccupants] = useState([]);
  const [activeContracts, setActiveContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter states
  const [filters, setFilters] = useState({
    search: '',
    occupancyType: '',
    occupancyStatus: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOccupant, setCurrentOccupant] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    nationalId: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: 'Nam',
    occupancyType: OCCUPANCY_TYPES.OCCUPANT,
    occupancyStatus: OCCUPANCY_STATUS.TEMPORARY,
    contractId: '',
    roomId: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active rooms for the selected contract in form
  const [formRooms, setFormRooms] = useState([]);

  const fetchActiveContracts = async () => {
    try {
      const res = await contractService.getContracts({ limit: 1000 });
      if (res.success) {
        // Filter only active contracts
        const active = (res.data || []).filter(c => c.status === 'Đang hiệu lực');
        setActiveContracts(active);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách hợp đồng:', err);
    }
  };

  const fetchOccupants = async () => {
    setIsLoading(true);
    try {
      const queryParams = {
        ...filters,
        search: filters.search.trim() || undefined,
        occupancyType: filters.occupancyType || undefined,
        occupancyStatus: filters.occupancyStatus || undefined,
      };
      const res = await occupantService.getOccupants(queryParams);
      if (res.success) {
        setOccupants(res.data || []);
        setPagination(res.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách người sử dụng:', err);
      toast.error('Lỗi khi tải danh sách người sử dụng.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveContracts();
  }, []);

  useEffect(() => {
    fetchOccupants();
  }, [filters]);

  // Update room options when selected contract changes in form
  useEffect(() => {
    if (!formData.contractId) {
      setFormRooms([]);
      return;
    }
    const selectedContract = activeContracts.find(c => c.id === formData.contractId);
    if (selectedContract && selectedContract.contractDetails) {
      // Map rooms from details
      const rooms = selectedContract.contractDetails.map(detail => ({
        id: detail.roomId,
        roomNumber: detail.room?.roomNumber || detail.roomId,
      }));
      setFormRooms(rooms);
      // Auto select first room if not already matching
      if (rooms.length > 0 && !rooms.some(r => r.id === formData.roomId)) {
        setFormData(prev => ({ ...prev, roomId: rooms[0].id }));
      }
    } else {
      setFormRooms([]);
    }
  }, [formData.contractId, activeContracts]);

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [id]: value,
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      occupancyType: '',
      occupancyStatus: '',
      page: 1,
      limit: 10,
    });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleOpenAddModal = () => {
    setCurrentOccupant(null);
    setFormData({
      fullName: '',
      nationalId: '',
      phoneNumber: '',
      dateOfBirth: '',
      gender: 'Nam',
      occupancyType: OCCUPANCY_TYPES.OCCUPANT,
      occupancyStatus: OCCUPANCY_STATUS.TEMPORARY,
      contractId: activeContracts[0]?.id || '',
      roomId: '',
    });
    setImageFile(null);
    setImagePreview('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (occupant) => {
    setCurrentOccupant(occupant);
    const dobFormatted = occupant.dateOfBirth
      ? new Date(occupant.dateOfBirth).toISOString().split('T')[0]
      : '';

    setFormData({
      fullName: occupant.fullName || '',
      nationalId: occupant.nationalId || '',
      phoneNumber: occupant.phoneNumber || '',
      dateOfBirth: dobFormatted,
      gender: occupant.gender || 'Nam',
      occupancyType: occupant.occupancyType || OCCUPANCY_TYPES.OCCUPANT,
      occupancyStatus: occupant.occupancyStatus || OCCUPANCY_STATUS.TEMPORARY,
      contractId: occupant.contractId || '',
      roomId: occupant.roomId || '',
    });

    const backendUrl = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
      : 'http://localhost:3000';
    setImageFile(null);
    setImagePreview(occupant.image ? `${backendUrl}${occupant.image}` : '');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (fieldErrors[id]) {
      setFieldErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận định dạng ảnh JPEG, JPG, PNG, WEBP');
      return;
    }

    if (file.size > maxSize) {
      toast.error('Dung lượng ảnh tối đa là 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const validation = validateForm(occupantSchema, formData);
    if (!validation.success) {
      setFieldErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('nationalId', formData.nationalId);
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      formDataToSend.append('occupancyType', formData.occupancyType);
      formDataToSend.append('occupancyStatus', formData.occupancyStatus);
      if (formData.dateOfBirth) {
        formDataToSend.append('dateOfBirth', formData.dateOfBirth);
      }
      if (formData.gender) {
        formDataToSend.append('gender', formData.gender);
      }
      formDataToSend.append('contractId', formData.contractId);
      formDataToSend.append('roomId', formData.roomId);

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      if (currentOccupant) {
        await occupantService.updateOccupant(currentOccupant.id, formDataToSend);
        toast.success('Cập nhật thông tin người sử dụng thành công!');
      } else {
        await occupantService.createOccupant(formDataToSend);
        toast.success('Thêm người sử dụng mới thành công!');
      }

      setIsModalOpen(false);
      fetchOccupants();
    } catch (err) {
      if (err.errors) {
        setFieldErrors(err.errors);
      } else {
        toast.error(err.message || 'Có lỗi xảy ra khi lưu thông tin người sử dụng.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người sử dụng này không?')) return;
    try {
      await occupantService.deleteOccupant(id);
      toast.success('Xóa người sử dụng thành công!');
      fetchOccupants();
    } catch (err) {
      toast.error(err.message || 'Xóa người sử dụng thất bại.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Thuong tru':
      case 'Thường trú':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Tam tru':
      case 'Tạm trú':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Lam viec':
      case 'Làm việc':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Da roi di':
      case 'Đã rời đi':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Tam vang':
      case 'Tạm vắng':
        return 'bg-zinc-100 text-zinc-800 border-zinc-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const columns = [
    {
      header: 'Hình ảnh',
      key: 'image',
      render: (res) => {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL
          ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
          : 'http://localhost:3000';

        return (
          <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-100 bg-neutral-50 flex items-center justify-center shadow-sm select-none">
            {res.image ? (
              <img
                src={`${backendUrl}${res.image}`}
                alt={res.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
        );
      }
    },
    {
      header: 'Họ tên',
      key: 'fullName',
      render: (res) => (
        <div className="whitespace-nowrap">
          <p className="font-semibold text-neutral-900 leading-snug">{res.fullName}</p>
          <p className="text-xs text-neutral-400 mt-0.5 font-mono">{res.id}</p>
        </div>
      )
    },
    {
      header: 'CCCD & SĐT',
      key: 'contacts',
      render: (res) => (
        <div className="text-xs space-y-0.5 font-medium text-neutral-600 whitespace-nowrap">
          <div><span className="text-neutral-400">CCCD:</span> {res.nationalId}</div>
          <div><span className="text-neutral-400">SĐT:</span> {res.phoneNumber}</div>
        </div>
      )
    },
    {
      header: 'Chỗ ở & Hợp đồng',
      key: 'residencyDetails',
      render: (res) => (
        <div className="text-xs space-y-1 font-medium text-neutral-600 max-w-xs">
          <div>
            <span className="text-neutral-400">Phòng:</span> <span className="font-semibold text-neutral-800">{res.roomId}</span>
          </div>
          {res.contractDetail?.room?.building?.name && (
            <div className="text-neutral-500 font-semibold truncate" title={res.contractDetail.room.building.name}>
              {res.contractDetail.room.building.name}
            </div>
          )}
          <div>
            <span className="text-neutral-400">HĐ:</span> <span className="font-mono text-neutral-700">{res.contractId}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Loại lưu trú',
      key: 'occupancyType',
      render: (res) => (
        <span className="text-xs font-semibold text-neutral-700 whitespace-nowrap">
          {res.occupancyType}
        </span>
      )
    },
    {
      header: 'Trạng thái',
      key: 'occupancyStatus',
      render: (res) => {
        return (
          <span className={`px-2.5 py-1 text-xs rounded-full font-semibold border whitespace-nowrap inline-block ${getStatusColor(res.occupancyStatus)}`}>
            {res.occupancyStatus}
          </span>
        );
      }
    },
    {
      header: 'Thao tác',
      key: 'actions',
      render: (res) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <Button
            variant="outline"
            size="sm"
            className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
            onClick={() => handleOpenEditModal(res)}
          >
            Sửa
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
            onClick={() => handleDelete(res.id)}
          >
            Xóa
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Quản lý người sử dụng & Thẻ từ</h2>
          <p className="text-slate-500 text-sm mt-1">
            Tra cứu thông tin, quản lý hồ sơ đăng ký tạm trú, thường trú của người sử dụng và khách vãng lai.
          </p>
        </div>
        <Button onClick={handleOpenAddModal} variant="primary" disabled={activeContracts.length === 0}>
          <svg className="w-5 h-5 -ml-1 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Thêm người sử dụng
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-5 bg-white border border-neutral-100 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="search" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Từ khóa</label>
            <input
              type="text"
              id="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Họ tên, SĐT, CCCD..."
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all placeholder-neutral-400 font-medium"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="occupancyType" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Loại lưu trú</label>
            <select
              id="occupancyType"
              value={filters.occupancyType}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all font-medium cursor-pointer"
            >
              <option value="">Tất cả loại</option>
              {Object.values(OCCUPANCY_TYPES).map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="occupancyStatus" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Trạng thái lưu trú</label>
            <select
              id="occupancyStatus"
              value={filters.occupancyStatus}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all font-medium cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              {Object.values(OCCUPANCY_STATUS).map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="w-full h-9 font-semibold hover:bg-neutral-50 cursor-pointer"
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      </Card>

      <Table
        columns={columns}
        data={occupants}
        isLoading={isLoading}
        emptyMessage={activeContracts.length === 0 ? "Vui lòng tạo hợp đồng đang hiệu lực trước khi thêm người sử dụng." : "Không tìm thấy người sử dụng nào."}
      />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
          <p className="text-xs text-neutral-400 font-medium">
            Hiển thị người sử dụng {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} của {pagination.total}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
              className="cursor-pointer"
            >
              Trước
            </Button>
            <span className="text-xs font-semibold text-neutral-700 px-2">
              Trang {pagination.page} / {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="cursor-pointer"
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-neutral-900 text-lg">
                {currentOccupant ? 'Chỉnh sửa thông tin người sử dụng' : 'Thêm người sử dụng mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <Input
                  label="Họ và tên người sử dụng"
                  id="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Nhập đầy đủ họ tên..."
                  required
                  error={fieldErrors.fullName}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Số điện thoại"
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: 0987654321"
                    required
                    error={fieldErrors.phoneNumber}
                  />

                  <Input
                    label="Số CCCD (12 chữ số)"
                    id="nationalId"
                    value={formData.nationalId}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: 037123456789"
                    required
                    error={fieldErrors.nationalId}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Ngày sinh"
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    error={fieldErrors.dateOfBirth}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="gender" className="text-sm font-medium text-slate-700">Giới tính</label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-neutral-900 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="occupancyType" className="text-sm font-medium text-slate-700">Loại lưu trú</label>
                    <select
                      id="occupancyType"
                      value={formData.occupancyType}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-neutral-900 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    >
                      {Object.values(OCCUPANCY_TYPES).map((val) => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="occupancyStatus" className="text-sm font-medium text-slate-700">Trạng thái</label>
                    <select
                      id="occupancyStatus"
                      value={formData.occupancyStatus}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-neutral-900 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    >
                      {Object.values(OCCUPANCY_STATUS).map((val) => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contractId" className="text-sm font-medium text-slate-700">
                      Theo Hợp đồng <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="contractId"
                      value={formData.contractId}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-neutral-900 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all ${fieldErrors.contractId ? 'border-red-500 focus:ring-red-500' : ''}`}
                    >
                      <option value="">-- Chọn hợp đồng --</option>
                      {activeContracts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.id} ({c.customer?.fullName || 'Khách thuê'})
                        </option>
                      ))}
                    </select>
                    {fieldErrors.contractId && (
                      <span className="text-xs text-red-500 font-medium">{fieldErrors.contractId}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="roomId" className="text-sm font-medium text-slate-700">
                      Chọn phòng <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="roomId"
                      value={formData.roomId}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.contractId}
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-neutral-900 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all disabled:bg-neutral-50 disabled:text-neutral-400 ${fieldErrors.roomId ? 'border-red-500 focus:ring-red-500' : ''}`}
                    >
                      <option value="">-- Chọn phòng --</option>
                      {formRooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          Phòng {r.roomNumber}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.roomId && (
                      <span className="text-xs text-red-500 font-medium">{fieldErrors.roomId}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block">Ảnh chân dung chân thật</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border border-neutral-200 bg-neutral-50 flex items-center justify-center shrink-0">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-8 h-8 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      )}
                    </div>
                    <label className="px-4 py-2 border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-700 bg-white hover:bg-neutral-50 cursor-pointer shadow-sm hover:border-neutral-300 transition-all select-none">
                      Chọn ảnh tải lên
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmitting}>
                  {currentOccupant ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
