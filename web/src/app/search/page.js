import React from 'react';
import { buildingService } from '@/services/building.service';
import { SearchClient } from './SearchClient';

export default async function SearchPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const keyword = resolvedSearchParams?.keyword || '';
  const provinceId = resolvedSearchParams?.provinceId || '';
  const wardId = resolvedSearchParams?.wardId || '';

  const bData = await buildingService.getBuildings({
    limit: 100,
    keyword: keyword || undefined,
    provinceId: provinceId || undefined,
    wardId: wardId || undefined,
  });
  const buildings = bData || [];

  return (
    <SearchClient
      initialBuildings={buildings}
      searchParams={resolvedSearchParams}
    />
  );
}
