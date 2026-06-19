'use client';

import React, { useEffect, useState } from 'react';
import { contractService } from '@/services/contract.service';
import { roomService } from '@/services/room.service';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/utils/format';
import { getContractStatus, CONTRACT_STATUS } from '@/constants/contracts';
import { getRoomStatus, ROOM_STATUS } from '@/constants/rooms';

export default function ManagerDashboard() {
  const [stats, setStats] = useState({
    totalContracts: 0,
    activeContracts: 0,
    expiredContracts: 0,
    availableRooms: 0,
  });
  const [recentContracts, setRecentContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const contractsRes = await contractService.getContracts({ limit: 1000 });
        const roomsRes = await roomService.getRooms({ limit: 1000 });

        const contractsList = contractsRes?.data || [];
        const roomsList = roomsRes || [];

        let active = 0;
        let expired = 0;
        contractsList.forEach(c => {
          const statusCfg = getContractStatus(c.status);
          if (statusCfg.value === CONTRACT_STATUS.ACTIVE.value) {
            active++;
          } else if (statusCfg.value === CONTRACT_STATUS.EXPIRED.value) {
            expired++;
          }
        });

        let available = 0;
        roomsList.forEach(r => {
          const statusCfg = getRoomStatus(r.status);
          if (statusCfg.value === ROOM_STATUS.AVAILABLE.value) {
            available++;
          }
        });

        setStats({
          totalContracts: contractsList.length,
          activeContracts: active,
          expiredContracts: expired,
          availableRooms: available,
        });

        const sorted = [...contractsList]
          .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
          .slice(0, 5);
        setRecentContracts(sorted);

      } catch (error) {
        console.error('Error fetching manager dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    Promise.resolve().then(() => {
      fetchDashboardData();
    });
  }, []);

  const statCards = [
    {
      title: 'Tổng số hợp đồng',
      value: stats.totalContracts,
      icon: (
        <svg className="w-6 h-6 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      description: 'Hợp đồng thuê căn hộ & văn phòng',
    },
    {
      title: 'Hợp đồng hiệu lực',
      value: stats.activeContracts,
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Đang tạo doanh thu cho thuê',
    },
    {
      title: 'Hợp đồng hết hạn',
      value: stats.expiredContracts,
      icon: (
        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Cần gia hạn hoặc làm thủ tục trả phòng',
    },
    {
      title: 'Số phòng còn trống',
      value: stats.availableRooms,
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      description: 'Sẵn sàng để giới thiệu cho khách thuê mới',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Tổng quan quản lý cho thuê</h2>
        <p className="text-neutral-500 text-sm mt-1">
          Số liệu thống kê và danh sách hoạt động gần đây của các hợp đồng thuê.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <Card key={idx} className="p-6 bg-white border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
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
        <Card title="Hợp đồng mới thiết lập" className="lg:col-span-2 p-6">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-10 bg-neutral-50 animate-pulse rounded-lg"></div>
              <div className="h-10 bg-neutral-50 animate-pulse rounded-lg"></div>
              <div className="h-10 bg-neutral-50 animate-pulse rounded-lg"></div>
            </div>
          ) : recentContracts.length === 0 ? (
            <div className="h-48 flex items-center justify-center border border-dashed border-neutral-200 rounded-lg text-neutral-400 text-sm">
              Chưa ghi nhận hợp đồng thuê mới nào.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {recentContracts.map((c) => (
                <div key={c.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-800 text-sm">{c.id}</span>
                      <span className={`px-2 py-0.5 text-[10px] rounded border font-medium ${getContractStatus(c.status).colorClass}`}>
                        {getContractStatus(c.status).value}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Phòng: {c.contractDetails?.[0]?.room?.roomNumber || c.contractDetails?.[0]?.roomId} • Khách hàng: {c.customer?.fullName}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-bold text-neutral-900">
                      {formatCurrency(c.deposit)}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      Lập ngày: {formatDate(c.createdDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Phím tắt chức năng" className="p-6">
          <div className="space-y-3">
            <a
              href="/manager/contracts"
              className="flex items-center justify-between p-3.5 bg-neutral-50/50 hover:bg-brand/5 border border-neutral-100 rounded-xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white border border-neutral-100 text-brand group-hover:bg-brand group-hover:text-white transition-all shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">Danh sách hợp đồng</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">Xem & quản lý tất cả hợp đồng</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-brand group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>

            <a
              href="/manager/contracts"
              className="flex items-center justify-between p-3.5 bg-neutral-50/50 hover:bg-emerald-50 border border-neutral-100 rounded-xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white border border-neutral-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">Lập hợp đồng mới</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">Tạo hợp đồng thuê mới</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
