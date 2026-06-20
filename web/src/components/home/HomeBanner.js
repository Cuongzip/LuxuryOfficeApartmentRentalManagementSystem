import React from 'react';
import { SearchBar } from '../ui/SearchBar';

export const HomeBanner = ({
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
  handleSearch,
}) => {

  return (
    <section className="px-4 md:px-16 py-6 md:py-10 bg-white">
      <div className=" mx-auto">
        <div className="relative w-full h-[580px] hidden md:block">
          <div className="absolute top-0 left-0 w-[39%] h-[44%] bg-[#e2ebfc] rounded-tl-[1.5rem] rounded-tr-[1.5rem] p-8 flex flex-col justify-center select-none z-20">
            <h1 className="text-[2.5rem] lg:text-[3.1rem] font-extrabold text-neutral-900 leading-tight">
              Tìm Tòa Nhà
              Thuê Lý Tưởng

              Thật <span className="inline-block bg-white text-neutral-900 px-4 py-1.5 rounded-full border border-neutral-200/80 shadow-sm text-[1.85rem] lg:text-[2.5rem] font-black mt-2">Dễ Dàng</span>
            </h1>
          </div>

          <svg
            className="absolute left-[39%] top-[41%] -translate-y-full w-6 h-6 z-20 pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M 0 0 A 24 24 0 0 0 24 24 L 0 24 Z" fill="#e2ebfc" />
          </svg>

          <div className="absolute top-[41%] left-0 w-[57%] h-[40%] bg-[#e2ebfc] rounded-tr-[1.5rem] rounded-br-[1.5rem] rounded-bl-[1.5rem] px-8 py-7 flex flex-col justify-between z-20">
            <p className="text-base lg:text-lg leading-relaxed  mb-5">
              PrimeSpace định nghĩa lại trải nghiệm thuê nhà và văn phòng một cách liền mạch, mang đến giải pháp tối ưu được thiết kế riêng cho nhu cầu của bạn.
            </p>

            <SearchBar
              variant="banner"
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
          </div>

          <div className="absolute top-[85%] bottom-0 left-0 w-[57%] h-[15%] bg-[#1c1c1c] rounded-[1.5rem] px-10 py-6 shadow-sm z-15">
            <div className="h-full flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-3xl lg:text-4xl font-extrabold text-white">15K+</h4>
                <p className="text-xs lg:text-base text-neutral-400">Khách Hàng Tin Dùng</p>
              </div>
              <div className="w-px h-8 bg-neutral-800"></div>
              <div className="space-y-1">
                <h4 className="text-3xl lg:text-4xl font-extrabold text-white">35+</h4>
                <p className="text-xs lg:text-base text-neutral-400">Tỉnh Thành</p>
              </div>
              <div className="w-px h-8 bg-neutral-800"></div>
              <div className="space-y-1">
                <h4 className="text-3xl lg:text-4xl font-extrabold text-white">20K+</h4>
                <p className="text-xs lg:text-base text-neutral-400">Bất Động Sản</p>
              </div>
            </div>
          </div>

          <div
            className="absolute right-0 top-0 w-[59%] h-full bg-cover bg-center rounded-[1.5rem] shadow-sm z-0"
            style={{
              backgroundImage: "url('/images/banner.jpg')",
            }}
          ></div>

          <div className="absolute left-[40%] top-[37%] w-[19%] bottom-0 bg-white z-10 pointer-events-none rounded-tr-[1.5rem]"></div>

          <svg
            className="absolute left-[41%] top-[37%] -translate-y-full w-6 h-6 z-10 pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M 0 0 A 24 24 0 0 0 24 24 L 0 24 Z" fill="white" />
          </svg>

          <svg
            className="absolute left-[59%] bottom-0 w-6 h-6 z-10 pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M 0 0 A 24 24 0 0 0 24 24 L 0 24 Z" fill="white" />
          </svg>
        </div>

        <div className="block md:hidden space-y-4">
          <div className="bg-[#e2ebfc] rounded-3xl p-6 space-y-5 shadow-sm">
            <h1 className="text-4xl font-extrabold text-neutral-900 leading-tight">
              Tìm <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-neutral-300 bg-white mx-0.5 text-neutral-800 text-base">↗</span> Tòa Nhà
              <br />
              Thuê Lý Tưởng
              <br />
              Thật <span className="inline-block bg-white text-neutral-900 px-3.5 py-1.5 rounded-full border border-neutral-200/80 shadow-sm text-2xl font-black mt-1">Dễ Dàng</span>
            </h1>

            <p className="text-neutral-600 text-base leading-relaxed">
              PrimeSpace định nghĩa lại trải nghiệm thuê nhà và văn phòng một cách liền mạch, mang đến giải pháp tối ưu được thiết kế riêng cho nhu cầu của bạn.
            </p>

            <SearchBar
              variant="banner"
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
          </div>

          <div
            className="w-full h-56 rounded-3xl bg-cover bg-center shadow-sm"
            style={{ backgroundImage: "url('/images/banner.jpg')" }}
          ></div>

          <div className="bg-[#1c1c1c] rounded-3xl p-6 shadow-sm">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="space-y-1">
                <h4 className="text-3xl font-extrabold text-white">15K+</h4>
                <p className="text-sm text-neutral-400">Khách Hàng</p>
              </div>
              <div className="space-y-1 border-x border-neutral-800">
                <h4 className="text-3xl font-extrabold text-white">35+</h4>
                <p className="text-sm text-neutral-400">Tỉnh Thành</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-3xl font-extrabold text-white">20K+</h4>
                <p className="text-sm text-neutral-400">Bất Động Sản</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
