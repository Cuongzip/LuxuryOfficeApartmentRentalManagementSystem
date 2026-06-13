'use client';

import React, { useEffect, useState } from 'react';
import { roomService } from '@/services/room.service';
import { buildingService } from '@/services/building.service';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/utils/format';
import { getRoomStatus } from '@/constants';

export default function RoomsManagement() {
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null); // null = add new
  const [formData, setFormData] = useState({
    id: '',
    type: 'Văn phòng', // Default
    floor: '',
    area: '',
    price: '',
    status: 'Trống',
    maxPeople: '2',
    description: '',
    buildingId: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const bData = await buildingService.getBuildings();
      const rData = await roomService.getRooms();
      setBuildings(bData || []);
      setRooms(rData || []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu phòng & tòa nhà:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setCurrentRoom(null);
    setFormData({
      id: '',
      type: 'Văn phòng',
      floor: '',
      area: '',
      price: '',
      status: 'Trống',
      maxPeople: '2',
      description: '',
      buildingId: buildings[0]?.id || '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (room) => {
    setCurrentRoom(room);
    setFormData({
      id: room.id,
      type: room.type,
      floor: String(room.floor),
      area: String(room.area),
      price: String(room.price),
      status: room.status,
      maxPeople: String(room.maxPeople),
      description: room.description || '',
      buildingId: room.buildingId,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        floor: parseInt(formData.floor, 10),
        area: parseFloat(formData.area),
        price: parseFloat(formData.price),
        maxPeople: parseInt(formData.maxPeople, 10),
      };

      if (currentRoom) {
        await roomService.updateRoom(currentRoom.id, payload);
      } else {
        await roomService.createRoom(payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi lưu thông tin phòng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phòng này không?')) return;
    try {
      await roomService.deleteRoom(id);
      fetchData();
    } catch (err) {
      alert(err.message || 'Xóa phòng không thành công.');
    }
  };

  const columns = [
    { header: 'Mã phòng', key: 'id' },
    { header: 'Tòa nhà', key: 'buildingName', render: (room) => room.building?.name || room.buildingId },
    { header: 'Loại phòng', key: 'type' },
    { header: 'Tầng', key: 'floor' },
    { header: 'Diện tích', key: 'area', render: (room) => `${room.area} m²` },
    { header: 'Giá thuê', key: 'price', render: (room) => formatCurrency(room.price) },
    {
      header: 'Trạng thái',
      key: 'status',
      render: (room) => {
        const statusCfg = getRoomStatus(room.status);
        return (
          <span className={`px-2.5 py-1 text-xs rounded-full font-medium border ${statusCfg.colorClass}`}>
            {statusCfg.label}
          </span>
        );
      },
    },
    {
      header: 'Thao tác',
      key: 'actions',
      render: (room) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditModal(room);
            }}
          >
            Sửa
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(room.id);
            }}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-blue-950">Quản lý phòng</h2>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý danh mục phòng trống, văn phòng, căn hộ cho thuê thuộc các tòa nhà.
          </p>
        </div>
        <Button onClick={handleOpenAddModal} variant="primary" disabled={buildings.length === 0}>
          <svg className="w-5 h-5 -ml-1 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Thêm phòng
        </Button>
      </div>

      <Table
        columns={columns}
        data={rooms}
        isLoading={isLoading}
        emptyMessage={buildings.length === 0 ? "Vui lòng tạo tòa nhà trước khi tạo phòng." : "Chưa có phòng nào được tạo."}
      />

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-blue-950 text-lg">
                {currentRoom ? 'Chỉnh sửa thông tin phòng' : 'Thêm phòng mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-blue-950 cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                    {error}
                  </div>
                )}

                <Input
                  label="Mã phòng (Tối đa 10 ký tự)"
                  id="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: P.402"
                  required
                  disabled={!!currentRoom}
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="buildingId" className="text-sm font-medium text-slate-700">
                    Thuộc tòa nhà <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="buildingId"
                    value={formData.buildingId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-slate-900 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent transition-all"
                  >
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="type" className="text-sm font-medium text-slate-700">
                      Loại phòng <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-slate-900 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent transition-all"
                    >
                      <option value="Văn phòng">Văn phòng</option>
                      <option value="Căn hộ">Căn hộ</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="status" className="text-sm font-medium text-slate-700">
                      Trạng thái <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-slate-900 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent transition-all"
                    >
                      <option value="Trống">Còn trống</option>
                      <option value="Đã thuê">Đã thuê</option>
                      <option value="Bảo trì">Đang bảo trì</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Tầng"
                    id="floor"
                    type="number"
                    value={formData.floor}
                    onChange={handleInputChange}
                    placeholder="4"
                    required
                    min="0"
                  />

                  <Input
                    label="Diện tích (m²)"
                    id="area"
                    type="number"
                    step="0.01"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="75.5"
                    required
                    min="1"
                  />

                  <Input
                    label="Số người tối đa"
                    id="maxPeople"
                    type="number"
                    value={formData.maxPeople}
                    onChange={handleInputChange}
                    placeholder="4"
                    required
                    min="1"
                  />
                </div>

                <Input
                  label="Đơn giá thuê (VND / Tháng)"
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="15000000"
                  required
                  min="0"
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="description" className="text-sm font-medium text-slate-700">
                    Mô tả phòng
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Chi tiết về nội thất, vị trí phòng..."
                    className="w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-slate-900 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent transition-all placeholder-slate-400 h-24 resize-none"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmitting}>
                  {currentRoom ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
