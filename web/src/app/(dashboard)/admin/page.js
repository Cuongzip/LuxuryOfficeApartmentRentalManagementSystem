'use client';

import React, { useEffect, useState } from 'react';
import { buildingService } from '@/services/building.service';
import { statisticsService } from '@/services/statistics.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDateInput } from '@/utils/format';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  
  // Default range: from Jan 1st of current year to today
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(formatDateInput(new Date()));

  // Stats states
  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    byMonth: [],
    byBuilding: [],
    byService: [],
    byRoom: []
  });

  const [contractStats, setContractStats] = useState({
    totalCreated: 0,
    activeCount: 0,
    expiredCount: 0,
    cancelledCount: 0,
    trend: []
  });

  const [roomStats, setRoomStats] = useState({
    total: 0,
    available: 0,
    rented: 0,
    maintenance: 0,
    occupancyRate: 0,
    byBuilding: []
  });

  const [isLoading, setIsLoading] = useState(true);

  // Fetch building list for filter dropdown
  const fetchBuildings = async () => {
    try {
      const data = await buildingService.getBuildings({ limit: 1000 });
      setBuildings(data || []);
    } catch (error) {
      console.error('Error fetching buildings:', error);
    }
  };

  // Fetch all stats based on selected filters
  const fetchStatistics = async () => {
    setIsLoading(true);
    try {
      const filterParams = {
        buildingId: selectedBuilding || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const [revenueData, contractData, roomData] = await Promise.all([
        statisticsService.getRevenueStatistics(filterParams),
        statisticsService.getContractStatistics({ startDate: filterParams.startDate, endDate: filterParams.endDate }),
        statisticsService.getRoomStatistics({ buildingId: filterParams.buildingId }),
      ]);

      if (revenueData) setRevenueStats(revenueData);
      if (contractData) setContractStats(contractData);
      if (roomData) setRoomStats(roomData);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Lỗi khi tải dữ liệu thống kê báo cáo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [selectedBuilding, startDate, endDate]);

  const handleResetFilters = () => {
    setSelectedBuilding('');
    setStartDate(`${currentYear}-01-01`);
    setEndDate(formatDateInput(new Date()));
  };

  // Find max monthly revenue to scale the CSS bar heights properly
  const maxMonthRevenue = revenueStats.byMonth.reduce((max, item) => Math.max(max, Number(item.amount)), 0) || 1;

  // Find max service revenue to scale horizontal service progress bars
  const maxServiceRevenue = revenueStats.byService.reduce((max, item) => Math.max(max, Number(item.amount)), 0) || 1;

  // Find max building revenue to scale horizontal building progress bars
  const maxBuildingRevenue = revenueStats.byBuilding.reduce((max, item) => Math.max(max, Number(item.amount)), 0) || 1;

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-left">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Thống kê & Báo cáo</h2>
          <p className="text-neutral-500 text-sm mt-1">
            Theo dõi tổng quan doanh thu, tình trạng phòng và hiệu suất hợp đồng thời gian thực.
          </p>
        </div>
      </div>

      {/* Modern Glassmorphic Filter Bar */}
      <Card className="p-5 bg-white border border-neutral-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="building" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Tòa nhà</label>
            <select
              id="building"
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all cursor-pointer font-medium"
            >
              <option value="">Tất cả tòa nhà</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="startDate" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Từ ngày</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all font-medium"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="endDate" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Đến ngày</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all font-medium"
            />
          </div>

          <div>
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="w-full h-10 font-semibold border-neutral-200 hover:bg-neutral-50 transition-all active:scale-[0.98] cursor-pointer"
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue KPI */}
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-md transition-all hover:translate-y-[-2px] duration-300">
          <div className="flex justify-between items-start">
            <div className="text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-100">Doanh thu thực nhận</p>
              {isLoading ? (
                <div className="h-9 w-24 bg-white/20 animate-pulse rounded mt-2"></div>
              ) : (
                <p className="text-2xl font-extrabold mt-2 tracking-tight">
                  {formatCurrency(revenueStats.totalRevenue)}
                </p>
              )}
            </div>
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md">
              <svg className="w-6 h-6 text-indigo-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-6 flex items-center text-xs text-indigo-200">
            <span>Từ hóa đơn đã thu tiền trong kỳ</span>
          </div>
        </div>

        {/* Occupancy Rate KPI */}
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-teal-500 via-emerald-600 to-emerald-700 text-white shadow-md transition-all hover:translate-y-[-2px] duration-300">
          <div className="flex justify-between items-start">
            <div className="text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-100">Tỷ lệ lấp đầy</p>
              {isLoading ? (
                <div className="h-9 w-20 bg-white/20 animate-pulse rounded mt-2"></div>
              ) : (
                <p className="text-3xl font-extrabold mt-2 tracking-tight">
                  {roomStats.occupancyRate}%
                </p>
              )}
            </div>
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md">
              <svg className="w-6 h-6 text-teal-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div className="mt-6 flex items-center text-xs text-teal-200">
            <span>{roomStats.rented} đã thuê / {roomStats.total} tổng số phòng</span>
          </div>
        </div>

        {/* Contract Trend KPI */}
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 text-white shadow-md transition-all hover:translate-y-[-2px] duration-300">
          <div className="flex justify-between items-start">
            <div className="text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-100">Hợp đồng mới lập</p>
              {isLoading ? (
                <div className="h-9 w-16 bg-white/20 animate-pulse rounded mt-2"></div>
              ) : (
                <p className="text-3xl font-extrabold mt-2 tracking-tight">
                  {contractStats.totalCreated}
                </p>
              )}
            </div>
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md">
              <svg className="w-6 h-6 text-amber-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-6 flex items-center text-xs text-amber-100 gap-2">
            <span>Hiệu lực: {contractStats.activeCount}</span>
            <span>•</span>
            <span>Hủy/Hết hạn: {contractStats.cancelledCount + contractStats.expiredCount}</span>
          </div>
        </div>

        {/* Room Size KPI */}
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-slate-600 via-slate-700 to-neutral-800 text-white shadow-md transition-all hover:translate-y-[-2px] duration-300">
          <div className="flex justify-between items-start">
            <div className="text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-200">Tổng quy mô phòng</p>
              {isLoading ? (
                <div className="h-9 w-16 bg-white/20 animate-pulse rounded mt-2"></div>
              ) : (
                <p className="text-3xl font-extrabold mt-2 tracking-tight">
                  {roomStats.total}
                </p>
              )}
            </div>
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md">
              <svg className="w-6 h-6 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
          </div>
          <div className="mt-6 flex items-center text-xs text-slate-300 gap-2">
            <span className="text-emerald-300 font-semibold">Trống: {roomStats.available}</span>
            <span>•</span>
            <span className="text-amber-300 font-semibold">Bảo trì: {roomStats.maintenance}</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Monthly Revenue Bar Chart & Breakdown Table */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between" title="Biểu đồ doanh thu hàng tháng">
          {isLoading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : revenueStats.byMonth.length === 0 ? (
            <div className="h-72 flex items-center justify-center border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50 text-neutral-400 text-sm">
              Không có dữ liệu doanh thu trong khoảng thời gian này.
            </div>
          ) : (
            <div className="space-y-8">
              {/* CSS-based Bar Chart */}
              <div className="h-64 flex flex-col justify-between mt-4">
                <div className="h-52 flex items-end justify-around gap-2 px-4 border-b border-neutral-200/80 pb-2">
                  {revenueStats.byMonth.map((item) => {
                    const barHeight = Math.max(4, Math.round((Number(item.amount) / maxMonthRevenue) * 100));
                    return (
                      <div key={item.month} className="h-full flex flex-col justify-end items-center flex-1 max-w-[50px] group relative">
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-neutral-950 text-white text-[11px] font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                          Doanh thu: {formatCurrency(item.amount)}
                        </div>
                        {/* Interactive Bar */}
                        <div
                          className="w-full bg-gradient-to-t from-indigo-500 to-brand hover:from-indigo-600 hover:to-brand-hover rounded-t-lg transition-all duration-300 ease-out"
                          style={{ height: `${barHeight}%` }}
                        ></div>
                      </div>
                    );
                  })}
                </div>
                {/* Monthly Labels Row */}
                <div className="flex justify-around gap-2 px-4">
                  {revenueStats.byMonth.map((item) => (
                    <div key={item.month} className="flex-1 max-w-[50px] text-center">
                      <span className="text-[10px] text-neutral-400 font-bold whitespace-nowrap">
                        {item.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto rounded-xl border border-neutral-100 bg-white">
                <table className="min-w-full divide-y divide-neutral-100 text-sm text-left">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-neutral-600">Tháng</th>
                      <th className="px-4 py-3 font-semibold text-neutral-600 text-right">Doanh thu nhận được</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {revenueStats.byMonth.slice().reverse().map((item) => (
                      <tr key={item.month} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-4 py-3 text-neutral-700 font-medium">{item.month}</td>
                        <td className="px-4 py-3 text-neutral-900 font-bold text-right">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>

        {/* Right Column - Revenue by Service & Building Breakdown */}
        <div className="space-y-6">
          
          {/* Revenue share by Service */}
          <Card className="p-6 text-left" title="Doanh thu theo dịch vụ">
            {isLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : revenueStats.byService.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-neutral-400 text-xs italic">
                Không có dữ liệu
              </div>
            ) : (
              <div className="space-y-4 py-2">
                {revenueStats.byService.map((item, idx) => {
                  const percent = Math.round((Number(item.amount) / maxServiceRevenue) * 100);
                  const colorClass = [
                    'bg-indigo-500',
                    'bg-emerald-500',
                    'bg-amber-500',
                    'bg-sky-500',
                    'bg-purple-500'
                  ][idx % 5];
                  
                  return (
                    <div key={item.service} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-neutral-700">
                        <span>{item.service}</span>
                        <span className="font-bold text-neutral-900">{formatCurrency(item.amount)}</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`${colorClass} h-full rounded-full`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Revenue share by Building */}
          <Card className="p-6 text-left" title="Doanh thu theo tòa nhà">
            {isLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : revenueStats.byBuilding.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-neutral-400 text-xs italic">
                Không có dữ liệu
              </div>
            ) : (
              <div className="space-y-4 py-2">
                {revenueStats.byBuilding.map((item, idx) => {
                  const percent = Math.round((Number(item.amount) / maxBuildingRevenue) * 100);
                  
                  return (
                    <div key={item.building} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-neutral-700">
                        <span>{item.building}</span>
                        <span className="font-bold text-neutral-900">{formatCurrency(item.amount)}</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-brand h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Building Occupancy Matrix */}
      <Card className="p-6 text-left" title="Tỷ lệ thuê của từng tòa nhà">
        {isLoading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : roomStats.byBuilding.length === 0 ? (
          <div className="py-8 flex items-center justify-center text-neutral-400 text-sm">
            Không có dữ liệu thống kê tòa nhà.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {roomStats.byBuilding.map((b) => (
              <div key={b.buildingId} className="p-4 rounded-xl border border-neutral-100 bg-neutral-50/30 hover:bg-neutral-50/80 transition-all flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-neutral-800 text-sm">{b.buildingName}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    Lấp đầy: {b.occupancyRate}%
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="w-full bg-neutral-200/60 h-2.5 rounded-full overflow-hidden flex">
                    <div className="bg-teal-500 h-full" style={{ width: `${b.occupancyRate}%` }} title="Đã thuê"></div>
                    <div className="bg-amber-400 h-full" style={{ width: `${b.total > 0 ? (b.maintenance / b.total) * 100 : 0}%` }} title="Bảo trì"></div>
                  </div>

                  <div className="flex justify-between text-[11px] font-medium text-neutral-500">
                    <span>Đang thuê: <strong>{b.rented}</strong></span>
                    <span>Sẵn sàng: <strong>{b.available}</strong></span>
                    <span>Bảo trì: <strong>{b.maintenance}</strong></span>
                    <span>Tổng: <strong>{b.total}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
