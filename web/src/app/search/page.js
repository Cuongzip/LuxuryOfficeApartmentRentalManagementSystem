import React from 'react';
import { buildingService } from '@/services/building.service';
import { roomService } from '@/services/room.service';
import { SearchClient } from './SearchClient';

export default async function SearchPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const [bData, rData] = await Promise.all([
    buildingService.getBuildings({ limit: 100 }),
    roomService.getRooms({ limit: 100 }),
  ]);

  const buildings = bData || [];
  const rooms = Array.isArray(rData) ? rData : rData?.data || [];

  return (
    <SearchClient
      initialBuildings={buildings}
      initialRooms={rooms}
      searchParams={resolvedSearchParams}
    />
  );
}
