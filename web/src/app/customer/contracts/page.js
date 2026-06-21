'use client';

import React, { useEffect, useState } from 'react';
import { contractService } from '@/services/contract.service';
import { Table } from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/utils/format';
import { CONTRACT_STATUS, CONTRACT_STATUS_COLORS } from '@/constants/contracts';
import toast from 'react-hot-toast';

export default function CustomerContracts() {
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedContract, setSelectedContract] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const fetchContracts = async () => {
    setIsLoading(true);
    try {
      const res = await contractService.getContracts({
        status: statusFilter || undefined,
        limit: 1000,
      });
      setContracts(res?.data || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast.error('Lỗi khi tải danh sách hợp đồng.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [statusFilter]);

  const handleViewDetails = async (contract) => {
    setSelectedContract(contract);
    setIsDetailsOpen(true);
    setIsDetailsLoading(true);
    try {
      const detailed = await contractService.getContractById(contract.id);
      setSelectedContract(detailed);
    } catch (error) {
      console.error('Error loading contract details:', error);
      toast.error('Lỗi khi tải chi tiết hợp đồng.');
    } finally {
      setIsDetailsLoading(false);
    }
  };

  // Helper functions to get lease duration from details
  const getContractStart = (c) => {
    if (!c || !c.contractDetails || c.contractDetails.length === 0) return null;
    const dates = c.contractDetails.map(d => new Date(d.startDate).getTime());
    return new Date(Math.min(...dates));
  };

  const getContractEnd = (c) => {
    if (!c || !c.contractDetails || c.contractDetails.length === 0) return null;
    const dates = c.contractDetails.map(d => new Date(d.endDate).getTime());
    return new Date(Math.max(...dates));
  };

  const columns = [
    {
      header: 'Mã hợp đồng',
      key: 'id',
      render: (c) => <span className="font-bold text-neutral-900">{c.id}</span>,
    },
    {
      header: 'Ngày bắt đầu',
      key: 'startDate',
      render: (c) => formatDate(getContractStart(c)),
    },
    {
      header: 'Ngày kết thúc',
      key: 'endDate',
      render: (c) => formatDate(getContractEnd(c)),
    },
    {
      header: 'Tiền đặt cọc',
      key: 'deposit',
      render: (c) => formatCurrency(c.deposit),
    },
    {
      header: 'Trạng thái',
      key: 'status',
      render: (c) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${CONTRACT_STATUS_COLORS[c.status] || 'bg-neutral-100 text-neutral-800'}`}>
          {c.status}
        </span>
      ),
    },
    {
      header: 'Thao tác',
      key: 'action',
      render: (c) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails(c);
          }}
          className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-xs border border-neutral-200/50"
        >
          Xem chi tiết
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Hợp đồng của tôi</h2>
        <p className="text-neutral-500 text-xs mt-1">
          Theo dõi thời hạn thuê, tiền đặt cọc và các căn hộ, văn phòng bạn đang thuê.
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
              Tất cả hợp đồng
            </button>
            {Object.values(CONTRACT_STATUS).map((status) => (
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

        {/* Contracts Table */}
        <Table
          columns={columns}
          data={contracts}
          isLoading={isLoading}
          onRowClick={handleViewDetails}
          emptyMessage="Bạn chưa ký kết hợp đồng thuê nào trong hệ thống."
        />
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedContract(null);
        }}
        title={`Chi tiết hợp đồng: ${selectedContract?.id || ''}`}
        size="lg"
      >
        {isDetailsLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-2">
            <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-neutral-500">Đang tải chi tiết hợp đồng...</p>
          </div>
        ) : selectedContract ? (
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            {/* General details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 bg-neutral-50/50 p-5 rounded-2xl border border-neutral-200/50">
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Ngày bắt đầu thuê (Tổng):</span>
                  <span className="font-semibold text-neutral-800">{formatDate(getContractStart(selectedContract))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Ngày kết thúc thuê (Tổng):</span>
                  <span className="font-semibold text-neutral-800">{formatDate(getContractEnd(selectedContract))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Ngày lập hợp đồng:</span>
                  <span className="font-semibold text-neutral-800">{formatDate(selectedContract.createdDate || selectedContract.createdAt)}</span>
                </div>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Tiền đặt cọc:</span>
                  <span className="font-bold text-neutral-900">{formatCurrency(selectedContract.deposit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Trạng thái hợp đồng:</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold border text-[10px] ${CONTRACT_STATUS_COLORS[selectedContract.status]}`}>
                    {selectedContract.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Nhân viên phụ trách:</span>
                  <span className="font-semibold text-neutral-800">{selectedContract.employee?.fullName || 'Đang cập nhật'}</span>
                </div>
              </div>
            </div>

            {/* Rented room specs */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Danh sách bất động sản thuê</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(selectedContract.contractDetails || []).map((detail, idx) => (
                  <div key={idx} className="p-4 border border-neutral-200/80 bg-white rounded-xl shadow-xs space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-neutral-950 text-base">Phòng {detail.room?.roomNumber}</h4>
                        <p className="text-xs text-neutral-500 leading-snug">{detail.room?.building?.name || 'Tòa nhà'}</p>
                      </div>
                      <span className="px-2.5 py-0.5 bg-brand/5 border border-brand/10 text-brand text-[10px] font-bold rounded">
                        {detail.room?.type || 'Văn phòng'}
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs text-neutral-600 mt-2 border-t border-neutral-100 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500 font-medium">Giá thỏa thuận:</span>
                        <strong className="text-neutral-900 font-bold text-sm">
                          {formatCurrency(detail.agreedPrice)} <span className="text-[10px] text-neutral-400 font-normal">/ tháng</span>
                        </strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500 font-medium">Diện tích:</span>
                        <span className="font-semibold text-neutral-800">{detail.room?.area} m²</span>
                      </div>
                      <div className="flex flex-col gap-1.5 mt-1 pt-2 border-t border-dashed border-neutral-100">
                        <span className="text-neutral-500 font-medium">Thời hạn thuê phòng:</span>
                        <span className="font-semibold text-neutral-800 bg-neutral-50 border border-neutral-200/60 rounded px-2.5 py-1.5 text-center font-mono inline-block">
                          {formatDate(detail.startDate)} &mdash; {formatDate(detail.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Service checklist */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Dịch vụ đang đăng ký</h3>
              <div className="border border-neutral-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 font-semibold">
                      <th className="px-4 py-2.5">Tên dịch vụ</th>
                      <th className="px-4 py-2.5">Phòng sử dụng</th>
                      <th className="px-4 py-2.5">Đơn giá</th>
                      <th className="px-4 py-2.5">Số lượng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-600 bg-white">
                    {(() => {
                      const rows = (selectedContract.contractDetails || []).flatMap(detail =>
                        (detail.roomServices || []).map((rs, rsIdx) => (
                          <tr key={`${detail.roomId}-${rsIdx}`}>
                            <td className="px-4 py-2.5 font-medium text-neutral-800">{rs.service?.name}</td>
                            <td className="px-4 py-2.5">Phòng {detail.room?.roomNumber}</td>
                            <td className="px-4 py-2.5">{formatCurrency(rs.service?.currentPrice)} / {rs.service?.unit}</td>
                            <td className="px-4 py-2.5">{rs.quantity}</td>
                          </tr>
                        ))
                      );
                      return rows.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-4 py-4 text-center text-neutral-400 italic bg-white">
                            Chỉ sử dụng Điện, Nước và các dịch vụ cơ bản của tòa nhà.
                          </td>
                        </tr>
                      ) : rows;
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
