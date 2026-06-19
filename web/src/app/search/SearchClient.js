'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getRoomStatus } from '@/constants';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { roomService } from '@/services/room.service';
import { BuildingDetailModal } from '@/components/building/BuildingDetailModal';
import { formatCurrency } from '@/utils/format';
import toast from 'react-hot-toast';
export function SearchClient({ initialBuildings, initialRooms, searchParams }) {
  const { user, logout, openLogin, openRegister } = useAuth();
  const router = useRouter();

  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildingRooms, setBuildingRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  const [favorites, setFavorites] = useState([]);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [draftCity, setDraftCity] = useState('');
  const [draftDistrict, setDraftDistrict] = useState('');
  const [draftWard, setDraftWard] = useState('');

  const [tempCity, setTempCity] = useState('');
  const [tempDistrict, setTempDistrict] = useState('');
  const [tempWard, setTempWard] = useState('');

  const [roomTypeFilter, setRoomTypeFilter] = useState('ALL');
  const [priceFilter, setPriceFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('DEFAULT');
  const [capacityFilter, setCapacityFilter] = useState('ALL');

  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const keyword = searchParams?.keyword || '';
    const city = searchParams?.city || '';
    const district = searchParams?.district || '';
    const ward = searchParams?.ward || '';

    Promise.resolve().then(() => {
      setSearchKeyword(keyword);
      setDraftCity(city);
      setDraftDistrict(district);
      setDraftWard(ward);

      setTempCity(city);
      setTempDistrict(district);
      setTempWard(ward);
    });
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFavs = localStorage.getItem('pm_favorites');
      if (savedFavs) {
        try {
          const parsed = JSON.parse(savedFavs);
          Promise.resolve().then(() => {
            setFavorites(parsed);
          });
        } catch (e) {}
      }
    }
  }, []);



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

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchKeyword) params.set('keyword', searchKeyword);
    if (draftCity) params.set('city', draftCity);
    if (draftDistrict) params.set('district', draftDistrict);
    if (draftWard) params.set('ward', draftWard);
    router.push(`/search?${params.toString()}`);
  };

  const handleClearAllFilters = () => {
    setSearchKeyword('');
    setTempCity('');
    setTempDistrict('');
    setTempWard('');
    setDraftCity('');
    setDraftDistrict('');
    setDraftWard('');
    setRoomTypeFilter('ALL');
    setPriceFilter('ALL');
    setSortOrder('DEFAULT');
    setCapacityFilter('ALL');
    router.push('/search');
    toast.success('Đã xóa tất cả bộ lọc');
  };

  const parseAddress = (addressStr) => {
    if (!addressStr) return { city: '', district: '', ward: '' };
    const parts = addressStr.split(',').map(p => p.trim());
    const len = parts.length;
    const city = len >= 1 ? parts[len - 1] : '';
    const district = len >= 2 ? parts[len - 2] : '';
    const ward = len >= 3 ? parts[len - 3] : '';
    return { city, district, ward };
  };

  const parsedAddresses = initialBuildings.map((b) => ({
    buildingId: b.id,
    original: b.address,
    ...parseAddress(b.address)
  }));

  const cities = Array.from(new Set(parsedAddresses.map((a) => a.city).filter(Boolean)));
  const districts = Array.from(new Set(
    parsedAddresses
      .filter((a) => !tempCity || a.city === tempCity)
      .map((a) => a.district)
      .filter(Boolean)
  ));
  const wards = Array.from(new Set(
    parsedAddresses
      .filter((a) => (!tempCity || a.city === tempCity) && (!tempDistrict || a.district === tempDistrict))
      .map((a) => a.ward)
      .filter(Boolean)
  ));

  const toggleFavorite = (roomId) => {
    let updated;
    if (favorites.includes(roomId)) {
      updated = favorites.filter(id => id !== roomId);
      toast.success('Đã bỏ lưu tin');
    } else {
      updated = [...favorites, roomId];
      toast.success('Đã lưu tin tìm kiếm');
    }
    setFavorites(updated);
    localStorage.setItem('pm_favorites', JSON.stringify(updated));
  };

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

  const filteredRooms = initialRooms
    .filter((room) => {
      const keyword = searchParams?.keyword || '';
      if (keyword.trim()) {
        const kw = keyword.toLowerCase();
        const matchRoomNum = String(room.roomNumber).toLowerCase().includes(kw);
        const matchBuildingName = room.building?.name?.toLowerCase().includes(kw);
        const matchAddress = room.building?.address?.toLowerCase().includes(kw);
        const matchDesc = room.description?.toLowerCase().includes(kw);

        if (!matchRoomNum && !matchBuildingName && !matchAddress && !matchDesc) {
          return false;
        }
      }

      const city = searchParams?.city || '';
      const district = searchParams?.district || '';
      const ward = searchParams?.ward || '';

      const parsedAddr = parseAddress(room.building?.address);
      if (city && parsedAddr.city !== city) return false;
      if (district && parsedAddr.district !== district) return false;
      if (ward && parsedAddr.ward !== ward) return false;

      if (roomTypeFilter !== 'ALL' && room.type !== roomTypeFilter) return false;

      if (priceFilter !== 'ALL') {
        const p = room.price;
        if (priceFilter === 'UNDER_5M' && p >= 5000000) return false;
        if (priceFilter === '5M_10M' && (p < 5000000 || p > 10000000)) return false;
        if (priceFilter === '10M_20M' && (p < 10000000 || p > 20000000)) return false;
        if (priceFilter === 'OVER_20M' && p <= 20000000) return false;
      }

      if (capacityFilter !== 'ALL') {
        const c = room.maxPeople;
        if (capacityFilter === '1' && c !== 1) return false;
        if (capacityFilter === '2' && c !== 2) return false;
        if (capacityFilter === '3' && c !== 3) return false;
        if (capacityFilter === '4' && c !== 4) return false;
        if (capacityFilter === 'OVER_4' && c <= 4) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'PRICE_ASC') return a.price - b.price;
      if (sortOrder === 'PRICE_DESC') return b.price - a.price;
      if (sortOrder === 'AREA_DESC') return b.area - a.area;
      return 0;
    });

  const backendUrl = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
    : 'http://localhost:3000';

  const toggleDropdown = (menuName) => {
    setActiveDropdown(activeDropdown === menuName ? null : menuName);
  };

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
          draftDistrict,
          setDraftDistrict,
          draftWard,
          setDraftWard,
          tempCity,
          setTempCity,
          tempDistrict,
          setTempDistrict,
          tempWard,
          setTempWard,
          cities,
          districts,
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
              <span className="text-neutral-600 font-medium">{draftCity}</span>
            </>
          )}
          {draftDistrict && (
            <>
              <span>/</span>
              <span className="text-neutral-900 font-semibold">{draftDistrict}</span>
            </>
          )}
        </nav>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-extrabold text-neutral-900 tracking-tight">
              Cho thuê {roomTypeFilter === 'OFFICE' ? 'Văn phòng' : roomTypeFilter === 'APARTMENT' ? 'Căn hộ' : 'Văn phòng & Căn hộ'} cao cấp tại {draftDistrict || draftCity || 'Toàn quốc'}
            </h1>
            <p className="text-xs text-neutral-500">
              Tìm thấy <span className="font-bold text-neutral-800">{filteredRooms.length}</span> bất động sản phù hợp với tiêu chí của bạn.
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

        <div className="flex flex-wrap items-center gap-2 pb-2 relative z-20">
          <div className="relative">
            <button
              onClick={() => toggleDropdown('capacity')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer shadow-sm ${
                capacityFilter !== 'ALL'
                  ? 'bg-black text-white'
                  : 'bg-white border border-neutral-200 text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Sức chứa: {capacityFilter === 'ALL' ? 'Tất cả' : capacityFilter === 'OVER_4' ? '> 4 người' : `${capacityFilter} người`}
            </button>

            {activeDropdown === 'capacity' && (
              <div className="absolute left-0 mt-2 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl p-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                <button
                  onClick={() => { setCapacityFilter('ALL'); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium ${capacityFilter === 'ALL' ? 'bg-brand/10 text-brand' : 'hover:bg-neutral-50 text-neutral-800'}`}
                >
                  Tất cả sức chứa
                </button>
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => { setCapacityFilter(String(num)); setActiveDropdown(null); }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium ${capacityFilter === String(num) ? 'bg-brand/10 text-brand' : 'hover:bg-neutral-50 text-neutral-800'}`}
                  >
                    Phù hợp {num} người
                  </button>
                ))}
                <button
                  onClick={() => { setCapacityFilter('OVER_4'); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium ${capacityFilter === 'OVER_4' ? 'bg-brand/10 text-brand' : 'hover:bg-neutral-50 text-neutral-800'}`}
                >
                  Gia đình / nhóm lớn hơn 4 người
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => toggleDropdown('type')}
              className={`flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer border shadow-sm ${
                roomTypeFilter !== 'ALL'
                  ? 'bg-black border-black text-white'
                  : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              Danh mục: {roomTypeFilter === 'ALL' ? 'Tất cả' : roomTypeFilter === 'OFFICE' ? 'Văn phòng' : 'Căn hộ'}
              <svg className="w-3 h-3 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {activeDropdown === 'type' && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-neutral-200 rounded-xl shadow-xl p-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                <button
                  onClick={() => { setRoomTypeFilter('ALL'); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium ${roomTypeFilter === 'ALL' ? 'bg-brand/10 text-brand font-bold' : 'hover:bg-neutral-50 text-neutral-800'}`}
                >
                  Tất cả danh mục
                </button>
                <button
                  onClick={() => { setRoomTypeFilter('OFFICE'); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium ${roomTypeFilter === 'OFFICE' ? 'bg-brand/10 text-brand font-bold' : 'hover:bg-neutral-50 text-neutral-800'}`}
                >
                  Văn phòng cho thuê
                </button>
                <button
                  onClick={() => { setRoomTypeFilter('APARTMENT'); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium ${roomTypeFilter === 'APARTMENT' ? 'bg-brand/10 text-brand font-bold' : 'hover:bg-neutral-50 text-neutral-800'}`}
                >
                  Căn hộ chung cư
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => toggleDropdown('price')}
              className={`flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer border shadow-sm ${
                priceFilter !== 'ALL'
                  ? 'bg-black border-black text-white'
                  : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              Giá: {
                priceFilter === 'ALL' ? 'Tất cả' :
                priceFilter === 'UNDER_5M' ? 'Dưới 5 triệu' :
                priceFilter === '5M_10M' ? '5 - 10 triệu' :
                priceFilter === '10M_20M' ? '10 - 20 triệu' : 'Trên 20 triệu'
              }
              <svg className="w-3 h-3 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {activeDropdown === 'price' && (
              <div className="absolute left-0 mt-2 w-52 bg-white border border-neutral-200 rounded-xl shadow-xl p-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                <button
                  onClick={() => { setPriceFilter('ALL'); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium ${priceFilter === 'ALL' ? 'bg-brand/10 text-brand font-bold' : 'hover:bg-neutral-50 text-neutral-800'}`}
                >
                  Tất cả mức giá
                </button>
                <button
                  onClick={() => { setPriceFilter('UNDER_5M'); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium ${priceFilter === 'UNDER_5M' ? 'bg-brand/10 text-brand font-bold' : 'hover:bg-neutral-50 text-neutral-800'}`}
                >
                  Dưới 5 triệu VNĐ
                </button>
                <button
                  onClick={() => { setPriceFilter('5M_10M'); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium ${priceFilter === '5M_10M' ? 'bg-brand/10 text-brand font-bold' : 'hover:bg-neutral-50 text-neutral-800'}`}
                >
                  5 triệu - 10 triệu VNĐ
                </button>
                <button
                  onClick={() => { setPriceFilter('10M_20M'); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium ${priceFilter === '10M_20M' ? 'bg-brand/10 text-brand font-bold' : 'hover:bg-neutral-50 text-neutral-800'}`}
                >
                  10 triệu - 20 triệu VNĐ
                </button>
                <button
                  onClick={() => { setPriceFilter('OVER_20M'); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium ${priceFilter === 'OVER_20M' ? 'bg-brand/10 text-brand font-bold' : 'hover:bg-neutral-50 text-neutral-800'}`}
                >
                  Trên 20 triệu VNĐ
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => toggleDropdown('sort')}
              className={`flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer border shadow-sm ${
                sortOrder !== 'DEFAULT'
                  ? 'bg-black border-black text-white'
                  : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              Sắp xếp: {
                sortOrder === 'DEFAULT' ? 'Mặc định' :
                sortOrder === 'PRICE_ASC' ? 'Giá tăng dần' :
                sortOrder === 'PRICE_DESC' ? 'Giá giảm dần' : 'Diện tích lớn nhất'
              }
              <svg className="w-3 h-3 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {activeDropdown === 'sort' && (
              <div className="absolute left-0 mt-2 w-52 bg-white border border-neutral-200 rounded-xl shadow-xl p-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                <button
                  onClick={() => { setSortOrder('DEFAULT'); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium ${sortOrder === 'DEFAULT' ? 'bg-brand/10 text-brand font-bold' : 'hover:bg-neutral-50 text-neutral-800'}`}
                >
                  Mặc định
                </button>
                <button
                  onClick={() => { setSortOrder('PRICE_ASC'); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium ${sortOrder === 'PRICE_ASC' ? 'bg-brand/10 text-brand font-bold' : 'hover:bg-neutral-50 text-neutral-800'}`}
                >
                  Giá: Thấp đến Cao
                </button>
                <button
                  onClick={() => { setSortOrder('PRICE_DESC'); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium ${sortOrder === 'PRICE_DESC' ? 'bg-brand/10 text-brand font-bold' : 'hover:bg-neutral-50 text-neutral-800'}`}
                >
                  Giá: Cao đến Thấp
                </button>
                <button
                  onClick={() => { setSortOrder('AREA_DESC'); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium ${sortOrder === 'AREA_DESC' ? 'bg-brand/10 text-brand font-bold' : 'hover:bg-neutral-50 text-neutral-800'}`}
                >
                  Diện tích: Lớn đến Bé
                </button>
              </div>
            )}
          </div>

          {(searchKeyword || draftCity || roomTypeFilter !== 'ALL' || priceFilter !== 'ALL' || sortOrder !== 'DEFAULT' || capacityFilter !== 'ALL') && (
            <button
              onClick={handleClearAllFilters}
              className="text-xs font-bold text-neutral-500 hover:text-red-500 transition-colors flex items-center gap-1 ml-auto cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {filteredRooms.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="font-extrabold text-lg text-neutral-800">Không tìm thấy bất động sản nào</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Thử nhập từ khóa khác, thay đổi khu vực tìm kiếm hoặc xóa các bộ lọc danh mục và mức giá để tìm kiếm lại.
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
            {filteredRooms.map((room) => {
              const roomImgs = (room.images && room.images.length > 0)
                ? room.images.map(img => `${backendUrl}${img.imagePath}`)
                : (room.building?.images && room.building.images.length > 0)
                  ? room.building.images.map(img => `${backendUrl}${img.imagePath}`)
                  : [];
              const imagesToRender = [...roomImgs];
              while (imagesToRender.length < 5) {
                imagesToRender.push('/images/banner.jpg');
              }
              const totalImages = Math.max(room.images?.length || 0, room.building?.images?.length || 0, 5);

              const displayTitle = `Cho thuê ${room.type === 'OFFICE' ? 'văn phòng' : 'căn hộ'} ${room.area}m² tại tòa ${room.building?.name || 'PrimeSpace'}, ${room.building?.address?.split(',').slice(-3, -1).join(', ') || 'Trung tâm'}`;
              const roomStatusCfg = getRoomStatus(room.status);
              const isFav = favorites.includes(room.id);

              return (
                <div
                  key={room.id}
                  className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 p-4 md:p-6 space-y-4 text-left"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 aspect-video md:aspect-[24/9] rounded-xl overflow-hidden relative group/grid">
                    <div className="md:col-span-2 h-full relative overflow-hidden bg-neutral-100">
                      <img
                        src={imagesToRender[0]}
                        alt={displayTitle}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/grid:scale-102"
                      />
                      <span className="absolute bottom-3 left-3 bg-[#FFBA00] text-black font-extrabold uppercase text-[9px] tracking-wider px-2 py-1 rounded shadow-sm relative z-10 select-none">
                        Tin ưu tiên
                      </span>
                    </div>

                    <div className="md:col-span-1 h-full hidden md:block overflow-hidden bg-neutral-100">
                      <img
                        src={imagesToRender[1]}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="md:col-span-1 grid grid-rows-2 gap-2 h-full hidden md:grid">
                      <div className="h-full overflow-hidden bg-neutral-100">
                        <img
                          src={imagesToRender[2]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 h-full">
                        <div className="h-full overflow-hidden bg-neutral-100">
                          <img
                            src={imagesToRender[3]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="relative h-full overflow-hidden bg-neutral-100">
                          <img
                            src={imagesToRender[4]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          {totalImages > 5 && (
                            <div className="absolute inset-0 bg-black/55 flex items-center justify-center text-white text-xs font-bold select-none">
                              +{totalImages - 5} ảnh
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className={`absolute top-3 right-3 px-2.5 py-1 text-[10px] rounded-full font-bold border backdrop-blur-md shadow-sm z-10 ${roomStatusCfg.colorClass}`}>
                      {roomStatusCfg.label}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3
                        onClick={() => room.building && handleViewDetail(room.building)}
                        className="text-base md:text-lg font-extrabold text-neutral-900 leading-snug hover:text-brand transition-colors cursor-pointer"
                      >
                        {displayTitle}
                      </h3>
                      <p className="text-xs text-neutral-400 font-medium">
                        Phân loại: {room.type === 'OFFICE' ? 'Văn phòng làm việc cao cấp' : 'Căn hộ chung cư hạng sang'}
                      </p>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1 pb-2 border-b border-neutral-100">
                      <div className="flex items-baseline gap-3">
                        <span className="text-rose-600 text-lg md:text-xl font-extrabold">
                          {formatCurrency(room.price)}<span className="text-[10px] text-neutral-400 font-normal">/tháng</span>
                        </span>
                        <span className="text-neutral-950 font-bold text-sm bg-neutral-100 px-2 py-0.5 rounded">
                          {room.area} m²
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <svg className="w-4 h-4 text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{room.building?.address} (Tầng {room.floor}, Phòng {room.roomNumber})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center font-bold text-xs text-brand select-none">
                          {room.building?.name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-900">Ban quản lý {room.building?.name || 'PrimeSpace'}</p>
                          <p className="text-[10px] text-neutral-400">Đối tác vận hành hệ thống</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleFavorite(room.id)}
                          className="p-2 border border-neutral-200 rounded-full hover:bg-neutral-50 transition-colors cursor-pointer shadow-sm"
                        >
                          <svg
                            className={`w-4 h-4 transition-colors ${isFav ? 'text-red-500 fill-red-500' : 'text-neutral-400'}`}
                            fill={isFav ? 'currentColor' : 'none'}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => room.building && handleViewDetail(room.building)}
                          className="px-5 py-2 bg-brand text-white font-bold rounded-lg text-xs hover:bg-brand-hover transition-colors shadow-sm cursor-pointer"
                        >
                          Liên hệ ngay
                        </button>
                      </div>
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
