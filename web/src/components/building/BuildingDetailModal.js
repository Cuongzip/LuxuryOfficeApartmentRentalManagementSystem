import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { getRoomStatus } from '@/constants';
import { formatCurrency } from '@/utils/format';

export const BuildingDetailModal = ({
  isOpen,
  onClose,
  building,
  buildingRooms,
  isLoadingRooms,
}) => {
  if (!building) return null;

  const backendUrl = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
    : 'http://localhost:3000';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi tiết tòa nhà: ${building.name}`}
      size="xl"
      className="max-w-4xl"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 text-neutral-900 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              <strong className="text-neutral-900 font-semibold">Địa chỉ:</strong> {building.address}
            </p>
            <p className="text-sm text-slate-600">
              <strong className="text-neutral-900 font-semibold">Số tầng:</strong> {building.numberOfFloors} tầng
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong className="text-neutral-900 font-semibold block mb-1">Mô tả:</strong>
              {building.description || 'Không có mô tả.'}
            </p>
          </div>

          {building.images && building.images.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-bold text-neutral-950">Hình ảnh tòa nhà:</p>
              <div className="grid grid-cols-2 gap-2">
                {building.images.map((img, idx) => (
                  <div key={idx} className="aspect-video rounded-lg overflow-hidden border border-neutral-200">
                    <img src={`${backendUrl}${img.imagePath}`} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 pt-4 border-t border-neutral-100">
          <h4 className="font-bold text-neutral-900 text-base">Danh sách phòng của tòa nhà</h4>

          {isLoadingRooms ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : buildingRooms.length === 0 ? (
            <p className="text-sm text-neutral-500 italic">Hiện tại chưa có phòng nào trong tòa nhà này.</p>
          ) : (
            <div className="overflow-x-auto border border-neutral-200 rounded-xl">
              <table className="min-w-full divide-y divide-neutral-200 text-sm bg-white">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700">Hình ảnh</th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700">Số phòng</th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700">Loại phòng</th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700">Tầng</th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700">Diện tích</th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700">Giá thuê</th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700">Số người tối đa</th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white">
                  {buildingRooms.map((room) => {
                    const roomPrimaryImage = room.images?.find(img => img.isPrimary) || room.images?.[0];
                    const statusCfg = getRoomStatus(room.status);

                    return (
                      <tr key={room.id} className="hover:bg-neutral-50/50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="w-10 h-10 rounded overflow-hidden border border-neutral-100 bg-neutral-50 flex items-center justify-center">
                            {roomPrimaryImage ? (
                              <img
                                src={`${backendUrl}${roomPrimaryImage.imagePath}`}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <svg className="w-5 h-5 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                              </svg>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-neutral-900">{room.roomNumber}</td>
                        <td className="px-4 py-3 text-neutral-600">{room.type}</td>
                        <td className="px-4 py-3 text-neutral-600">{room.floor}</td>
                        <td className="px-4 py-3 text-neutral-600">{room.area} m²</td>
                        <td className="px-4 py-3 font-medium text-neutral-900">{formatCurrency(room.price)}</td>
                        <td className="px-4 py-3 text-neutral-600">{room.maxPeople}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium border ${statusCfg.colorClass}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
