'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ROLES, getRoomStatus } from '@/constants';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { buildingService } from '@/services/building.service';
import { roomService } from '@/services/room.service';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/utils/format';
import toast from 'react-hot-toast';

export default function PublicHome() {
  const { user, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const [isLoadingBuildings, setIsLoadingBuildings] = useState(true);
  
  const [rooms, setRooms] = useState([]);
  
  // Draft filter states (updated in inputs/popovers immediately)
  const [searchKeyword, setSearchKeyword] = useState('');
  const [draftCity, setDraftCity] = useState('');
  const [draftDistrict, setDraftDistrict] = useState('');
  const [draftWard, setDraftWard] = useState('');
  const [draftRoomType, setDraftRoomType] = useState('');

  // Temporary location inputs (inside location popover before clicking "Áp dụng")
  const [tempCity, setTempCity] = useState('');
  const [tempDistrict, setTempDistrict] = useState('');
  const [tempWard, setTempWard] = useState('');

  // Applied filter states (updated ONLY when "Tìm nhà" button is clicked)
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [appliedCity, setAppliedCity] = useState('');
  const [appliedDistrict, setAppliedDistrict] = useState('');
  const [appliedWard, setAppliedWard] = useState('');
  const [appliedRoomType, setAppliedRoomType] = useState('');

  // Dropdown toggles
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isRoomTypeOpen, setIsRoomTypeOpen] = useState(false);

  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildingRooms, setBuildingRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [bData, rData] = await Promise.all([
          buildingService.getBuildings({ limit: 1000 }),
          roomService.getRooms({ limit: 1000 })
        ]);
        setBuildings(bData || []);
        setRooms(rData || []);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu trang chủ:', err);
      } finally {
        setIsLoadingBuildings(false);
      }
    };
    
    Promise.resolve().then(() => {
      fetchHomeData();
    });
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isVerified = params.get('verified') === 'true';
      const showLogin = params.get('showLogin') === 'true';
      const showRegister = params.get('showRegister') === 'true';

      Promise.resolve().then(() => {
        if (isVerified) {
          toast.success('Xác thực tài khoản thành công! Vui lòng đăng nhập.');
          setIsLoginOpen(true);
          window.history.replaceState(null, '', `${window.location.pathname}?showLogin=true`);
        } else if (showLogin) {
          setIsLoginOpen(true);
        } else if (showRegister) {
          setIsRegisterOpen(true);
        }
      });
    }
  }, []);

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleCloseRegister = () => {
    setIsRegisterOpen(false);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleSwitchToRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `${window.location.pathname}?showRegister=true`);
    }
  };

  const handleSwitchToLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `${window.location.pathname}?showLogin=true`);
    }
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

  const parsedAddresses = buildings.map((b) => ({
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

  const uniqueRoomTypes = Array.from(new Set(rooms.map((r) => r.type).filter(Boolean)));

  const filteredBuildings = buildings.filter((building) => {
    if (appliedKeyword.trim()) {
      const kw = appliedKeyword.toLowerCase();
      const matchName = building.name.toLowerCase().includes(kw);
      const matchAddress = building.address.toLowerCase().includes(kw);
      if (!matchName && !matchAddress) return false;
    }
    
    const parsed = parseAddress(building.address);
    if (appliedCity && parsed.city !== appliedCity) return false;
    if (appliedDistrict && parsed.district !== appliedDistrict) return false;
    if (appliedWard && parsed.ward !== appliedWard) return false;

    if (appliedRoomType) {
      const hasMatchingRoom = rooms.some(
        (room) => room.buildingId === building.id && room.type === appliedRoomType
      );
      if (!hasMatchingRoom) {
        return false;
      }
    }
    return true;
  });

  const handleViewDetail = async (building) => {
    if (!user) {
      setIsLoginOpen(true);
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

  const handleSearch = () => {
    setIsLocationOpen(false);
    setIsRoomTypeOpen(false);
    setAppliedKeyword(searchKeyword);
    setAppliedCity(draftCity);
    setAppliedDistrict(draftDistrict);
    setAppliedWard(draftWard);
    setAppliedRoomType(draftRoomType);

    // Scroll to product listings section
    setTimeout(() => {
      document.getElementById('buildings')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleClearFilters = () => {
    setSearchKeyword('');
    setTempCity('');
    setTempDistrict('');
    setTempWard('');
    setDraftCity('');
    setDraftDistrict('');
    setDraftWard('');
    setDraftRoomType('');
    setAppliedKeyword('');
    setAppliedCity('');
    setAppliedDistrict('');
    setAppliedWard('');
    setAppliedRoomType('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-neutral-900 font-sans selection:bg-brand selection:text-white">
      <PublicHeader
        user={user}
        logout={logout}
        onLoginClick={() => {
          setIsLoginOpen(true);
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', `${window.location.pathname}?showLogin=true`);
          }
        }}
        onRegisterClick={() => {
          setIsRegisterOpen(true);
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', `${window.location.pathname}?showRegister=true`);
          }
        }}
        // Search states
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
        draftCity={draftCity}
        setDraftCity={setDraftCity}
        draftDistrict={draftDistrict}
        setDraftDistrict={setDraftDistrict}
        draftWard={draftWard}
        setDraftWard={setDraftWard}
        draftRoomType={draftRoomType}
        setDraftRoomType={setDraftRoomType}
        tempCity={tempCity}
        setTempCity={setTempCity}
        tempDistrict={tempDistrict}
        setTempDistrict={setTempDistrict}
        tempWard={tempWard}
        setTempWard={setTempWard}
        isLocationOpen={isLocationOpen}
        setIsLocationOpen={setIsLocationOpen}
        isRoomTypeOpen={isRoomTypeOpen}
        setIsRoomTypeOpen={setIsRoomTypeOpen}
        handleSearch={handleSearch}
        cities={cities}
        districts={districts}
        wards={wards}
        uniqueRoomTypes={uniqueRoomTypes}
        appliedKeyword={appliedKeyword}
        appliedCity={appliedCity}
        appliedDistrict={appliedDistrict}
        appliedWard={appliedWard}
        appliedRoomType={appliedRoomType}
        handleClearFilters={handleClearFilters}
      />

      <main className="flex-1 flex flex-col">
        {/* Buildings Section */}
        <section id="buildings" className="py-16 px-8 md:px-16 bg-neutral-50/50 border-b border-neutral-100">
          <div className="max-w-6xl mx-auto space-y-12">
            
            {/* Header info with Reset Filters option */}
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between border-b border-neutral-200 pb-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase block">Hệ thống của chúng tôi</span>
                <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">Danh sách Tòa nhà & Phòng trống</h2>
                <p className="text-neutral-500 text-sm">Xem chi tiết thông tin các tòa nhà và toàn bộ danh sách phòng tương ứng bên dưới.</p>
              </div>
              {(appliedKeyword || appliedCity || appliedDistrict || appliedWard || appliedRoomType) && (
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

            {isLoadingBuildings ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredBuildings.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-sm bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
                Không tìm thấy tòa nhà nào phù hợp với bộ lọc tìm kiếm.
              </div>
            ) : (
              <div className="space-y-12">
                {filteredBuildings.map((building) => {
                  const primaryImage = building.images?.find(img => img.isPrimary) || building.images?.[0];
                  const backendUrl = process.env.NEXT_PUBLIC_API_URL 
                    ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') 
                    : 'http://localhost:3000';
                  
                  // Filter rooms belonging to this building and matching room type filter (if set)
                  const displayedRooms = rooms.filter(
                    (room) => room.buildingId === building.id && (!appliedRoomType || room.type === appliedRoomType)
                  );

                  return (
                    <div key={building.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm p-6 md:p-8 space-y-6">
                      {/* Building Info Row */}
                      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 pb-6 border-b border-neutral-100">
                        {/* Building Image */}
                        <div className="w-full lg:w-1/4 aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 relative shrink-0">
                          {primaryImage ? (
                            <img 
                              src={`${backendUrl}${primaryImage.imagePath}`} 
                              alt={building.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-brand/5 text-brand/40">
                              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                          )}
                          <div className="absolute top-3 right-3 bg-brand/90 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-sm backdrop-blur-sm">
                            {building.numberOfFloors} tầng
                          </div>
                        </div>

                        {/* Building Text */}
                        <div className="flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="text-xl font-bold text-neutral-900 hover:text-brand transition-colors">{building.name}</h3>
                              <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Mã: {building.id}</span>
                            </div>
                            <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{building.address}</span>
                            </p>
                            <p className="text-neutral-600 text-sm leading-relaxed">
                              {building.description || "Tòa nhà cho thuê cao cấp sở hữu vị trí đắc địa, giao thông thuận tiện và các dịch vụ quản lý tiện ích chuẩn quốc tế."}
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

                      {/* Rooms List Section within this Building */}
                      <div className="space-y-4 pt-2">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                          <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          Danh sách phòng cho thuê
                        </h4>

                        {displayedRooms.length === 0 ? (
                          <p className="text-xs text-neutral-400 italic">Không có phòng nào trong tòa nhà này phù hợp với bộ lọc.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {displayedRooms.map((room) => {
                              const roomPrimaryImage = room.images?.find(img => img.isPrimary) || room.images?.[0];
                              const statusCfg = getRoomStatus(room.status);
                              return (
                                <div key={room.id} className="bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-200/60 rounded-xl p-3 flex flex-col justify-between space-y-3 transition-all duration-200 group/room">
                                  <div className="space-y-2">
                                    <div className="aspect-[4/3] rounded-lg overflow-hidden border border-neutral-200/50 bg-neutral-200 shrink-0 relative">
                                      {roomPrimaryImage ? (
                                        <img 
                                          src={`${backendUrl}${roomPrimaryImage.imagePath}`} 
                                          alt="" 
                                          className="w-full h-full object-cover group-hover/room:scale-105 transition-transform duration-300"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400">
                                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                                          </svg>
                                        </div>
                                      )}
                                      <span className={`absolute top-2 right-2 px-2 py-0.5 text-[9px] rounded-full font-bold border backdrop-blur-md shadow-sm ${statusCfg.colorClass}`}>
                                        {statusCfg.label}
                                      </span>
                                    </div>

                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-neutral-900 text-sm">Phòng {room.roomNumber}</span>
                                        <span className="text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded font-semibold">{room.type}</span>
                                      </div>
                                      
                                      <div className="grid grid-cols-3 gap-1 text-[10px] text-neutral-500 pt-1.5 border-t border-neutral-200/40">
                                        <div>Tầng {room.floor}</div>
                                        <div className="text-center">{room.area} m²</div>
                                        <div className="text-right">Max: {room.maxPeople}</div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="pt-2 border-t border-neutral-200/40 flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold text-brand">{formatCurrency(room.price)}<span className="text-[9px] text-neutral-400 font-normal">/tháng</span></span>
                                    <button
                                      onClick={() => handleViewDetail(building)}
                                      className="text-[10px] px-2.5 py-1 bg-brand text-white font-bold rounded hover:bg-brand-hover transition-colors cursor-pointer"
                                    >
                                      Liên hệ
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section id="features" className="py-24 px-8 md:px-16 max-w-6xl mx-auto space-y-16">
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
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Luxury Rental Management. Bảo lưu mọi quyền.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-neutral-900 transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Liên hệ hỗ trợ</a>
          </div>
        </div>
      </footer>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={handleCloseLogin}
        onSwitchToRegister={handleSwitchToRegister}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={handleCloseRegister}
        onSwitchToLogin={handleSwitchToLogin}
      />

      {selectedBuilding && (
        <Modal
          isOpen={!!selectedBuilding}
          onClose={() => {
            setSelectedBuilding(null);
            setBuildingRooms([]);
          }}
          title={`Chi tiết tòa nhà: ${selectedBuilding.name}`}
          size="xl"
          className="max-w-4xl"
        >
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 text-neutral-900">
            {/* Building details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  <strong className="text-neutral-900 font-semibold">Địa chỉ:</strong> {selectedBuilding.address}
                </p>
                <p className="text-sm text-slate-600">
                  <strong className="text-neutral-900 font-semibold">Số tầng:</strong> {selectedBuilding.numberOfFloors} tầng
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  <strong className="text-neutral-900 font-semibold block mb-1">Mô tả:</strong> 
                  {selectedBuilding.description || 'Không có mô tả.'}
                </p>
              </div>

              {/* Building Images Gallery */}
              {selectedBuilding.images && selectedBuilding.images.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-bold text-neutral-950">Hình ảnh tòa nhà:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedBuilding.images.map((img, idx) => {
                      const backendUrl = process.env.NEXT_PUBLIC_API_URL 
                        ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') 
                        : 'http://localhost:3000';
                      return (
                        <div key={idx} className="aspect-video rounded-lg overflow-hidden border border-neutral-200">
                          <img src={`${backendUrl}${img.imagePath}`} alt="" className="w-full h-full object-cover" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Rooms list */}
            <div className="space-y-4 pt-4 border-t border-neutral-100">
              <h4 className="font-bold text-neutral-900 text-base">Danh sách phòng của tòa nhà</h4>
              
              {isLoadingRooms ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : buildingRooms.length === 0 ? (
                <p className="text-sm text-neutral-500 italic">Hiện tại chưa có phòng nào trong tòa nhà này.</p>
              ) : (
                <div className="overflow-x-auto border border-neutral-200 rounded-xl">
                  <table className="min-w-full divide-y divide-neutral-200 text-sm bg-white">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-neutral-700">Hình ảnh</th>
                        <th className="px-4 py-3 text-left font-semibold text-neutral-700">Số phòng</th>
                        <th className="px-4 py-3 text-left font-semibold text-neutral-700">Loại phòng</th>
                        <th className="px-4 py-3 text-left font-semibold text-neutral-700">Tầng</th>
                        <th className="px-4 py-3 text-left font-semibold text-neutral-700">Diện tích</th>
                        <th className="px-4 py-3 text-left font-semibold text-neutral-700">Giá thuê</th>
                        <th className="px-4 py-3 text-left font-semibold text-neutral-700">Số người tối đa</th>
                        <th className="px-4 py-3 text-left font-semibold text-neutral-700">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 bg-white">
                      {buildingRooms.map((room) => {
                        const roomPrimaryImage = room.images?.find(img => img.isPrimary) || room.images?.[0];
                        const backendUrl = process.env.NEXT_PUBLIC_API_URL 
                          ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') 
                          : 'http://localhost:3000';
                        const statusCfg = getRoomStatus(room.status);

                        return (
                          <tr key={room.id} className="hover:bg-neutral-50/50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="w-10 h-10 rounded overflow-hidden border border-neutral-100 bg-neutral-50 flex items-center justify-center">
                                {roomPrimaryImage ? (
                                  <img 
                                    src={`${backendUrl}${roomPrimaryImage.imagePath}`} 
                                    alt="" 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <svg className="w-5 h-5 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                                  </svg>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-semibold text-neutral-900">{room.roomNumber}</td>
                            <td className="px-4 py-3 text-neutral-600">{room.type}</td>
                            <td className="px-4 py-3 text-neutral-600">{room.floor}</td>
                            <td className="px-4 py-3 text-neutral-600">{room.area} m²</td>
                            <td className="px-4 py-3 font-medium text-neutral-900">{formatCurrency(room.price)}</td>
                            <td className="px-4 py-3 text-neutral-600">{room.maxPeople}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 text-xs rounded-full font-medium border ${statusCfg.colorClass}`}>
                                {statusCfg.label}
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
        </Modal>
      )}
    </div>
  );
}
