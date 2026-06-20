import React from 'react';
import { buildingService } from '@/services/building.service';
import { roomService } from '@/services/room.service';
import { BuildingDetailClient } from './BuildingDetailClient';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const building = await buildingService.getBuildingById(id);
    if (building) {
      return {
        title: `${building.name} - Chi tiết tòa nhà | PrimeSpace`,
        description: building.description || `Xem chi tiết thông tin, hình ảnh và diện tích cho thuê tại tòa nhà ${building.name}.`,
      };
    }
  } catch (error) {
    // Ignore error, return default metadata
  }

  return {
    title: 'Chi tiết tòa nhà | PrimeSpace',
    description: 'Chi tiết thông tin tòa nhà cho thuê văn phòng và căn hộ cao cấp.',
  };
}

export default async function BuildingDetailPage({ params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  let building = null;
  let rooms = [];

  try {
    const [bData, rData] = await Promise.all([
      buildingService.getBuildingById(id),
      roomService.getRooms({ buildingId: id, limit: 1000 })
    ]);
    building = bData;
    rooms = Array.isArray(rData) ? rData : rData?.data || [];
  } catch (error) {
    console.error(`Error loading details/rooms for building ${id}:`, error);
    // If one fails, try to load at least the building details
    try {
      building = await buildingService.getBuildingById(id);
    } catch (e) {
      console.error(`Fallback fetch also failed for building ${id}:`, e);
    }
  }

  return (
    <BuildingDetailClient
      initialBuilding={building}
      initialRooms={rooms}
      buildingId={id}
    />
  );
}
