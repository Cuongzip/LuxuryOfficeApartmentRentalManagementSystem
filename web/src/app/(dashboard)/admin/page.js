'use client';

import React, { useEffect, useState } from 'react';
import { buildingService } from '@/services/building.service';
import { roomService } from '@/services/room.service';
import { Card } from '@/components/ui/Card';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    buildingsCount: 0,
    roomsCount: 0,
    availableCount: 0,
    rentedCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const buildings = await buildingService.getBuildings({ limit: 10 });
        const rooms = await roomService.getRooms({ limit: 10 });

        const totalB = buildings?.length || 0;
        const totalR = rooms?.length || 0;

        let avail = 0;
        let rented = 0;

        rooms?.forEach(room => {
          const status = room.status?.toLowerCase();
          if (status?.includes('trống') || status?.includes('avail') || status?.includes('trong')) {
            avail++;
          } else if (status?.includes('thuê') || status?.includes('rent') || status?.includes('thue')) {
            rented++;
          }
        });

        setStats({
          buildingsCount: totalB,
          roomsCount: totalR,
          availableCount: avail,
          rentedCount: rented || (totalR - avail > 0 ? totalR - avail : 0),
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Tổng số tòa nhà',
      value: stats.buildingsCount,
      icon: (
        <svg className="w-6 h-6 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      description: 'Tòa nhà văn phòng & căn hộ quản lý',
    },
    {
      title: 'Tổng số phòng',
      value: stats.roomsCount,
      icon: (
        <svg className="w-6 h-6 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      description: 'Bao gồm cả căn hộ và văn phòng',
    },
    {
      title: 'Phòng đã thuê',
      value: stats.rentedCount,
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: `Đang tạo nguồn doanh thu (${stats.roomsCount ? Math.round((stats.rentedCount / stats.roomsCount) * 100) : 0}% lấp đầy)`,
    },
    {
      title: 'Phòng còn trống',
      value: stats.availableCount,
      icon: (
        <svg className="w-6 h-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      ),
      description: 'Sẵn sàng để bàn giao cho khách hàng',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Tổng quan hệ thống</h2>
          <p className="text-neutral-500 text-sm mt-1">
            Số liệu thống kê thời gian thực từ dữ liệu Luxury Rental.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <Card key={idx} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">{card.title}</p>
                {isLoading ? (
                  <div className="h-9 w-12 bg-neutral-100 animate-pulse rounded mt-2"></div>
                ) : (
                  <p className="text-3xl font-extrabold text-neutral-900 mt-2 tracking-tight">
                    {card.value}
                  </p>
                )}
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100">
                {card.icon}
              </div>
            </div>
            <p className="text-xs text-neutral-400 mt-4 leading-relaxed">{card.description}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Phân khúc phòng dịch vụ" className="lg:col-span-2">
          <div className="h-64 flex items-center justify-center border border-dashed border-neutral-200 rounded-lg text-neutral-400 text-sm bg-neutral-50/20">
            Biểu đồ tỷ lệ phân khúc căn hộ và văn phòng
          </div>
        </Card>

        <Card title="Yêu cầu dịch vụ mới nhất">
          <div className="space-y-4">
            <div className="p-3 bg-neutral-50 rounded-lg text-sm border border-neutral-100">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-neutral-800">Sửa chữa máy điều hòa</span>
                <span className="px-2 py-0.5 text-xs rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">Chờ duyệt</span>
              </div>
              <p className="text-xs text-neutral-500 mb-2">Phòng P.402 - Toà nhà Landmark</p>
              <p className="text-xs text-neutral-400">Yêu cầu từ: Anh Nguyễn Văn Bình</p>
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg text-sm border border-neutral-100">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-neutral-800">Kiểm tra đường truyền internet</span>
                <span className="px-2 py-0.5 text-xs rounded bg-brand/10 text-brand border border-brand/20 font-medium">Đang xử lý</span>
              </div>
              <p className="text-xs text-neutral-500 mb-2">Phòng P.1205 - Toà nhà Luxury Tower</p>
              <p className="text-xs text-neutral-400">Yêu cầu từ: Công ty Cổ phần Techcom</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
