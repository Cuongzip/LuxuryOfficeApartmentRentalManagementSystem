'use client';

import React, { useEffect, useState } from 'react';
import { buildingService } from '@/services/building.service';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function BuildingsManagement() {
  const [buildings, setBuildings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBuilding, setCurrentBuilding] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    address: '',
    numberOfFloors: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBuildings = async () => {
    setIsLoading(true);
    try {
      const data = await buildingService.getBuildings();
      setBuildings(data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách tòa nhà:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const handleOpenAddModal = () => {
    setCurrentBuilding(null);
    setFormData({
      id: '',
      name: '',
      address: '',
      numberOfFloors: '',
      description: '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (building) => {
    setCurrentBuilding(building);
    setFormData({
      id: building.id,
      name: building.name,
      address: building.address,
      numberOfFloors: String(building.numberOfFloors),
      description: building.description || '',
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
        numberOfFloors: parseInt(formData.numberOfFloors, 10),
      };

      if (currentBuilding) {
        await buildingService.updateBuilding(currentBuilding.id, payload);
      } else {
        await buildingService.createBuilding(payload);
      }

      setIsModalOpen(false);
      fetchBuildings();
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi lưu thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tòa nhà này không?')) return;
    try {
      await buildingService.deleteBuilding(id);
      fetchBuildings();
    } catch (err) {
      alert(err.message || 'Xóa tòa nhà không thành công.');
    }
  };

  const columns = [
    { header: 'Mã tòa nhà', key: 'id' },
    { header: 'Tên tòa nhà', key: 'name' },
    { header: 'Địa chỉ', key: 'address' },
    { header: 'Số tầng', key: 'numberOfFloors' },
    {
      header: 'Thao tác',
      key: 'actions',
      render: (building) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditModal(building);
            }}
          >
            Sửa
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(building.id);
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
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Quản lý tòa nhà</h2>
          <p className="text-slate-500 text-sm mt-1">
            Xem, thêm mới, cập nhật và quản lý danh sách tòa nhà trong hệ thống.
          </p>
        </div>
        <Button onClick={handleOpenAddModal} variant="primary">
          <svg className="w-5 h-5 -ml-1 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Thêm tòa nhà
        </Button>
      </div>

      <Table
        columns={columns}
        data={buildings}
        isLoading={isLoading}
        emptyMessage="Chưa có tòa nhà nào được tạo."
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-neutral-900 text-lg">
                {currentBuilding ? 'Chỉnh sửa tòa nhà' : 'Thêm tòa nhà mới'}
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

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                    {error}
                  </div>
                )}

                <Input
                  label="Mã tòa nhà (Tối đa 10 ký tự)"
                  id="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: TOANHA01"
                  required
                  disabled={!!currentBuilding}
                />

                <Input
                  label="Tên tòa nhà"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Tòa nhà Landmark 81"
                  required
                />

                <Input
                  label="Địa chỉ tòa nhà"
                  id="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP.HCM"
                  required
                />

                <Input
                  label="Số tầng"
                  id="numberOfFloors"
                  type="number"
                  value={formData.numberOfFloors}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 81"
                  required
                  min="1"
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="description" className="text-sm font-medium text-slate-700">
                    Mô tả / Thông tin thêm
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Mô tả các tiện ích của tòa nhà..."
                    className="w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-neutral-900 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all placeholder-neutral-400 h-24 resize-none"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmitting}>
                  {currentBuilding ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
