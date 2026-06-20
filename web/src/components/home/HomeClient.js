'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getRoomStatus } from '@/constants';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { HomeBanner } from '@/components/home/HomeBanner';
import { BuildingDetailModal } from '@/components/building/BuildingDetailModal';
import { roomService } from '@/services/room.service';
import { locationService } from '@/services/location.service';
import { formatCurrency, formatAddress } from '@/utils/format';
import toast from 'react-hot-toast';

export function HomeClient({ initialBuildings, initialRooms }) {
  const router = useRouter();
  const { user, logout, openLogin, openRegister } = useAuth();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [draftCity, setDraftCity] = useState('');
  const [draftWard, setDraftWard] = useState('');

  const [tempCity, setTempCity] = useState('');
  const [tempWard, setTempWard] = useState('');

  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [appliedCity, setAppliedCity] = useState('');
  const [appliedWard, setAppliedWard] = useState('');

  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildingRooms, setBuildingRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);



  const [cities, setCities] = useState([]);

  const [wards, setWards] = useState([]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await locationService.getProvinces();
        setCities(data || []);
      } catch (err) {
        console.error('Lỗi khi tải danh sách tỉnh thành:', err);
        toast.error('Lỗi khi tải danh sách tỉnh thành.');
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchWards = async () => {
      if (!tempCity) {
        setWards([]);
        return;
      }
      try {
        const data = await locationService.getWards(tempCity);
        setWards(data || []);
      } catch (err) {
        console.error('Lỗi khi tải danh sách phường xã:', err);
        toast.error('Lỗi khi tải danh sách phường xã.');
      }
    };
    fetchWards();
  }, [tempCity]);

  const filteredBuildings = initialBuildings.filter((building) => {
    if (appliedKeyword.trim()) {
      const kw = appliedKeyword.toLowerCase();
      const matchName = building.name.toLowerCase().includes(kw);
      const matchAddress = formatAddress(building.address).toLowerCase().includes(kw);
      if (!matchName && !matchAddress) return false;
    }

    if (appliedCity && building.address?.ward?.provinceId !== appliedCity) return false;
    if (appliedWard && building.address?.wardId !== appliedWard) return false;

    return true;
  });

  const handleViewDetail = async (building) => {
    if (!user) {
      openLogin();
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `${window.location.pathname}?showLogin=true`);
      }
      return;
    }

    setSelectedBuilding(building);
    setIsLoadingRooms(true);
    try {
      const roomsData = await roomService.getRooms({ buildingId: building.id, limit: 1000 });
      setBuildingRooms(roomsData || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách phòng của tòa nhà:', err);
      toast.error('Không thể tải danh sách phòng.');
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const handleSearch = (overrideCity, overrideWard) => {
    const params = new URLSearchParams();
    const city = overrideCity !== undefined ? overrideCity : draftCity;
    const ward = overrideWard !== undefined ? overrideWard : draftWard;

    if (searchKeyword) params.set('keyword', searchKeyword);
    if (city) params.set('provinceId', city);
    if (ward) params.set('wardId', ward);
    router.push(`/search?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSearchKeyword('');
    setTempCity('');
    setTempWard('');
    setDraftCity('');
    setDraftWard('');
    setAppliedKeyword('');
    setAppliedCity('');
    setAppliedWard('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-neutral-900 font-sans selection:bg-brand selection:text-white">
      <PublicHeader
        user={user}
        logout={logout}
        onLoginClick={() => {
          openLogin();
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', `${window.location.pathname}?showLogin=true`);
          }
        }}
        onRegisterClick={() => {
          openRegister();
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', `${window.location.pathname}?showRegister=true`);
          }
        }}
      />

      <main className="flex-1 flex flex-col">
        <HomeBanner
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
          draftCity={draftCity}
          setDraftCity={setDraftCity}
          draftWard={draftWard}
          setDraftWard={setDraftWard}
          tempCity={tempCity}
          setTempCity={setTempCity}
          tempWard={tempWard}
          setTempWard={setTempWard}
          cities={cities}
          wards={wards}
          handleSearch={handleSearch}
        />

        <section id="buildings" className="py-16 px-8 md:px-16 bg-neutral-50/50 border-b border-neutral-100">
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between border-b border-neutral-200 pb-6">
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">Danh sách Tòa nhà cho thuê</h2>
              </div>
              {(appliedKeyword || appliedCity || appliedWard) && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 md:mt-0 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-1.5 cursor-pointer bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-full"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Xóa bộ lọc tìm kiếm
                </button>
              )}
            </div>

            {filteredBuildings.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-sm bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
                Không tìm thấy tòa nhà nào phù hợp với bộ lọc tìm kiếm.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBuildings.map((building) => {
                  const primaryImage = building.images?.find(img => img.isPrimary) || building.images?.[0];
                  const backendUrl = process.env.NEXT_PUBLIC_API_URL
                    ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
                    : 'http://localhost:3000';
                  const imgUrl = primaryImage ? `${backendUrl}${primaryImage.imagePath}` : '/images/banner.jpg';

                  return (
                    <div
                      key={building.id}
                      className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col text-left"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
                        <img
                          src={imgUrl}
                          alt={building.name}
                          className="w-full h-full object-cover hover:scale-102 transition-transform duration-500"
                        />
                        <span className="absolute top-3 right-3 bg-brand text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-sm select-none">
                          {building.numberOfFloors} tầng
                        </span>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h3
                            onClick={() => handleViewDetail(building)}
                            className="font-extrabold text-neutral-900 text-base md:text-lg hover:text-brand transition-colors cursor-pointer line-clamp-1"
                          >
                            {building.name}
                          </h3>
                          <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{formatAddress(building.address)}</span>
                          </p>
                          <p className="text-neutral-600 text-xs line-clamp-3 leading-relaxed">
                            {building.description || 'Tòa nhà cho thuê cao cấp sở hữu vị trí đắc địa, giao thông thuận tiện và các dịch vụ quản lý tiện ích chuẩn quốc tế.'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleViewDetail(building)}
                          className="w-full py-2 bg-brand text-white font-bold rounded-lg text-xs hover:bg-brand-hover transition-colors shadow-sm cursor-pointer mt-2"
                        >
                          Xem chi tiết tòa nhà
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section id="features" className="py-24 px-8 md:px-16 space-y-16">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">Dịch vụ quản lý tinh giản</h2>
            <p className="text-neutral-500 text-sm">Cung cấp các công cụ cần thiết cho cả người thuê và ban quản lý vận hành tòa nhà.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl border border-neutral-200 bg-white relative group hover:border-brand transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-lg mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-3">Tòa nhà & Căn hộ</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Quản lý chi tiết danh sách tòa nhà, số tầng, phân loại phòng dịch vụ, diện tích sử dụng và cập nhật trạng thái phòng tức thì.
              </p>
            </div>

            <div className="p-8 rounded-xl border border-neutral-200 bg-white relative group hover:border-brand transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold text-lg mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-3">Hợp đồng & Hóa đơn</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Tự động hóa lập hợp đồng thuê văn phòng/căn hộ, theo dõi tiến độ thanh toán và phát hành hóa đơn dịch vụ hàng tháng.
              </p>
            </div>

            <div className="p-8 rounded-xl border border-neutral-200 bg-white relative group hover:border-brand transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-3">Yêu cầu & Cư dân</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Tiếp nhận và xử lý nhanh chóng các yêu cầu bảo trì kỹ thuật, kiểm soát thông tin cư dân và thẻ ra vào tòa nhà an toàn.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 py-12 px-8 md:px-16 bg-neutral-50 text-center text-sm text-neutral-500">
        <div className="mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Luxury Rental Management. Bảo lưu mọi quyền.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-neutral-900 transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Liên hệ hỗ trợ</a>
          </div>
        </div>
      </footer>

      <BuildingDetailModal
        isOpen={!!selectedBuilding}
        onClose={() => {
          setSelectedBuilding(null);
          setBuildingRooms([]);
        }}
        building={selectedBuilding}
        buildingRooms={buildingRooms}
        isLoadingRooms={isLoadingRooms}
      />
    </div>
  );
}
