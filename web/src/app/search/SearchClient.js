'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { roomService } from '@/services/room.service';
import { locationService } from '@/services/location.service';
import { BuildingDetailModal } from '@/components/building/BuildingDetailModal';
import { formatAddress } from '@/utils/format';
import toast from 'react-hot-toast';

export function SearchClient({ initialBuildings, searchParams }) {
  const { user, logout, openLogin, openRegister } = useAuth();
  const router = useRouter();

  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildingRooms, setBuildingRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [draftCity, setDraftCity] = useState('');
  const [draftWard, setDraftWard] = useState('');

  const [tempCity, setTempCity] = useState('');
  const [tempWard, setTempWard] = useState('');

  const [activeDropdown, setActiveDropdown] = useState(null);

  const getSelectedLocationName = () => {
    if (draftWard && wards && wards.length > 0) {
      const foundWard = wards.find(w => (w.id || w) === draftWard);
      if (foundWard) return foundWard.name || foundWard;
    }
    if (draftCity && cities && cities.length > 0) {
      const foundCity = cities.find(c => (c.id || c) === draftCity);
      if (foundCity) return foundCity.name || foundCity;
    }
    return "Toàn quốc";
  };

  useEffect(() => {
    const keyword = searchParams?.keyword || '';
    const provinceId = searchParams?.provinceId || '';
    const wardId = searchParams?.wardId || '';

    Promise.resolve().then(() => {
      setSearchKeyword(keyword);
      setDraftCity(provinceId);
      setDraftWard(wardId);

      setTempCity(provinceId);
      setTempWard(wardId);
    });
  }, [searchParams]);

  const updateURLParams = (newParams) => {
    const params = new URLSearchParams();
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, val]) => {
        if (val && key !== 'showLogin' && key !== 'showRegister') {
          params.set(key, val);
        }
      });
    }
    Object.entries(newParams).forEach(([key, val]) => {
      if (val) params.set(key, val);
      else params.delete(key);
    });
    router.push(`/search?${params.toString()}`, { scroll: false });
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

  const handleClearAllFilters = () => {
    setSearchKeyword('');
    setTempCity('');
    setTempWard('');
    setDraftCity('');
    setDraftWard('');
    router.push('/search');
    toast.success('Đã xóa tất cả bộ lọc');
  };

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

  const handleViewDetail = async (building) => {
    if (!user) {
      openLogin();
      updateURLParams({ showLogin: 'true' });
      return;
    }

    setSelectedBuilding(building);
    setIsLoadingRooms(true);
    try {
      const roomsData = await roomService.getRooms({ buildingId: building.id, limit: 1000 });
      const roomsArr = Array.isArray(roomsData) ? roomsData : roomsData?.data || [];
      setBuildingRooms(roomsArr || []);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải thông tin chi tiết.');
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const filteredBuildings = initialBuildings || [];

  const backendUrl = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
    : 'http://localhost:3000';

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] text-neutral-900 font-sans selection:bg-brand selection:text-white">
      {activeDropdown && (
        <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
      )}

      <PublicHeader
        user={user}
        logout={logout}
        showSearch={true}
        onLoginClick={() => {
          openLogin();
          updateURLParams({ showLogin: 'true' });
        }}
        onRegisterClick={() => {
          openRegister();
          updateURLParams({ showRegister: 'true' });
        }}
        searchProps={{
          searchKeyword,
          setSearchKeyword,
          draftCity,
          setDraftCity,
          draftWard,
          setDraftWard,
          tempCity,
          setTempCity,
          tempWard,
          setTempWard,
          cities,
          wards,
          handleSearch
        }}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 md:py-10 space-y-6">
        <nav className="text-xs text-neutral-500 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-neutral-900 transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link href="/search" className="hover:text-neutral-900 transition-colors">Cho thuê</Link>
          {draftCity && (
            <>
              <span>/</span>
              <span className="text-neutral-600 font-medium">
                {cities.find(c => (c.id || c) === draftCity)?.name || draftCity}
              </span>
            </>
          )}
          {draftWard && (
            <>
              <span>/</span>
              <span className="text-neutral-900 font-semibold">
                {wards.find(w => (w.id || w) === draftWard)?.name || draftWard}
              </span>
            </>
          )}
        </nav>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-extrabold text-neutral-900 tracking-tight">
              Cho thuê Văn phòng & Căn hộ cao cấp tại {getSelectedLocationName()}
            </h1>
            <p className="text-xs text-neutral-500">
              Tìm thấy <span className="font-bold text-neutral-800">{filteredBuildings.length}</span> tòa nhà phù hợp với tiêu chí của bạn.
            </p>
          </div>

          <button
            onClick={() => {
              toast.success('Đã lưu tiêu chí tìm kiếm này vào danh sách quan tâm!');
            }}
            className="flex items-center gap-2 px-4 py-2 border border-neutral-200 bg-white hover:bg-neutral-50 rounded-full text-xs font-semibold shadow-sm transition-colors text-neutral-700 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Lưu tìm kiếm
          </button>
        </div>

        {(searchKeyword || draftCity || draftWard) && (
          <div className="flex justify-end pb-2">
            <button
              onClick={handleClearAllFilters}
              className="text-xs font-bold text-neutral-500 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

        {filteredBuildings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="font-extrabold text-lg text-neutral-800">Không tìm thấy tòa nhà nào</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Thử nhập từ khóa khác hoặc thay đổi khu vực tìm kiếm để tìm kiếm lại.
            </p>
            <button
              onClick={handleClearAllFilters}
              className="px-6 py-2 bg-neutral-900 text-white rounded-full text-xs font-bold hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
            >
              Reset bộ lọc tìm kiếm
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBuildings.map((building) => {
              const primaryImage = building.images?.find(img => img.isPrimary) || building.images?.[0];
              const imgUrl = primaryImage ? `${backendUrl}${primaryImage.imagePath}` : '/images/banner.jpg';

              return (
                <div
                  key={building.id}
                  className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col md:flex-row gap-6 text-left"
                >
                  <div className="w-full md:w-72 aspect-video md:aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 relative shrink-0">
                    <img
                      src={imgUrl}
                      alt={building.name}
                      className="w-full h-full object-cover hover:scale-102 transition-transform duration-500"
                    />
                    <span className="absolute top-3 right-3 bg-brand/90 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg shadow-sm backdrop-blur-sm">
                      {building.numberOfFloors} tầng
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3
                          onClick={() => handleViewDetail(building)}
                          className="text-lg md:text-xl font-bold text-neutral-900 hover:text-brand transition-colors cursor-pointer"
                        >
                          {building.name}
                        </h3>
                        <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Mã: {building.id}</span>
                      </div>
                      <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{formatAddress(building.address)}</span>
                      </p>
                      <p className="text-neutral-600 text-sm leading-relaxed">
                        {building.description || 'Tòa nhà cho thuê cao cấp sở hữu vị trí đắc địa, giao thông thuận tiện và các dịch vụ quản lý tiện ích chuẩn quốc tế.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => handleViewDetail(building)}
                        className="text-xs font-bold text-brand hover:text-brand-hover flex items-center gap-1.5 group/btn cursor-pointer"
                      >
                        Xem chi tiết tòa nhà
                        <svg className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

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
