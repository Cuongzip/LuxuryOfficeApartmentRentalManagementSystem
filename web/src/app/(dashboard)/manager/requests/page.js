'use client';

import React, { useEffect, useState } from 'react';
import { requestService } from '@/services/request.service';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format';
import { REQUEST_STATUS, REQUEST_STATUS_COLORS, REQUEST_TYPES } from '@/constants/requests';
import toast from 'react-hot-toast';

export default function RequestsManagement() {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    status: '',
    requestType: '',
    page: 1,
    limit: 10,
  });

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0,
  });

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const queryParams = {
        ...filters,
        status: filters.status || undefined,
        requestType: filters.requestType || undefined,
      };

      const data = await requestService.getRequests(queryParams);
      setRequests(data || []);
      
      // Fetch all requests without pagination to calculate stats
      const allData = await requestService.getRequests({ limit: 1000 });
      if (allData) {
        let pending = 0;
        let approved = 0;
        let completed = 0;
        let rejected = 0;
        allData.forEach((req) => {
          if (req.status === REQUEST_STATUS.PENDING) pending++;
          else if (req.status === REQUEST_STATUS.APPROVED) approved++;
          else if (req.status === REQUEST_STATUS.COMPLETED) completed++;
          else if (req.status === REQUEST_STATUS.REJECTED || req.status === REQUEST_STATUS.CANCELLED) rejected++;
        });

        setStats({
          total: allData.length,
          pending,
          approved,
          completed,
          rejected,
        });
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách yêu cầu:', err);
      toast.error('Không thể tải danh sách yêu cầu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchRequests();
    });
  }, [filters]);

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters((prev) => ({ ...prev, [id]: value, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      requestType: '',
      page: 1,
      limit: 10,
    });
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      await requestService.updateRequestStatus(id, newStatus);
      toast.success(`Cập nhật trạng thái yêu cầu thành công!`);
      if (selectedRequest?.id === id) {
        setIsDetailModalOpen(false);
        setSelectedRequest(null);
      }
      fetchRequests();
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
      toast.error(err.message || 'Cập nhật trạng thái yêu cầu thất bại.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const columns = [
    {
      header: 'Mã Yêu Cầu',
      key: 'id',
      render: (req) => <span className="font-bold text-neutral-900">{req.id}</span>,
    },
    {
      header: 'Khách Hàng',
      key: 'customer',
      render: (req) => (
        <div className="space-y-0.5">
          <p className="font-bold text-neutral-900">{req.customer?.fullName || 'Chưa rõ'}</p>
          <p className="text-xs text-slate-500">{req.customer?.phoneNumber || 'N/A'}</p>
        </div>
      ),
    },
    {
      header: 'Phòng & Tòa Nhà',
      key: 'room',
      render: (req) => (
        <div className="space-y-0.5">
          <p className="font-bold text-neutral-900">
            Phòng {req.room?.roomNumber || req.roomId} - {req.room?.type || ''}
          </p>
          <p className="text-xs text-slate-500">{req.room?.building?.name || 'N/A'}</p>
        </div>
      ),
    },
    {
      header: 'Loại Yêu Cầu',
      key: 'requestType',
      render: (req) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200 whitespace-nowrap">
          {req.requestType}
        </span>
      ),
    },
    {
      header: 'Thời Gian Hẹn',
      key: 'appointmentDate',
      render: (req) => (
        <span className="font-medium text-neutral-900">
          {req.appointmentDate ? formatDate(req.appointmentDate) : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Trạng Thái',
      key: 'status',
      render: (req) => {
        const colorClass = REQUEST_STATUS_COLORS[req.status] || 'bg-zinc-100 text-zinc-800 border-zinc-200';
        return (
          <span className={`px-2.5 py-1 text-xs rounded-full font-medium border whitespace-nowrap ${colorClass}`}>
            {req.status}
          </span>
        );
      },
    },
    {
      header: 'Thao Tác',
      key: 'actions',
      render: (req) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            className="border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            onClick={() => {
              setSelectedRequest(req);
              setIsDetailModalOpen(true);
            }}
          >
            Chi tiết
          </Button>

          {req.status === REQUEST_STATUS.PENDING && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                onClick={() => handleUpdateStatus(req.id, REQUEST_STATUS.APPROVED)}
                disabled={isUpdatingStatus}
              >
                Chấp nhận
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                onClick={() => handleUpdateStatus(req.id, REQUEST_STATUS.REJECTED)}
                disabled={isUpdatingStatus}
              >
                Từ chối
              </Button>
            </>
          )}

          {req.status === REQUEST_STATUS.APPROVED && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                onClick={() => handleUpdateStatus(req.id, REQUEST_STATUS.COMPLETED)}
                disabled={isUpdatingStatus}
              >
                Hoàn tất
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                onClick={() => handleUpdateStatus(req.id, REQUEST_STATUS.REJECTED)}
                disabled={isUpdatingStatus}
              >
                Từ chối
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Quản lý yêu cầu</h2>
        <p className="text-slate-500 text-sm mt-1">
          Xem lịch hẹn xem phòng của khách hàng và cập nhật tiến độ xử lý.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="p-6 bg-white border border-neutral-100 flex items-center gap-4">
          <div className="p-3 bg-neutral-50 border border-neutral-200 text-neutral-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Tổng yêu cầu</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.total}</p>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-neutral-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Chờ duyệt</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.pending}</p>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-neutral-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Đã chấp nhận</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.approved}</p>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-neutral-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Đã hoàn tất</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.completed}</p>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-neutral-100 flex items-center gap-4">
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Từ chối / Hủy</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.rejected}</p>
          </div>
        </Card>
      </div>

      {/* Filter Controls */}
      <Card className="p-5 bg-white border border-neutral-100">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="status" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Trạng thái
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            >
              <option value="">Tất cả trạng thái</option>
              {Object.values(REQUEST_STATUS).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="requestType" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Loại yêu cầu
            </label>
            <select
              id="requestType"
              value={filters.requestType}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            >
              <option value="">Tất cả loại yêu cầu</option>
              {Object.values(REQUEST_TYPES).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="w-full h-[38px]"
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      </Card>

      {/* Requests Table */}
      <Table
        columns={columns}
        data={requests}
        isLoading={isLoading}
        emptyMessage="Không tìm thấy yêu cầu nào."
      />

      {/* Request Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi tiết yêu cầu xem phòng"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-6 text-neutral-900 text-left">
            <div className="max-h-[60vh] overflow-y-auto pr-1.5 space-y-5">
              <div className="grid grid-cols-2 gap-4 border-b border-neutral-100 pb-4">
                <div>
                  <span className="block text-xs text-neutral-400 font-bold uppercase tracking-wider">Mã yêu cầu:</span>
                  <span className="font-extrabold text-neutral-800 text-base">{selectedRequest.id}</span>
                </div>
                <div>
                  <span className="block text-xs text-neutral-400 font-bold uppercase tracking-wider">Trạng thái:</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border mt-1 ${
                    REQUEST_STATUS_COLORS[selectedRequest.status]
                  }`}>
                    {selectedRequest.status}
                  </span>
                </div>
              </div>

              {/* Customer Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-neutral-800 uppercase tracking-wide border-b border-neutral-100 pb-1.5 text-left">
                  Thông tin khách hàng
                </h4>
                <div className="bg-slate-50/50 border border-neutral-200/80 p-4 rounded-xl space-y-2.5 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-200/50 last:pb-0 last:border-0">
                    <span className="text-neutral-400 font-medium">Họ và tên:</span>
                    <span className="font-bold text-neutral-800">{selectedRequest.customer?.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-200/50 last:pb-0 last:border-0">
                    <span className="text-neutral-400 font-medium">Số điện thoại:</span>
                    <span className="font-bold text-neutral-800">{selectedRequest.customer?.phoneNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Room Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-neutral-800 uppercase tracking-wide border-b border-neutral-100 pb-1.5 text-left">
                  Thông tin phòng đặt xem
                </h4>
                <div className="bg-slate-50/50 border border-neutral-200/80 p-4 rounded-xl space-y-2.5 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-200/50 last:pb-0 last:border-0">
                    <span className="text-neutral-400 font-medium">Số phòng:</span>
                    <span className="font-bold text-neutral-800">Phòng {selectedRequest.room?.roomNumber}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-200/50 last:pb-0 last:border-0">
                    <span className="text-neutral-400 font-medium">Thuộc tòa nhà:</span>
                    <span className="font-bold text-neutral-800">{selectedRequest.room?.building?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-200/50 last:pb-0 last:border-0">
                    <span className="text-neutral-400 font-medium">Loại phòng:</span>
                    <span className="font-bold text-neutral-800">{selectedRequest.room?.type}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-200/50 last:pb-0 last:border-0">
                    <span className="text-neutral-400 font-medium">Đơn giá thuê:</span>
                    <span className="font-bold text-brand">{formatCurrency(selectedRequest.room?.price)}</span>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-neutral-800 uppercase tracking-wide border-b border-neutral-100 pb-1.5 text-left">
                  Lịch hẹn & Ghi chú
                </h4>
                <div className="bg-slate-50/50 border border-neutral-200/80 p-4 rounded-xl space-y-2.5 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-200/50 last:pb-0 last:border-0">
                    <span className="text-neutral-400 font-medium">Ngày giờ hẹn xem:</span>
                    <span className="font-bold text-neutral-850">{formatDateTime(selectedRequest.appointmentDate)}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 pt-1.5 text-left">
                    <span className="text-neutral-400 font-medium">Ghi chú của khách hàng:</span>
                    <p className="bg-white border border-neutral-200/60 p-3 rounded-lg text-neutral-700 italic whitespace-pre-line leading-relaxed mt-0.5">
                      {selectedRequest.content || 'Không có ghi chú nào.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Manager In Charge */}
              {selectedRequest.employee && (
                <div className="space-y-2.5 bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Nhân viên phụ trách:</span>
                  <span className="font-bold text-neutral-800">{selectedRequest.employee.fullName}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2.5 pt-4 border-t border-neutral-100">
              {selectedRequest.status === REQUEST_STATUS.PENDING && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => handleUpdateStatus(selectedRequest.id, REQUEST_STATUS.REJECTED)}
                    disabled={isUpdatingStatus}
                  >
                    Từ chối yêu cầu
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleUpdateStatus(selectedRequest.id, REQUEST_STATUS.APPROVED)}
                    disabled={isUpdatingStatus}
                  >
                    Duyệt chấp nhận
                  </Button>
                </>
              )}

              {selectedRequest.status === REQUEST_STATUS.APPROVED && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => handleUpdateStatus(selectedRequest.id, REQUEST_STATUS.REJECTED)}
                    disabled={isUpdatingStatus}
                  >
                    Hủy lịch hẹn
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleUpdateStatus(selectedRequest.id, REQUEST_STATUS.COMPLETED)}
                    disabled={isUpdatingStatus}
                  >
                    Hoàn tất xem phòng
                  </Button>
                </>
              )}

              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
