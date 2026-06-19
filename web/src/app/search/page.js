import React from 'react';
import { buildingService } from '@/services/building.service';
import { roomService } from '@/services/room.service';
import { SearchClient } from './SearchClient';

export default async function SearchPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  let buildings = [];
  let rooms = [];

  try {
    const [bData, rData] = await Promise.all([
      buildingService.getBuildings({ limit: 100 }),
      roomService.getRooms({ limit: 100 }),
    ]);

    buildings = bData || [];
    rooms = Array.isArray(rData) ? rData : rData?.data || [];
  } catch (err) {
    console.error(err);
  }

  return (
    <SearchClient
      initialBuildings={buildings}
      initialRooms={rooms}
      searchParams={resolvedSearchParams}
    />
  );
}
