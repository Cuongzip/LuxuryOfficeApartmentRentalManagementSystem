'use client';

import React, { useEffect, useState } from 'react';
import { buildingService } from '@/services/building.service';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { buildingSchema, validateForm } from '@/validators';
import toast from 'react-hot-toast';

export default function BuildingsManagement() {
  const [buildings, setBuildings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBuilding, setCurrentBuilding] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    numberOfFloors: '',
    description: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBuildings = async () => {
    setIsLoading(true);
    try {
      const data = await buildingService.getBuildings({ limit: 10 });
      setBuildings(data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách tòa nhà:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchBuildings();
    });
  }, []);

  const handleOpenAddModal = () => {
    setCurrentBuilding(null);
    setFormData({
      name: '',
      address: '',
      numberOfFloors: '',
      description: '',
    });
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (building) => {
    setCurrentBuilding(building);
    setFormData({
      name: building.name,
      address: building.address,
      numberOfFloors: String(building.numberOfFloors),
      description: building.description || '',
    });
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (fieldErrors[id]) {
      setFieldErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const validation = validateForm(buildingSchema, formData);
    if (!validation.success) {
      setFieldErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        numberOfFloors: parseInt(formData.numberOfFloors, 10),
      };

      if (currentBuilding) {
        await buildingService.updateBuilding(currentBuilding.id, payload);
        toast.success('Cập nhật tòa nhà thành công!');
      } else {
        await buildingService.createBuilding(payload);
        toast.success('Thêm mới tòa nhà thành công!');
      }

      setIsModalOpen(false);
      fetchBuildings();
    } catch (err) {
      if (err.errors) {
        setFieldErrors(err.errors);
      } else {
        toast.error(err.message || 'Có lỗi xảy ra khi lưu thông tin.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tòa nhà này không?')) return;
    try {
      await buildingService.deleteBuilding(id);
      toast.success('Xóa tòa nhà thành công!');
      fetchBuildings();
    } catch (err) {
      const errorMsg = err.message || 'Xóa tòa nhà không thành công.';
      toast.error(errorMsg);
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

            <form onSubmit={handleSubmit} noValidate>
              <div className="p-6 space-y-4">

                <Input
                  label="Tên tòa nhà"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Tòa nhà Landmark 81"
                  required
                  error={fieldErrors.name}
                />

                <Input
                  label="Địa chỉ tòa nhà"
                  id="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP.HCM"
                  required
                  error={fieldErrors.address}
                />

                <Input
                  label="Số tầng"
                  id="numberOfFloors"
                  type="number"
                  value={formData.numberOfFloors}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 81"
                  required
                  error={fieldErrors.numberOfFloors}
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
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-neutral-900 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all placeholder-neutral-400 h-24 resize-none ${fieldErrors.description ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                  />
                  {fieldErrors.description && (
                    <span className="text-xs text-red-500 font-medium">{fieldErrors.description}</span>
                  )}
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
