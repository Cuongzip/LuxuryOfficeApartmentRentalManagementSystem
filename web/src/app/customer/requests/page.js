'use client';

import React, { useEffect, useState } from 'react';
import { requestService } from '@/services/request.service';
import { Table } from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { REQUEST_STATUS, REQUEST_STATUS_COLORS } from '@/constants/requests';
import toast from 'react-hot-toast';

export default function CustomerRequests() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await requestService.getRequests({
        status: statusFilter || undefined,
        limit: 1000,
      });
      setRequests(res?.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Lỗi khi tải danh sách yêu cầu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleViewDetails = (req) => {
    setSelectedRequest(req);
    setIsDetailsOpen(true);
  };

  const handleCancelRequest = async (reqId) => {
    const confirmCancel = window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn xem phòng này không?');
    if (!confirmCancel) return;

    setIsCancelling(true);
    try {
      await requestService.updateRequestStatus(reqId, REQUEST_STATUS.CANCELLED);
      toast.success('Hủy lịch hẹn thành công.');
      setIsDetailsOpen(false);
      fetchRequests();
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error(error.message || 'Lỗi khi hủy lịch hẹn.');
    } finally {
      setIsCancelling(false);
    }
  };

  const columns = [
    {
      header: 'Mã lịch hẹn',
      key: 'id',
      render: (req) => <span className="font-bold text-neutral-900">{req.id}</span>,
    },
    {
      header: 'Tòa nhà',
      key: 'building',
      render: (req) => <span>{req.room?.building?.name || 'Tòa nhà'}</span>,
    },
    {
      header: 'Phòng xem',
      key: 'roomNumber',
      render: (req) => <span className="font-semibold text-neutral-800">Phòng {req.room?.roomNumber}</span>,
    },
    {
      header: 'Thời gian hẹn',
      key: 'appointmentDate',
      render: (req) => <span className="font-medium">{formatDateTime(req.appointmentDate)}</span>,
    },
    {
      header: 'Trạng thái',
      key: 'status',
      render: (req) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${REQUEST_STATUS_COLORS[req.status] || 'bg-neutral-100 text-neutral-800'}`}>
          {req.status}
        </span>
      ),
    },
    {
      header: 'Thao tác',
      key: 'action',
      render: (req) => {
        const canCancel = req.status === REQUEST_STATUS.PENDING;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewDetails(req)}
              className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-neutral-200/50 shadow-xs"
            >
              Chi tiết
            </button>
            {canCancel && (
              <button
                disabled={isCancelling}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelRequest(req.id);
                }}
                className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/55 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Hủy hẹn
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
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Yêu cầu xem phòng</h2>
        <p className="text-neutral-500 text-xs mt-1">
          Quản lý danh sách các lịch hẹn xem căn hộ, văn phòng bạn đã đăng ký với hệ thống.
        </p>
      </div>

      <Card className="p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                statusFilter === ''
                  ? 'bg-brand text-white border-brand'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              Tất cả yêu cầu
            </button>
            {Object.values(REQUEST_STATUS).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-brand text-white border-brand'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Requests Table */}
        <Table
          columns={columns}
          data={requests}
          isLoading={isLoading}
          onRowClick={handleViewDetails}
          emptyMessage="Bạn chưa tạo lịch hẹn xem phòng nào."
        />
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedRequest(null);
        }}
        title={`Chi tiết lịch hẹn: ${selectedRequest?.id || ''}`}
        size="md"
      >
        {selectedRequest && (
          <div className="space-y-5">
            {/* Info details list */}
            <div className="space-y-3 bg-neutral-50 p-5 rounded-2xl border border-neutral-200/50 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Tòa nhà:</span>
                <strong className="text-neutral-800">{selectedRequest.room?.building?.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Địa chỉ:</span>
                <span className="font-semibold text-neutral-600">{selectedRequest.room?.building?.address?.detailAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Phòng hẹn xem:</span>
                <strong className="text-neutral-800">Phòng {selectedRequest.room?.roomNumber} ({selectedRequest.room?.type})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Giá phòng công bố:</span>
                <strong className="text-neutral-900">{formatCurrency(selectedRequest.room?.price)} / tháng</strong>
              </div>
              <div className="flex justify-between border-t border-neutral-200/50 pt-2.5 mt-2.5">
                <span className="text-neutral-500 font-bold">Thời gian hẹn xem:</span>
                <strong className="text-brand text-sm">{formatDateTime(selectedRequest.appointmentDate)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Trạng thái:</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold border text-[10px] ${REQUEST_STATUS_COLORS[selectedRequest.status]}`}>
                  {selectedRequest.status}
                </span>
              </div>
              {selectedRequest.employee && (
                <div className="flex justify-between border-t border-neutral-200/50 pt-2.5">
                  <span className="text-neutral-500">Nhân viên hỗ trợ:</span>
                  <span className="font-semibold text-neutral-800">{selectedRequest.employee.fullName} ({selectedRequest.employee.phoneNumber})</span>
                </div>
              )}
            </div>

            {/* Note content */}
            <div className="space-y-1.5 text-xs text-left">
              <h4 className="font-semibold text-neutral-500 uppercase tracking-wider">Lời nhắn/Ghi chú của bạn</h4>
              <p className="p-4 border border-neutral-200 bg-white rounded-xl text-neutral-700 leading-relaxed font-medium whitespace-pre-wrap">
                {selectedRequest.content || 'Không có ghi chú.'}
              </p>
            </div>

            {/* Action buttons */}
            {selectedRequest.status === REQUEST_STATUS.PENDING && (
              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsDetailsOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => handleCancelRequest(selectedRequest.id)}
                  className="px-5 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Hủy yêu cầu hẹn
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
