'use client';

import React, { useEffect, useState } from 'react';
import { roomService } from '@/services/room.service';
import { buildingService } from '@/services/building.service';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/utils/format';
import { ROOM_STATUS, ROOM_STATUS_COLORS, ROOM_TYPES } from '@/constants';
import { roomSchema, validateForm } from '@/validators';
import toast from 'react-hot-toast';

export default function RoomsManagement() {
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    type: ROOM_TYPES.OFFICE,
    floor: '',
    area: '',
    price: '',
    maxPeople: 2,
    status: ROOM_STATUS.AVAILABLE,
    description: '',
    buildingId: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newImageFiles, setNewImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const bData = await buildingService.getBuildings({ limit: 1000 });
      const rData = await roomService.getRooms({ limit: 1000 });
      setBuildings(bData || []);
      setRooms(rData || []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu phòng & tòa nhà:', err);
      toast.error('Lỗi khi tải dữ liệu phòng & tòa nhà.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchData();
    });
  }, []);

  const handleOpenAddModal = () => {
    setCurrentRoom(null);
    setFormData({
      roomNumber: '',
      type: ROOM_TYPES.OFFICE,
      floor: '',
      area: '',
      price: '',
      status: ROOM_STATUS.AVAILABLE,
      maxPeople: '2',
      description: '',
      buildingId: buildings[0]?.id || '',
    });
    setNewImageFiles([]);
    setExistingImages([]);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (room) => {
    setCurrentRoom(room);
    setFormData({
      roomNumber: room.roomNumber || '',
      type: room.type,
      floor: String(room.floor),
      area: String(room.area),
      price: String(room.price),
      status: room.status,
      maxPeople: String(room.maxPeople),
      description: room.description || '',
      buildingId: room.buildingId,
    });
    setNewImageFiles([]);
    setExistingImages(room.images || []);
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

    const validation = validateForm(roomSchema, formData);
    if (!validation.success) {
      setFieldErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('roomNumber', formData.roomNumber);
      formDataToSend.append('buildingId', formData.buildingId);
      formDataToSend.append('floor', parseInt(formData.floor, 10));
      formDataToSend.append('type', formData.type);
      formDataToSend.append('area', parseFloat(formData.area));
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('status', formData.status);
      formDataToSend.append('maxPeople', parseInt(formData.maxPeople, 10));
      formDataToSend.append('description', formData.description || '');

      newImageFiles.forEach(item => {
        formDataToSend.append('images', item.file);
      });

      if (currentRoom) {
        const existingImagesPayload = existingImages.map(img => ({
          imagePath: img.imagePath,
          displayOrder: img.displayOrder,
          isPrimary: img.isPrimary,
        }));
        formDataToSend.append('existingImages', JSON.stringify(existingImagesPayload));
      }

      if (currentRoom) {
        await roomService.updateRoom(currentRoom.id, formDataToSend);
        toast.success('Cập nhật thông tin phòng thành công!');
      } else {
        await roomService.createRoom(formDataToSend);
        toast.success('Thêm phòng mới thành công!');
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      if (err.errors) {
        setFieldErrors(err.errors);
      } else {
        toast.error(err.message || 'Có lỗi xảy ra khi lưu thông tin phòng.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phòng này không?')) return;
    try {
      await roomService.deleteRoom(id);
      toast.success('Xóa phòng thành công!');
      fetchData();
    } catch (err) {
      const errorMsg = err.message || 'Xóa phòng không thành công.';
      toast.error(errorMsg);
    }
  };

  const columns = [
    {
      header: 'Hình ảnh',
      key: 'images',
      render: (room) => {
        const primaryImage = room.images?.find(img => img.isPrimary) || room.images?.[0];
        const backendUrl = process.env.NEXT_PUBLIC_API_URL
          ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
          : 'http://localhost:3000';

        return (
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-neutral-100 bg-neutral-50 flex items-center justify-center">
            {primaryImage ? (
              <img
                src={`${backendUrl}${primaryImage.imagePath}`}
                alt={room.roomNumber}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-6 h-6 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            )}
          </div>
        );
      }
    },
    { header: 'Số phòng', key: 'roomNumber' },
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
        const label = room.status || 'Chưa rõ';
        const colorClass = ROOM_STATUS_COLORS[label] || 'bg-zinc-100 text-zinc-800 border-zinc-200';
        return (
          <span className={`px-2.5 py-1 text-xs rounded-full font-medium border ${colorClass}`}>
            {label}
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
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Quản lý phòng</h2>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-neutral-900 text-lg">
                {currentRoom ? 'Chỉnh sửa thông tin phòng' : 'Thêm phòng mới'}
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
                  label="Số phòng (Tối đa 10 ký tự)"
                  id="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 402, 501"
                  required
                  error={fieldErrors.roomNumber}
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
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-neutral-900 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all ${fieldErrors.buildingId ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                  >
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.buildingId && (
                    <span className="text-xs text-red-500 font-medium">{fieldErrors.buildingId}</span>
                  )}
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
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-neutral-900 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all ${fieldErrors.type ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                    >
                      {Object.values(ROOM_TYPES).map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {fieldErrors.type && (
                      <span className="text-xs text-red-500 font-medium">{fieldErrors.type}</span>
                    )}
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
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-neutral-900 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all ${fieldErrors.status ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                    >
                      {Object.values(ROOM_STATUS).map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    {fieldErrors.status && (
                      <span className="text-xs text-red-500 font-medium">{fieldErrors.status}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Tầng"
                    id="floor"
                    type="number"
                    value={formData.floor}
                    onChange={handleInputChange}
                    required
                    error={fieldErrors.floor}
                  />

                  <Input
                    label="Diện tích (m²)"
                    id="area"
                    type="number"
                    step="0.01"
                    value={formData.area}
                    onChange={handleInputChange}
                    required
                    error={fieldErrors.area}
                  />

                  <Input
                    label="Số người tối đa"
                    id="maxPeople"
                    type="number"
                    value={formData.maxPeople}
                    onChange={handleInputChange}
                    required
                    error={fieldErrors.maxPeople}
                  />
                </div>

                <Input
                  label="Đơn giá thuê (VND / Tháng)"
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  error={fieldErrors.price}
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
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white text-neutral-900 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all placeholder-neutral-400 h-24 resize-none ${fieldErrors.description ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                  />
                  {fieldErrors.description && (
                    <span className="text-xs text-red-500 font-medium">{fieldErrors.description}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block">
                    Hình ảnh phòng
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
