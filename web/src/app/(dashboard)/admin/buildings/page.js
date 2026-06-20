'use client';

import React, { useEffect, useState } from 'react';
import { buildingService } from '@/services/building.service';
import { locationService } from '@/services/location.service';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { buildingSchema, validateForm } from '@/validators';
import { formatAddress } from '@/utils/format';
import toast from 'react-hot-toast';

export default function BuildingsManagement() {
  const [buildings, setBuildings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBuilding, setCurrentBuilding] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    provinceId: '',
    wardId: '',
    detailAddress: '',
    numberOfFloors: '',
    description: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);

  const [newImageFiles, setNewImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const fetchBuildings = async () => {
    setIsLoading(true);
    try {
      const data = await buildingService.getBuildings({ limit: 10 });
      setBuildings(data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách tòa nhà:', err);
      toast.error('Lỗi khi tải danh sách tòa nhà.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchBuildings();
    });
  }, []);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await locationService.getProvinces();
        setProvinces(data || []);
      } catch (err) {
        console.error('Lỗi khi tải danh sách tỉnh thành:', err);
        toast.error('Lỗi khi tải danh sách tỉnh thành.');
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchWards = async () => {
      if (!formData.provinceId) {
        setWards([]);
        return;
      }
      try {
        const data = await locationService.getWards(formData.provinceId);
        setWards(data || []);
      } catch (err) {
        console.error('Lỗi khi tải danh sách phường xã:', err);
        toast.error('Lỗi khi tải danh sách phường xã.');
      }
    };
    fetchWards();
  }, [formData.provinceId]);

  const handleProvinceChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      provinceId: value,
      wardId: '',
    }));
    if (fieldErrors.provinceId) {
      setFieldErrors((prev) => ({ ...prev, provinceId: '' }));
    }
    if (fieldErrors.wardId) {
      setFieldErrors((prev) => ({ ...prev, wardId: '' }));
    }
  };

  const handleOpenAddModal = () => {
    setCurrentBuilding(null);
    setFormData({
      name: '',
      provinceId: '',
      wardId: '',
      detailAddress: '',
      numberOfFloors: '',
      description: '',
    });
    setNewImageFiles([]);
    setExistingImages([]);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (building) => {
    setCurrentBuilding(building);
    setFormData({
      name: building.name,
      provinceId: building.address?.ward?.provinceId || '',
      wardId: building.address?.wardId || '',
      detailAddress: building.address?.detailAddress || '',
      numberOfFloors: String(building.numberOfFloors),
      description: building.description || '',
    });
    setNewImageFiles([]);
    setExistingImages(building.images || []);
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;
    const errors = [];

    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`Tệp ${file.name} không đúng định dạng (chỉ chấp nhận JPEG, JPG, PNG, WEBP)`);
        return false;
      }
      if (file.size > maxSize) {
        errors.push(`Tệp ${file.name} vượt quá dung lượng cho phép 5MB`);
        return false;
      }
      return true;
    }).map(file => ({
      file,
      isPrimary: false,
      previewUrl: URL.createObjectURL(file)
    }));

    if (errors.length > 0) {
      errors.forEach(err => toast.error(err));
    }

    if (validFiles.length > 0) {
      setNewImageFiles(prev => {
        const hasPrimary = existingImages.some(img => img.isPrimary) || prev.some(img => img.isPrimary);
        const updated = [...prev, ...validFiles];
        if (!hasPrimary && updated.length > 0) {
          updated[0].isPrimary = true;
        }
        return updated;
      });
    }
  };

  const handleRemoveNewImage = (index) => {
    setNewImageFiles(prev => {
      const target = prev[index];
      if (target.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      const updated = prev.filter((_, i) => i !== index);
      if (target.isPrimary && updated.length > 0) {
        updated[0].isPrimary = true;
      } else if (target.isPrimary && existingImages.length > 0) {
        setExistingImages(existing => {
          const next = [...existing];
          if (next.length > 0) next[0].isPrimary = true;
          return next;
        });
      }
      return updated;
    });
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages(prev => {
      const target = prev[index];
      const updated = prev.filter((_, i) => i !== index);
      if (target.isPrimary && updated.length > 0) {
        updated[0].isPrimary = true;
      } else if (target.isPrimary && newImageFiles.length > 0) {
        setNewImageFiles(newFiles => {
          const next = [...newFiles];
          if (next.length > 0) next[0].isPrimary = true;
          return next;
        });
      }
      return updated;
    });
  };

  const handleSetPrimary = (type, index) => {
    if (type === 'existing') {
      setExistingImages(prev =>
        prev.map((img, i) => ({ ...img, isPrimary: i === index }))
      );
      setNewImageFiles(prev =>
        prev.map(item => ({ ...item, isPrimary: false }))
      );
    } else {
      setExistingImages(prev =>
        prev.map(img => ({ ...img, isPrimary: false }))
      );
      setNewImageFiles(prev =>
        prev.map((item, i) => ({ ...item, isPrimary: i === index }))
      );
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
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('wardId', formData.wardId);
      formDataToSend.append('detailAddress', formData.detailAddress);
      formDataToSend.append('numberOfFloors', parseInt(formData.numberOfFloors, 10));
      formDataToSend.append('description', formData.description || '');

      newImageFiles.forEach(item => {
        formDataToSend.append('images', item.file);
      });

      if (currentBuilding) {
        const existingImagesPayload = existingImages.map(img => ({
          imagePath: img.imagePath,
          displayOrder: img.displayOrder,
          isPrimary: img.isPrimary,
        }));
        formDataToSend.append('existingImages', JSON.stringify(existingImagesPayload));
      }

      if (currentBuilding) {
        await buildingService.updateBuilding(currentBuilding.id, formDataToSend);
        toast.success('Cập nhật tòa nhà thành công!');
      } else {
        await buildingService.createBuilding(formDataToSend);
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
    {
      header: 'Hình ảnh',
      key: 'images',
      render: (building) => {
        const primaryImage = building.images?.find(img => img.isPrimary) || building.images?.[0];
        const backendUrl = process.env.NEXT_PUBLIC_API_URL
          ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
          : 'http://localhost:3000';

        return (
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-neutral-100 bg-neutral-50 flex items-center justify-center">
            {primaryImage ? (
              <img
                src={`${backendUrl}${primaryImage.imagePath}`}
                alt={building.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-6 h-6 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21V18.75m0 0V16.5m0 2.25h2.25m-2.25 0H17.25m-12.5-1.5c0-.621.504-1.125 1.125-1.125h9.75c.621 0 1.125.504 1.125 1.125v3.5c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125v-3.5zM3.75 6v7.5c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V6m-12 0h12m-12 0a1.125 1.125 0 011.125-1.125h9.75c.621 0 1.125.504 1.125 1.125M2.25 21h19.5" />
              </svg>
            )}
          </div>
        );
      }
    },
    { header: 'Mã tòa nhà', key: 'id' },
    { header: 'Tên tòa nhà', key: 'name' },
    {
      header: 'Địa chỉ',
      key: 'address',
      render: (building) => formatAddress(building.address),
    },
    { header: 'Số tầng', key: 'numberOfFloors' },
    {
      header: 'Thao tác',
      key: 'actions',
      render: (building) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditModal(building);
            }}
          >
            Sửa
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
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
              <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">

                <Input
                  label="Tên tòa nhà"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Tòa nhà Landmark 81"
                  required
                  error={fieldErrors.name}
                />

                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="provinceId" className="text-sm font-medium text-slate-700">
                    Tỉnh / Thành phố *
                  </label>
                  <select
                    id="provinceId"
                    value={formData.provinceId}
                    onChange={handleProvinceChange}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-neutral-900 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all ${
                      fieldErrors.provinceId ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  >
                    <option value="">Chọn Tỉnh / Thành phố</option>
                    {provinces.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.provinceId && (
                    <span className="text-xs text-red-500 font-medium">{fieldErrors.provinceId}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="wardId" className="text-sm font-medium text-slate-700">
                    Phường / Xã *
                  </label>
                  <select
                    id="wardId"
                    value={formData.wardId}
                    onChange={handleInputChange}
                    disabled={!formData.provinceId}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-neutral-900 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all disabled:bg-neutral-50 disabled:text-neutral-400 ${
                      fieldErrors.wardId ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  >
                    <option value="">Chọn Phường / Xã</option>
                    {wards.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.wardId && (
                    <span className="text-xs text-red-500 font-medium">{fieldErrors.wardId}</span>
                  )}
                </div>

                <Input
                  label="Địa chỉ chi tiết (Số nhà, tên đường...) *"
                  id="detailAddress"
                  value={formData.detailAddress}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 720A Điện Biên Phủ"
                  required
                  error={fieldErrors.detailAddress}
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block">
                    Hình ảnh tòa nhà
                  </label>

                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-200 hover:border-brand rounded-xl cursor-pointer bg-neutral-50 hover:bg-neutral-100/50 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 text-neutral-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs font-semibold text-neutral-600">Click hoặc kéo thả ảnh để tải lên</p>
                        <p className="text-[10px] text-neutral-400 mt-1">JPEG, JPG, PNG, WEBP (Tối đa 5MB/ảnh)</p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {(existingImages.length > 0 || newImageFiles.length > 0) && (
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      {existingImages.map((img, index) => {
                        const backendUrl = process.env.NEXT_PUBLIC_API_URL
                          ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
                          : 'http://localhost:3000';
                        const fullUrl = `${backendUrl}${img.imagePath}`;

                        return (
                          <div key={`existing-${index}`} className="relative aspect-video rounded-lg overflow-hidden border border-neutral-200 group">
                            <img src={fullUrl} alt="Existing" className="w-full h-full object-cover" />

                            <button
                              type="button"
                              onClick={() => handleRemoveExistingImage(index)}
                              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>

                            <div className="absolute bottom-1 left-1 right-1">
                              {img.isPrimary ? (
                                <span className="block text-center text-[9px] font-bold bg-brand text-white py-0.5 rounded shadow-sm select-none">
                                  Ảnh chính
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimary('existing', index)}
                                  className="w-full text-center text-[9px] font-bold bg-black/60 hover:bg-black/80 text-white py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                  Đặt làm ảnh chính
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {newImageFiles.map((item, index) => {
                        return (
                          <div key={`new-${index}`} className="relative aspect-video rounded-lg overflow-hidden border border-neutral-200 group ring-1 ring-emerald-500/30">
                            <img src={item.previewUrl} alt="New upload" className="w-full h-full object-cover" />

                            <span className="absolute top-1 left-1 text-[8px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded shadow-sm">
                              Mới
                            </span>

                            <button
                              type="button"
                              onClick={() => handleRemoveNewImage(index)}
                              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>

                            <div className="absolute bottom-1 left-1 right-1">
                              {item.isPrimary ? (
                                <span className="block text-center text-[9px] font-bold bg-brand text-white py-0.5 rounded shadow-sm select-none">
                                  Ảnh chính
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimary('new', index)}
                                  className="w-full text-center text-[9px] font-bold bg-black/60 hover:bg-black/80 text-white py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                  Đặt làm ảnh chính
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
