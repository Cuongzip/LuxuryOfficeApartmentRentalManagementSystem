BEGIN TRY

BEGIN TRAN;

-- CreateSchema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'dbo') EXEC sp_executesql N'CREATE SCHEMA [dbo];';

-- CreateTable
CREATE TABLE [dbo].[ToaNha] (
    [MaToaNha] VARCHAR(10) NOT NULL,
    [TenToaNha] NVARCHAR(100) NOT NULL,
    [DiaChi] NVARCHAR(255) NOT NULL,
    [SoTang] INT NOT NULL,
    [MoTa] NVARCHAR(1000),
    [HinhAnh] NVARCHAR(255),
    [NgayXoa] DATETIME2,
    CONSTRAINT [ToaNha_pkey] PRIMARY KEY CLUSTERED ([MaToaNha])
);

-- CreateTable
CREATE TABLE [dbo].[Phong] (
    [MaPhong] VARCHAR(10) NOT NULL,
    [LoaiPhong] NVARCHAR(20) NOT NULL,
    [Tang] INT NOT NULL,
    [DienTich] DECIMAL(8,2) NOT NULL,
    [DonGiaThue] DECIMAL(18,2) NOT NULL,
    [TrangThai] NVARCHAR(20) NOT NULL,
    [HinhAnh] NVARCHAR(255),
    [MoTa] NVARCHAR(1000),
    [SoNguoiToiDa] TINYINT NOT NULL CONSTRAINT [Phong_SoNguoiToiDa_df] DEFAULT 2,
    [NgayXoa] DATETIME2,
    [MaToaNha] VARCHAR(10) NOT NULL,
    CONSTRAINT [Phong_pkey] PRIMARY KEY CLUSTERED ([MaPhong])
);

-- CreateTable
CREATE TABLE [dbo].[KhachHang] (
    [MaKhachHang] VARCHAR(10) NOT NULL,
    [HoTen] NVARCHAR(100) NOT NULL,
    [CCCD] CHAR(12) NOT NULL,
    [SoDienThoai] VARCHAR(10) NOT NULL,
    [DiaChi] NVARCHAR(255),
    [GioiTinh] NVARCHAR(20),
    [NgaySinh] DATETIME2,
    [MaTaiKhoan] VARCHAR(10) NOT NULL,
    CONSTRAINT [KhachHang_pkey] PRIMARY KEY CLUSTERED ([MaKhachHang]),
    CONSTRAINT [KhachHang_CCCD_key] UNIQUE NONCLUSTERED ([CCCD]),
    CONSTRAINT [KhachHang_SoDienThoai_key] UNIQUE NONCLUSTERED ([SoDienThoai]),
    CONSTRAINT [KhachHang_MaTaiKhoan_key] UNIQUE NONCLUSTERED ([MaTaiKhoan])
);

-- CreateTable
CREATE TABLE [dbo].[NhanVien] (
    [MaNhanVien] VARCHAR(10) NOT NULL,
    [HoTen] NVARCHAR(100) NOT NULL,
    [SoDienThoai] VARCHAR(10) NOT NULL,
    [CCCD] CHAR(12) NOT NULL,
    [GioiTinh] NVARCHAR(10),
    [NgaySinh] DATETIME2,
    [MaTaiKhoan] VARCHAR(10) NOT NULL,
    CONSTRAINT [NhanVien_pkey] PRIMARY KEY CLUSTERED ([MaNhanVien]),
    CONSTRAINT [NhanVien_SoDienThoai_key] UNIQUE NONCLUSTERED ([SoDienThoai]),
    CONSTRAINT [NhanVien_CCCD_key] UNIQUE NONCLUSTERED ([CCCD]),
    CONSTRAINT [NhanVien_MaTaiKhoan_key] UNIQUE NONCLUSTERED ([MaTaiKhoan])
);

-- CreateTable
CREATE TABLE [dbo].[HopDong] (
    [MaHopDong] VARCHAR(10) NOT NULL,
    [NgayLap] DATETIME2 NOT NULL,
    [NgayBatDau] DATETIME2 NOT NULL,
    [NgayKetThuc] DATETIME2 NOT NULL,
    [TienCoc] DECIMAL(18,2) CONSTRAINT [HopDong_TienCoc_df] DEFAULT 0,
    [TrangThaiHopDong] NVARCHAR(20) NOT NULL,
    [MaPhong] VARCHAR(10),
    [MaKhachHang] VARCHAR(10),
    [MaNhanVien] VARCHAR(10) NOT NULL,
    CONSTRAINT [HopDong_pkey] PRIMARY KEY CLUSTERED ([MaHopDong])
);

-- CreateTable
CREATE TABLE [dbo].[HoaDon] (
    [MaHoaDon] VARCHAR(10) NOT NULL,
    [ThangThanhToan] TINYINT,
    [TienThue] DECIMAL(18,2) NOT NULL,
    [TienDien] DECIMAL(18,2) CONSTRAINT [HoaDon_TienDien_df] DEFAULT 0,
    [TienNuoc] DECIMAL(18,2) CONSTRAINT [HoaDon_TienNuoc_df] DEFAULT 0,
    [PhiDichVu] DECIMAL(18,2) CONSTRAINT [HoaDon_PhiDichVu_df] DEFAULT 0,
    [TongTien] DECIMAL(18,2) NOT NULL,
    [NgayTao] DATETIME2 CONSTRAINT [HoaDon_NgayTao_df] DEFAULT CURRENT_TIMESTAMP,
    [NgayHetHan] DATETIME2,
    [NgayThanhToan] DATETIME2,
    [TrangThaiThanhToan] NVARCHAR(20) NOT NULL,
    [PhuongThucThanhToan] NVARCHAR(20),
    [MaHopDong] VARCHAR(10) NOT NULL,
    CONSTRAINT [HoaDon_pkey] PRIMARY KEY CLUSTERED ([MaHoaDon])
);

-- CreateTable
CREATE TABLE [dbo].[NguoiSuDung] (
    [MaDinhDanh] VARCHAR(10) NOT NULL,
    [HoTen] NVARCHAR(100) NOT NULL,
    [CCCD] CHAR(12) NOT NULL,
    [SoDienThoai] VARCHAR(10) NOT NULL,
    [HinhAnh] NVARCHAR(255),
    [LoaiCuTru] NVARCHAR(20) NOT NULL,
    [TrangThaiCuTru] NVARCHAR(20) NOT NULL,
    [NgaySinh] DATETIME2,
    [GioiTinh] NVARCHAR(20),
    [MaPhong] VARCHAR(10),
    CONSTRAINT [NguoiSuDung_pkey] PRIMARY KEY CLUSTERED ([MaDinhDanh]),
    CONSTRAINT [NguoiSuDung_CCCD_key] UNIQUE NONCLUSTERED ([CCCD]),
    CONSTRAINT [NguoiSuDung_SoDienThoai_key] UNIQUE NONCLUSTERED ([SoDienThoai])
);

-- CreateTable
CREATE TABLE [dbo].[TaiKhoan] (
    [MaTaiKhoan] VARCHAR(10) NOT NULL,
    [Email] VARCHAR(50) NOT NULL,
    [MatKhau] VARCHAR(255) NOT NULL,
    [VaiTro] NVARCHAR(20) NOT NULL,
    [TrangThaiTaiKhoan] NVARCHAR(20) NOT NULL CONSTRAINT [TaiKhoan_TrangThaiTaiKhoan_df] DEFAULT 'Cho xac thuc',
    [MaXacThuc] NVARCHAR(255),
    [HanXacThuc] DATETIME2,
    [SoLanDangNhapSai] TINYINT NOT NULL CONSTRAINT [TaiKhoan_SoLanDangNhapSai_df] DEFAULT 0,
    [SoLanGuiLai] TINYINT NOT NULL CONSTRAINT [TaiKhoan_SoLanGuiLai_df] DEFAULT 0,
    [SoLanNhapSai] TINYINT NOT NULL CONSTRAINT [TaiKhoan_SoLanNhapSai_df] DEFAULT 0,
    [ThoiGianKhoaGui] DATETIME2,
    CONSTRAINT [TaiKhoan_pkey] PRIMARY KEY CLUSTERED ([MaTaiKhoan]),
    CONSTRAINT [TaiKhoan_Email_key] UNIQUE NONCLUSTERED ([Email])
);

-- CreateTable
CREATE TABLE [dbo].[YeuCau] (
    [MaYeuCau] VARCHAR(10) NOT NULL,
    [TrangThai] NVARCHAR(20) NOT NULL,
    [NgayTao] DATETIME2 NOT NULL,
    [NoiDung] NVARCHAR(100),
    [LoaiYeuCau] NVARCHAR(20) NOT NULL,
    [NgayHen] DATETIME2,
    [MaPhong] VARCHAR(10) NOT NULL,
    [MaKhachHang] VARCHAR(10) NOT NULL,
    CONSTRAINT [YeuCau_pkey] PRIMARY KEY CLUSTERED ([MaYeuCau])
);

-- AddForeignKey
ALTER TABLE [dbo].[Phong] ADD CONSTRAINT [Phong_MaToaNha_fkey] FOREIGN KEY ([MaToaNha]) REFERENCES [dbo].[ToaNha]([MaToaNha]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[KhachHang] ADD CONSTRAINT [KhachHang_MaTaiKhoan_fkey] FOREIGN KEY ([MaTaiKhoan]) REFERENCES [dbo].[TaiKhoan]([MaTaiKhoan]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[NhanVien] ADD CONSTRAINT [NhanVien_MaTaiKhoan_fkey] FOREIGN KEY ([MaTaiKhoan]) REFERENCES [dbo].[TaiKhoan]([MaTaiKhoan]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[HopDong] ADD CONSTRAINT [HopDong_MaPhong_fkey] FOREIGN KEY ([MaPhong]) REFERENCES [dbo].[Phong]([MaPhong]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[HopDong] ADD CONSTRAINT [HopDong_MaKhachHang_fkey] FOREIGN KEY ([MaKhachHang]) REFERENCES [dbo].[KhachHang]([MaKhachHang]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[HopDong] ADD CONSTRAINT [HopDong_MaNhanVien_fkey] FOREIGN KEY ([MaNhanVien]) REFERENCES [dbo].[NhanVien]([MaNhanVien]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[HoaDon] ADD CONSTRAINT [HoaDon_MaHopDong_fkey] FOREIGN KEY ([MaHopDong]) REFERENCES [dbo].[HopDong]([MaHopDong]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[NguoiSuDung] ADD CONSTRAINT [NguoiSuDung_MaPhong_fkey] FOREIGN KEY ([MaPhong]) REFERENCES [dbo].[Phong]([MaPhong]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[YeuCau] ADD CONSTRAINT [YeuCau_MaPhong_fkey] FOREIGN KEY ([MaPhong]) REFERENCES [dbo].[Phong]([MaPhong]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[YeuCau] ADD CONSTRAINT [YeuCau_MaKhachHang_fkey] FOREIGN KEY ([MaKhachHang]) REFERENCES [dbo].[KhachHang]([MaKhachHang]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
