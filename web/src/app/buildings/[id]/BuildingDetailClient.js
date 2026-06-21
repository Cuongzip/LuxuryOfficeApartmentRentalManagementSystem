'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { locationService } from '@/services/location.service';
import { formatAddress, formatCurrency } from '@/utils/format';
import { ROOM_STATUS, ROOM_STATUS_COLORS } from '@/constants';
import { requestService } from '@/services/request.service';
import toast from 'react-hot-toast';

const formatShortCurrency = (value) => {
  if (value >= 1000000) {
    const mil = value / 1000000;
    return `${mil % 1 === 0 ? mil : mil.toFixed(1)} triệu`;
  }
  return formatCurrency(value);
};

export function BuildingDetailClient({ initialBuilding, initialRooms = [], buildingId }) {
  const { user, logout, openLogin, openRegister } = useAuth();
  const router = useRouter();

  // Header search states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [draftCity, setDraftCity] = useState('');
  const [draftWard, setDraftWard] = useState('');
  const [tempCity, setTempCity] = useState('');
  const [tempWard, setTempWard] = useState('');
  const [cities, setCities] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await locationService.getProvinces();
        setCities(data || []);
      } catch (err) {
        console.error('Lỗi khi tải danh sách tỉnh thành:', err);
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
      }
    };
    fetchWards();
  }, [tempCity]);

  const handleSearch = (overrideCity, overrideWard) => {
    const params = new URLSearchParams();
    const city = overrideCity !== undefined ? overrideCity : draftCity;
    const ward = overrideWard !== undefined ? overrideWard : draftWard;

    if (searchKeyword) params.set('keyword', searchKeyword);
    if (city) params.set('provinceId', city);
    if (ward) params.set('wardId', ward);
    router.push(`/search?${params.toString()}`);
  };

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [selectedRoomIds, setSelectedRoomIds] = useState([]);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);

  // Form states for viewing request
  const [appointmentDate, setAppointmentDate] = useState('');
  const [requestContent, setRequestContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtering states and Popups
  const [floorFilter, setFloorFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isAreaPopupOpen, setIsAreaPopupOpen] = useState(false);
  const [isPricePopupOpen, setIsPricePopupOpen] = useState(false);

  if (!initialBuilding) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F5F5F7]">
        <PublicHeader
          user={user}
          logout={logout}
          showSearch={true}
          onLoginClick={openLogin}
          onRegisterClick={openRegister}
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
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-neutral-800">Tòa nhà không tồn tại</h2>
          <p className="text-neutral-500 text-xs max-w-sm">
            Thông tin tòa nhà không tồn tại hoặc đã bị gỡ khỏi hệ thống.
          </p>
          <Link
            href="/search"
            className="px-6 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-colors shadow-sm"
          >
            Quay lại tìm kiếm
          </Link>
        </main>
      </div>
    );
  }

  const building = initialBuilding;
  const rooms = (initialRooms || []).filter((r) => r.status === ROOM_STATUS.AVAILABLE);
  const backendUrl = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
    : 'http://localhost:3000';

  // 1. Image preparation: extract and pad with premium placeholder image links
  const buildingImages = (building.images || []).map(img => `${backendUrl}${img.imagePath}`);

  const placeholders = [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1517502884422-41eaaced0168?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1527359396039-04de4296e91f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=600&q=80',
  ];

  const allImages = [...buildingImages];
  while (allImages.length < 8) {
    allImages.push(placeholders[(allImages.length - buildingImages.length) % placeholders.length]);
  }

  const displayImages = buildingImages.length >= 8 ? buildingImages : allImages;
  const galleryImages = buildingImages.length > 0 ? buildingImages : placeholders;

  const mainImage = displayImages[0];
  const rightImage1 = displayImages[1];
  const rightImage2 = displayImages[2];
  const thumbnails = displayImages.slice(3, 8); // index 3, 4, 5, 6, 7 (total 5 images)
  const remainingCount = buildingImages.length > 8 ? buildingImages.length - 8 : 0;

  // 2. Range limits and states
  const maxArea = useMemo(() => {
    return Math.max(...rooms.map((r) => r.area || 0), 100) || 100;
  }, [rooms]);

  const maxPrice = useMemo(() => {
    return Math.max(...rooms.map((r) => r.price || 0), 10000000) || 10000000;
  }, [rooms]);

  const [areaRange, setAreaRange] = useState([0, maxArea]);
  const [priceRange, setPriceRange] = useState([0, maxPrice]);

  useEffect(() => {
    setAreaRange([0, maxArea]);
    setPriceRange([0, maxPrice]);
  }, [maxArea, maxPrice]);

  // Extract unique lists for filtering dropdowns
  const uniqueFloors = useMemo(() => {
    return Array.from(new Set(rooms.map((r) => r.floor))).filter(Boolean).sort((a, b) => a - b);
  }, [rooms]);

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(rooms.map((r) => r.type))).filter(Boolean).sort();
  }, [rooms]);

  // 3. Filtered rooms computation
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // Floor Filter
      if (floorFilter && String(room.floor) !== String(floorFilter)) return false;

      // Room Type Filter
      if (typeFilter && room.type !== typeFilter) return false;

      // Area Filter
      const area = room.area || 0;
      if (area < areaRange[0] || area > areaRange[1]) return false;

      // Price Filter
      const price = room.price || 0;
      if (price < priceRange[0] || price > priceRange[1]) return false;

      return true;
    });
  }, [rooms, floorFilter, typeFilter, areaRange, priceRange]);

  const openLightbox = (index) => {
    const boundedIndex = index % galleryImages.length;
    setActiveImageIndex(boundedIndex);
    setIsGalleryOpen(true);
  };

  const closeLightbox = () => {
    setIsGalleryOpen(false);
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const nextImage = (e) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const handleSelectRoom = (roomId) => {
    setSelectedRoomIds((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  };

  const handleSelectAllRooms = () => {
    const visibleRoomIds = filteredRooms.map((room) => room.id);
    const allVisibleSelected = visibleRoomIds.every((id) => selectedRoomIds.includes(id));

    if (allVisibleSelected) {
      setSelectedRoomIds((prev) => prev.filter((id) => !visibleRoomIds.includes(id)));
    } else {
      setSelectedRoomIds((prev) => Array.from(new Set([...prev, ...visibleRoomIds])));
    }
  };

  const isAllVisibleSelected = filteredRooms.length > 0 && filteredRooms.every((room) => selectedRoomIds.includes(room.id));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isGalleryOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGalleryOpen, galleryImages.length]);

  const handleSendRequests = async (e) => {
    e.preventDefault();
    if (!appointmentDate) {
      toast.error('Vui lòng chọn ngày giờ hẹn xem phòng!');
      return;
    }

    const apptDate = new Date(appointmentDate);
    const now = new Date();

    if (apptDate < now) {
      toast.error('Ngày hẹn không được là ngày trong quá khứ!');
      return;
    }

    const localHours = apptDate.getHours();
    const localMinutes = apptDate.getMinutes();

    if (localHours < 8 || localHours > 18 || (localHours === 18 && localMinutes > 0)) {
      toast.error('Giờ hẹn phải nằm trong khoảng giờ làm việc (08:00 - 18:00)!');
      return;
    }

    setIsSubmitting(true);
    try {
      for (const roomId of selectedRoomIds) {
        await requestService.createRequest({
          roomId,
          appointmentDate: apptDate.toISOString(),
          content: requestContent,
        });
      }

      toast.success('Gửi yêu cầu xem phòng thành công! Đang chờ Nhân viên quản lý xác nhận.');
      setSelectedRoomIds([]);
      setIsRoomModalOpen(false);
      setAppointmentDate('');
      setRequestContent('');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Gửi yêu cầu xem phòng thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] text-neutral-900 font-sans selection:bg-brand selection:text-white">
      <style>{`
        .dual-range-input {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: none;
        }
        .dual-range-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: auto;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #0f172a;
          border: 2px solid #ffffff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: transform 0.1s ease;
        }
        .dual-range-input::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        .dual-range-input::-moz-range-thumb {
          pointer-events: auto;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #0f172a;
          border: 2px solid #ffffff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: transform 0.1s ease;
        }
        .dual-range-input::-moz-range-thumb:hover {
          transform: scale(1.2);
        }
      `}</style>
      <PublicHeader
        user={user}
        logout={logout}
        showSearch={true}
        onLoginClick={openLogin}
        onRegisterClick={openRegister}
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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 md:py-8 space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 font-semibold transition-colors group"
          >
            <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại tìm kiếm
          </Link>
        </div>

        {/* Title and location header */}
        <div className="space-y-2 text-left">
          <h1 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight leading-tight">
            {building.name}
          </h1>
          <div className="text-xs md:text-sm text-neutral-500 flex flex-wrap items-center gap-1">
            <svg className="w-4 h-4 text-brand shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-neutral-600 mr-1">
              {formatAddress(building.address)}
            </span>
            <span
              onClick={() => toast.success('Đang mở bản đồ (Demo)...')}
              className="text-brand font-bold hover:underline cursor-pointer select-none"
            >
              - Vị trí xuất sắc - hiển thị bản đồ
            </span>
          </div>
        </div>

        {/* Photo Grid Collage (Matching User Mockup) */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Left Large Main Image */}
            <div
              onClick={() => openLightbox(0)}
              className="lg:col-span-2 h-[300px] md:h-[420px] rounded-2xl overflow-hidden bg-neutral-100 relative group cursor-pointer"
            >
              <img
                src={mainImage}
                alt={building.name}
                className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-500"
              />
            </div>

            {/* Right Stacked Images */}
            <div className="hidden lg:flex flex-col gap-3 h-[420px]">
              <div
                onClick={() => openLightbox(1)}
                className="flex-1 overflow-hidden rounded-2xl bg-neutral-100 group cursor-pointer relative"
              >
                <img
                  src={rightImage1}
                  alt={building.name}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
              </div>
              <div
                onClick={() => openLightbox(2)}
                className="flex-1 overflow-hidden rounded-2xl bg-neutral-100 group cursor-pointer relative"
              >
                <img
                  src={rightImage2}
                  alt={building.name}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Row of 5 Thumbnail Images */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {thumbnails.map((thumbUrl, idx) => {
              const imageIndex = idx + 3;
              const isLast = idx === 4 && remainingCount > 0;
              return (
                <div
                  key={idx}
                  onClick={() => openLightbox(imageIndex)}
                  className="aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 relative group cursor-pointer"
                >
                  <img
                    src={thumbUrl}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  {isLast && (
                    <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center text-white font-extrabold text-base transition-colors group-hover:bg-neutral-900/50 select-none">
                      +{remainingCount} ảnh
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Layout & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 text-left">
          {/* Left Column: Description & Rooms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description card */}
            <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 md:p-8 shadow-xs space-y-4">
              <h2 className="text-lg md:text-xl font-extrabold text-neutral-900 tracking-tight">
                Giới thiệu về tòa nhà
              </h2>
              <div className="w-12 h-1 bg-brand rounded-full"></div>
              <div className="text-neutral-600 text-sm leading-relaxed whitespace-pre-line pt-2">
                {building.description ||
                  'Tòa nhà cho thuê cao cấp sở hữu vị trí đắc địa, giao thông thuận tiện và các dịch vụ quản lý tiện ích chuẩn quốc tế.'}
              </div>
            </div>

            {/* Rooms Table */}
            <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg md:text-xl font-extrabold text-neutral-900 tracking-tight">
                    Danh sách phòng cho thuê
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Tìm thấy <span className="font-bold text-neutral-800">{filteredRooms.length}</span> phòng phù hợp. Chọn các phòng để xem chi tiết.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={selectedRoomIds.length === 0}
                  onClick={() => {
                    if (!user) {
                      openLogin();
                      toast.error('Vui lòng đăng nhập để gửi yêu cầu xem phòng!');
                      return;
                    }
                    if (user.role !== 'CUSTOMER') {
                      toast.error('Chỉ khách hàng mới có thể gửi yêu cầu xem phòng!');
                      return;
                    }
                    setIsRoomModalOpen(true);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm select-none cursor-pointer ${selectedRoomIds.length > 0
                    ? 'bg-brand hover:bg-brand-hover text-white'
                    : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                    }`}
                >
                  Gửi yêu cầu xem phòng ({selectedRoomIds.length})
                </button>
              </div>

              {/* Filtering Controls */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/60">

                {/* Floor Filter */}
                <div className="flex flex-col gap-1 text-[10px] font-semibold text-neutral-500">
                  <label>Tầng</label>
                  <select
                    value={floorFilter}
                    onChange={(e) => {
                      setFloorFilter(e.target.value);
                      setSelectedRoomIds([]);
                    }}
                    className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-lg bg-white text-neutral-800 focus:outline-none text-xs"
                  >
                    <option value="">Tất cả các tầng</option>
                    {uniqueFloors.map((floor) => (
                      <option key={floor} value={floor}>
                        Tầng {floor}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div className="flex flex-col gap-1 text-[10px] font-semibold text-neutral-500">
                  <label>Loại phòng</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value);
                      setSelectedRoomIds([]);
                    }}
                    className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-lg bg-white text-neutral-800 focus:outline-none text-xs"
                  >
                    <option value="">Tất cả loại phòng</option>
                    {uniqueTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Area Filter */}
                <div className="flex flex-col gap-1 text-[10px] font-semibold text-neutral-500 relative">
                  <label>Diện tích</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAreaPopupOpen(!isAreaPopupOpen);
                      setIsPricePopupOpen(false);
                    }}
                    className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-lg bg-white text-neutral-800 text-left flex items-center justify-between text-xs font-medium hover:border-neutral-300 transition-colors"
                  >
                    <span className="truncate">
                      {areaRange[0]} - {areaRange[1]} m²
                    </span>
                    <svg className="w-3 h-3 text-neutral-400 shrink-0 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isAreaPopupOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setIsAreaPopupOpen(false)} />
                      <div className="absolute left-0 top-full mt-1.5 w-64 bg-white border border-neutral-200 rounded-xl shadow-lg p-4 z-40 space-y-3.5 text-left">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-neutral-800 uppercase tracking-wide">Diện tích (m²)</span>
                          <button
                            type="button"
                            onClick={() => {
                              setAreaRange([0, maxArea]);
                              setSelectedRoomIds([]);
                            }}
                            className="text-[9px] text-brand font-bold hover:underline"
                          >
                            Reset
                          </button>
                        </div>

                        <div className="relative w-full h-5 flex items-center">
                          <div className="absolute left-0 right-0 h-1 bg-neutral-100 rounded-full" />
                          <div
                            className="absolute h-1 bg-slate-900 rounded-full"
                            style={{
                              left: `${(areaRange[0] / maxArea) * 100}%`,
                              right: `${100 - (areaRange[1] / maxArea) * 100}%`,
                            }}
                          />
                          <input
                            type="range"
                            min={0}
                            max={maxArea}
                            value={areaRange[0]}
                            onChange={(e) => {
                              const val = Math.min(Number(e.target.value), areaRange[1] - 1);
                              setAreaRange([val, areaRange[1]]);
                              setSelectedRoomIds([]);
                            }}
                            className="absolute w-full appearance-none bg-transparent pointer-events-none dual-range-input focus:outline-none"
                          />
                          <input
                            type="range"
                            min={0}
                            max={maxArea}
                            value={areaRange[1]}
                            onChange={(e) => {
                              const val = Math.max(Number(e.target.value), areaRange[0] + 1);
                              setAreaRange([areaRange[0], val]);
                              setSelectedRoomIds([]);
                            }}
                            className="absolute w-full appearance-none bg-transparent pointer-events-none dual-range-input focus:outline-none"
                          />
                        </div>

                        <div className="flex justify-between items-center text-[10px] font-bold text-neutral-600 bg-neutral-50 px-2.5 py-1 rounded border border-neutral-100">
                          <span>Từ: {areaRange[0]} m²</span>
                          <span>Đến: {areaRange[1]} m²</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Price Filter */}
                <div className="flex flex-col gap-1 text-[10px] font-semibold text-neutral-500 relative">
                  <label>Giá thuê</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPricePopupOpen(!isPricePopupOpen);
                      setIsAreaPopupOpen(false);
                    }}
                    className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-lg bg-white text-neutral-800 text-left flex items-center justify-between text-xs font-medium hover:border-neutral-300 transition-colors"
                  >
                    <span className="truncate">
                      {formatShortCurrency(priceRange[0])} - {formatShortCurrency(priceRange[1])}
                    </span>
                    <svg className="w-3 h-3 text-neutral-400 shrink-0 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isPricePopupOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setIsPricePopupOpen(false)} />
                      <div className="absolute right-0 md:left-0 top-full mt-1.5 w-64 bg-white border border-neutral-200 rounded-xl shadow-lg p-4 z-40 space-y-3.5 text-left">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-neutral-800 uppercase tracking-wide">Giá thuê (VNĐ)</span>
                          <button
                            type="button"
                            onClick={() => {
                              setPriceRange([0, maxPrice]);
                              setSelectedRoomIds([]);
                            }}
                            className="text-[9px] text-brand font-bold hover:underline"
                          >
                            Reset
                          </button>
                        </div>

                        <div className="relative w-full h-5 flex items-center">
                          <div className="absolute left-0 right-0 h-1 bg-neutral-100 rounded-full" />
                          <div
                            className="absolute h-1 bg-slate-900 rounded-full"
                            style={{
                              left: `${(priceRange[0] / maxPrice) * 100}%`,
                              right: `${100 - (priceRange[1] / maxPrice) * 100}%`,
                            }}
                          />
                          <input
                            type="range"
                            min={0}
                            max={maxPrice}
                            step={500000}
                            value={priceRange[0]}
                            onChange={(e) => {
                              const val = Math.min(Number(e.target.value), priceRange[1] - 500000);
                              setPriceRange([val, priceRange[1]]);
                              setSelectedRoomIds([]);
                            }}
                            className="absolute w-full appearance-none bg-transparent pointer-events-none dual-range-input focus:outline-none"
                          />
                          <input
                            type="range"
                            min={0}
                            max={maxPrice}
                            step={500000}
                            value={priceRange[1]}
                            onChange={(e) => {
                              const val = Math.max(Number(e.target.value), priceRange[0] + 500000);
                              setPriceRange([priceRange[0], val]);
                              setSelectedRoomIds([]);
                            }}
                            className="absolute w-full appearance-none bg-transparent pointer-events-none dual-range-input focus:outline-none"
                          />
                        </div>

                        <div className="flex  justify-between gap-1 text-[10px] font-bold text-neutral-600 bg-neutral-50 px-2.5 py-1.5 rounded border border-neutral-100">

                          <span>Từ: {formatCurrency(priceRange[0])}</span>


                          <span>Đến: {formatCurrency(priceRange[1])}</span>

                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {filteredRooms.length === 0 ? (
                <p className="text-sm text-neutral-500 italic py-8 text-center border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
                  Không tìm thấy phòng nào phù hợp với bộ lọc đã chọn.
                </p>
              ) : (
                <div className="overflow-x-auto border border-neutral-200 rounded-xl">
                  <table className="min-w-full divide-y divide-neutral-200 text-xs bg-white text-neutral-600">
                    <thead className="bg-neutral-50 text-neutral-800 font-semibold">
                      <tr>
                        <th className="px-4 py-3 text-center w-12" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-brand rounded border-neutral-300 focus:ring-brand cursor-pointer"
                            checked={isAllVisibleSelected}
                            onChange={handleSelectAllRooms}
                          />
                        </th>
                        <th className="px-4 py-3 text-left">Hình ảnh</th>
                        <th className="px-4 py-3 text-left">Số phòng</th>
                        <th className="px-4 py-3 text-left">Loại phòng</th>
                        <th className="px-4 py-3 text-left">Tầng</th>
                        <th className="px-4 py-3 text-left">Diện tích</th>
                        <th className="px-4 py-3 text-left">Giá thuê</th>
                        <th className="px-4 py-3 text-left">Tối đa</th>
                        <th className="px-4 py-3 text-left">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 bg-white">
                      {filteredRooms.map((room) => {
                        const isChecked = selectedRoomIds.includes(room.id);
                        const roomPrimaryImage = room.images?.find((img) => img.isPrimary) || room.images?.[0];
                        const imgUrl = roomPrimaryImage ? `${backendUrl}${roomPrimaryImage.imagePath}` : null;

                        const statusLabel = room.status || 'Chưa rõ';
                        const colorClass = ROOM_STATUS_COLORS[statusLabel] || 'bg-zinc-100 text-zinc-800 border-zinc-200';

                        return (
                          <tr
                            key={room.id}
                            className={`hover:bg-neutral-50/50 transition-colors cursor-pointer ${isChecked ? 'bg-brand/5 hover:bg-brand/5' : ''}`}
                            onClick={() => handleSelectRoom(room.id)}
                          >
                            <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-brand rounded border-neutral-300 focus:ring-brand cursor-pointer"
                                checked={isChecked}
                                onChange={() => handleSelectRoom(room.id)}
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="w-12 h-9 rounded-lg overflow-hidden border border-neutral-100 bg-neutral-50 flex items-center justify-center">
                                {imgUrl ? (
                                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <svg className="w-4 h-4 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                                  </svg>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-bold text-neutral-900">{room.roomNumber}</td>
                            <td className="px-4 py-3 text-neutral-600">{room.type}</td>
                            <td className="px-4 py-3 text-neutral-600">Tầng {room.floor}</td>
                            <td className="px-4 py-3 text-neutral-600 font-medium">{room.area} m²</td>
                            <td className="px-4 py-3 font-bold text-neutral-900">{formatCurrency(room.price)}</td>
                            <td className="px-4 py-3 text-neutral-600">{room.maxPeople} người</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${colorClass}`}>
                                {statusLabel}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Building Specs */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-neutral-900 text-base">Thông tin chi tiết</h3>
              <div className="border-b border-neutral-100 pb-2"></div>

              <div className="space-y-3.5">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500 font-medium">Số tầng:</span>
                  <span className="font-bold text-neutral-800">{building.numberOfFloors} tầng</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500 font-medium">Mã tòa nhà:</span>
                  <span className="font-bold text-neutral-800 uppercase">{building.id}</span>
                </div>
                <div className="flex flex-col gap-1 text-xs">
                  <span className="text-neutral-500 font-medium">Khu vực:</span>
                  <span className="font-semibold text-neutral-800 leading-normal">
                    {building.address?.ward?.name}, {building.address?.ward?.province?.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Amenities Card */}
            <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-neutral-900 text-base">Tiện ích đi kèm</h3>
              <div className="border-b border-neutral-100 pb-2"></div>

              <div className="flex flex-wrap gap-2">
                {['Bảo vệ 24/7', 'Thang máy tốc độ cao', 'Hầm đỗ xe', 'Hệ thống PCCC tiêu chuẩn', 'Máy phát điện dự phòng', 'Dọn dẹp định kỳ'].map((amenity, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] md:text-xs font-bold text-brand bg-brand/5 border border-brand/10 px-2.5 py-1 rounded-full shadow-xs select-none"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-200 py-12 px-8 md:px-16 bg-neutral-50 text-center text-sm text-neutral-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Luxury Rental Management. Bảo lưu mọi quyền.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-neutral-900 transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Liên hệ hỗ trợ</a>
          </div>
        </div>
      </footer>

      {/* Lightbox / Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-8 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex justify-between items-center text-white">
            <span className="text-sm font-bold tracking-wider select-none">
              {activeImageIndex + 1} / {galleryImages.length}
            </span>
            <button
              onClick={closeLightbox}
              className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer select-none text-white focus:outline-none"
              title="Đóng (Esc)"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main display */}
          <div className="relative flex-1 flex items-center justify-center max-w-5xl mx-auto w-full group/lightbox">
            {/* Prev Button */}
            <button
              onClick={prevImage}
              className="absolute left-2 md:left-4 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all focus:outline-none cursor-pointer opacity-0 group-hover/lightbox:opacity-100 select-none shadow-md backdrop-blur-sm"
              title="Ảnh trước"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Current Image */}
            <div className="w-full h-full max-h-[70vh] flex items-center justify-center p-2 select-none relative">
              <img
                src={galleryImages[activeImageIndex]}
                alt=""
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl transition-all duration-300 transform scale-100"
              />
            </div>

            {/* Next Button */}
            <button
              onClick={nextImage}
              className="absolute right-2 md:right-4 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all focus:outline-none cursor-pointer opacity-0 group-hover/lightbox:opacity-100 select-none shadow-md backdrop-blur-sm"
              title="Ảnh tiếp theo"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Bottom Thumbnails Strip */}
          <div className="max-w-4xl mx-auto w-full overflow-x-auto py-4 px-2 whitespace-nowrap scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            <div className="flex justify-center gap-2">
              {galleryImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative shrink-0 w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden cursor-pointer transition-all ${idx === activeImageIndex
                    ? 'ring-2 ring-brand ring-offset-2 ring-offset-black scale-105'
                    : 'opacity-50 hover:opacity-100'
                    }`}
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Rooms Request Modal */}
      {isRoomModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsRoomModalOpen(false)}
        >
          <div
            className="bg-[#F5F5F7] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/20 text-neutral-900 text-left animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 bg-white border-b border-neutral-200 flex justify-between items-center rounded-t-3xl">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-neutral-900 tracking-tight">
                  Đặt lịch hẹn xem phòng
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Gửi yêu cầu xem phòng cho ban quản lý tòa nhà {building.name}.
                </p>
              </div>
              <button
                onClick={() => setIsRoomModalOpen(false)}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer select-none text-neutral-500 focus:outline-none"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSendRequests} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {/* Selected Rooms Summary */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">Phòng đã chọn xem</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {rooms
                      .filter((room) => selectedRoomIds.includes(room.id))
                      .map((room) => (
                        <span key={room.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand/5 border border-brand/10 text-brand rounded-full text-xs font-bold shadow-xs">
                          Phòng {room.roomNumber} - {room.type} ({room.area} m²)
                        </span>
                      ))}
                  </div>
                </div>

                {/* Appointment Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                    Ngày giờ hẹn xem phòng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm bg-white text-neutral-900 transition-all font-medium"
                  />
                  <p className="text-[10px] text-neutral-400">
                    * Vui lòng chọn giờ hẹn trong khoảng giờ làm việc hành chính (08:00 - 18:00).
                  </p>
                </div>

                {/* Request Content / Message */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                    Lời nhắn / Yêu cầu thêm (Tùy chọn)
                  </label>
                  <textarea
                    value={requestContent}
                    onChange={(e) => setRequestContent(e.target.value)}
                    placeholder="Ví dụ: Tôi muốn xem thêm các tiện ích đi kèm xung quanh tòa nhà, hoặc có yêu cầu gì đặc biệt..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm bg-white text-neutral-900 h-28 resize-none transition-all placeholder-neutral-400"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-white border-t border-neutral-200 flex justify-end gap-3 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-50 text-neutral-700 font-bold rounded-xl text-xs transition-colors cursor-pointer select-none"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-brand hover:bg-brand-hover disabled:bg-neutral-300 disabled:text-neutral-400 text-white font-bold rounded-xl text-xs transition-all shadow-sm select-none cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Đang gửi...
                    </>
                  ) : (
                    'Xác nhận gửi yêu cầu'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
