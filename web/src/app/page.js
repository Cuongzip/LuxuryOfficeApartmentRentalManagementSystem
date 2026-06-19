import React from 'react';
import { buildingService } from '@/services/building.service';
import { roomService } from '@/services/room.service';
import { HomeClient } from '@/components/home/HomeClient';

export const metadata = {
  title: 'PrimeSpace - Cho thuê Văn phòng & Căn hộ cao cấp',
  description: 'Hệ thống quản lý và cho thuê văn phòng làm việc, căn hộ chung cư cao cấp. Trải nghiệm tìm kiếm và đặt thuê trực tuyến dễ dàng.',
};

export default async function PublicHome() {
  let buildings = [];
  let rooms = [];

  try {
    const [bData, rData] = await Promise.all([
      buildingService.getBuildings({ limit: 1000 }),
      roomService.getRooms({ limit: 1000 }),
    ]);
    buildings = bData || [];
    rooms = Array.isArray(rData) ? rData : rData?.data || [];
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu trang chủ trên server:', err);
  }

  return (
    <HomeClient
      initialBuildings={buildings}
      initialRooms={rooms}
    />
  );
}
