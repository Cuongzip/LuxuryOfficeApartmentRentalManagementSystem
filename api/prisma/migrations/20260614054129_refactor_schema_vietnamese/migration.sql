/*
  Warnings:

  - You are about to drop the column `LaAnhDaiDien` on the `AnhPhong` table. All the data in the column will be lost.
  - You are about to drop the column `ThuTuHienThi` on the `AnhPhong` table. All the data in the column will be lost.
  - You are about to drop the column `LaAnhDaiDien` on the `AnhToaNha` table. All the data in the column will be lost.
  - You are about to drop the column `ThuTuHienThi` on the `AnhToaNha` table. All the data in the column will be lost.
  - You are about to drop the column `NgayThanhToan` on the `HoaDon` table. All the data in the column will be lost.
  - You are about to drop the column `PhiDichVu` on the `HoaDon` table. All the data in the column will be lost.
  - You are about to drop the column `PhuongThucThanhToan` on the `HoaDon` table. All the data in the column will be lost.
  - You are about to drop the column `TienDien` on the `HoaDon` table. All the data in the column will be lost.
  - You are about to drop the column `TienNuoc` on the `HoaDon` table. All the data in the column will be lost.
  - You are about to drop the column `TienThue` on the `HoaDon` table. All the data in the column will be lost.
  - You are about to drop the column `TongTien` on the `HoaDon` table. All the data in the column will be lost.
  - You are about to drop the column `MaPhong` on the `HopDong` table. All the data in the column will be lost.
  - You are about to drop the column `NgayBatDau` on the `HopDong` table. All the data in the column will be lost.
  - You are about to drop the column `NgayKetThuc` on the `HopDong` table. All the data in the column will be lost.
  - You are about to alter the column `NgayLap` on the `HopDong` table. The data in that column could be lost. The data in that column will be cast from `DateTime2` to `Date`.
  - You are about to alter the column `NgaySinh` on the `KhachHang` table. The data in that column could be lost. The data in that column will be cast from `DateTime2` to `Date`.
  - You are about to alter the column `NgaySinh` on the `NguoiSuDung` table. The data in that column could be lost. The data in that column will be cast from `DateTime2` to `Date`.
  - You are about to alter the column `NgaySinh` on the `NhanVien` table. The data in that column could be lost. The data in that column will be cast from `DateTime2` to `Date`.
  - You are about to drop the column `DonGiaThue` on the `Phong` table. All the data in the column will be lost.
  - You are about to drop the column `HinhAnh` on the `Phong` table. All the data in the column will be lost.
  - You are about to alter the column `HanXacThuc` on the `TaiKhoan` table. The data in that column could be lost. The data in that column will be cast from `DateTime2` to `DateTime`.
  - You are about to alter the column `ThoiGianKhoaGui` on the `TaiKhoan` table. The data in that column could be lost. The data in that column will be cast from `DateTime2` to `DateTime`.
  - You are about to drop the column `HinhAnh` on the `ToaNha` table. All the data in the column will be lost.
  - The primary key for the `YeuCau` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `MaYeuCau` on the `YeuCau` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `NgayHen` on the `YeuCau` table. The data in that column could be lost. The data in that column will be cast from `DateTime` to `DateTime`.
  - You are about to alter the column `NgayTao` on the `YeuCau` table. The data in that column could be lost. The data in that column will be cast from `DateTime` to `DateTime`.
  - Added the required column `NamThanhToan` to the `HoaDon` table without a default value. This is not possible if the table is not empty.
  - Made the column `ThangThanhToan` on table `HoaDon` required. This step will fail if there are existing NULL values in that column.
  - Made the column `NgayTao` on table `HoaDon` required. This step will fail if there are existing NULL values in that column.
  - Made the column `NgayHetHan` on table `HoaDon` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `AnhHopDong` to the `HopDong` table without a default value. This is not possible if the table is not empty.
  - Made the column `TienCoc` on table `HopDong` required. This step will fail if there are existing NULL values in that column.
  - Made the column `MaKhachHang` on table `HopDong` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `MaHopDong` to the `NguoiSuDung` table without a default value. This is not possible if the table is not empty.
  - Made the column `MaPhong` on table `NguoiSuDung` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `GiaThue` to the `Phong` table without a default value. This is not possible if the table is not empty.
  - Added the required column `MaNhanVien` to the `YeuCau` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- Drop default constraints before altering or dropping columns
DECLARE @ConstraintName NVARCHAR(256);

SELECT @ConstraintName = name FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('dbo.HoaDon') AND parent_column_id = COLUMNPROPERTY(OBJECT_ID('dbo.HoaDon'), 'NgayTao', 'ColumnId');
IF @ConstraintName IS NOT NULL
    EXEC('ALTER TABLE [dbo].[HoaDon] DROP CONSTRAINT [' + @ConstraintName + ']');

SELECT @ConstraintName = NULL;
SELECT @ConstraintName = name FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('dbo.HoaDon') AND parent_column_id = COLUMNPROPERTY(OBJECT_ID('dbo.HoaDon'), 'TienDien', 'ColumnId');
IF @ConstraintName IS NOT NULL
    EXEC('ALTER TABLE [dbo].[HoaDon] DROP CONSTRAINT [' + @ConstraintName + ']');

SELECT @ConstraintName = NULL;
SELECT @ConstraintName = name FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('dbo.HoaDon') AND parent_column_id = COLUMNPROPERTY(OBJECT_ID('dbo.HoaDon'), 'TienNuoc', 'ColumnId');
IF @ConstraintName IS NOT NULL
    EXEC('ALTER TABLE [dbo].[HoaDon] DROP CONSTRAINT [' + @ConstraintName + ']');

SELECT @ConstraintName = NULL;
SELECT @ConstraintName = name FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('dbo.HoaDon') AND parent_column_id = COLUMNPROPERTY(OBJECT_ID('dbo.HoaDon'), 'PhiDichVu', 'ColumnId');
IF @ConstraintName IS NOT NULL
    EXEC('ALTER TABLE [dbo].[HoaDon] DROP CONSTRAINT [' + @ConstraintName + ']');

SELECT @ConstraintName = NULL;
SELECT @ConstraintName = name FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('dbo.HopDong') AND parent_column_id = COLUMNPROPERTY(OBJECT_ID('dbo.HopDong'), 'TienCoc', 'ColumnId');
IF @ConstraintName IS NOT NULL
    EXEC('ALTER TABLE [dbo].[HopDong] DROP CONSTRAINT [' + @ConstraintName + ']');

-- DropForeignKey
ALTER TABLE [dbo].[HopDong] DROP CONSTRAINT [HopDong_MaPhong_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[NguoiSuDung] DROP CONSTRAINT [NguoiSuDung_MaPhong_fkey];

-- DropIndex
ALTER TABLE [dbo].[KhachHang] DROP CONSTRAINT [KhachHang_SoDienThoai_key];

-- DropIndex
ALTER TABLE [dbo].[NguoiSuDung] DROP CONSTRAINT [NguoiSuDung_SoDienThoai_key];

-- DropIndex
ALTER TABLE [dbo].[NhanVien] DROP CONSTRAINT [NhanVien_SoDienThoai_key];

-- DropIndex
ALTER TABLE [dbo].[TaiKhoan] DROP CONSTRAINT [TaiKhoan_Email_key];

-- AlterTable
ALTER TABLE [dbo].[AnhPhong] ALTER COLUMN [DuongDanAnh] NVARCHAR(2048) NOT NULL;
ALTER TABLE [dbo].[AnhPhong] DROP COLUMN [LaAnhDaiDien],
[ThuTuHienThi];
ALTER TABLE [dbo].[AnhPhong] ADD [LaAnhDaiDien_] BIT NOT NULL CONSTRAINT [AnhPhong_LaAnhDaiDien__df] DEFAULT 0,
[ThuTuHienThi_] INT NOT NULL CONSTRAINT [AnhPhong_ThuTuHienThi__df] DEFAULT 1;

-- AlterTable
ALTER TABLE [dbo].[AnhToaNha] ALTER COLUMN [DuongDanAnh] NVARCHAR(2048) NOT NULL;
ALTER TABLE [dbo].[AnhToaNha] DROP COLUMN [LaAnhDaiDien],
[ThuTuHienThi];
ALTER TABLE [dbo].[AnhToaNha] ADD [LaAnhDaiDien_] BIT NOT NULL CONSTRAINT [AnhToaNha_LaAnhDaiDien__df] DEFAULT 0,
[ThuTuHienThi_] INT NOT NULL CONSTRAINT [AnhToaNha_ThuTuHienThi__df] DEFAULT 1;

-- AlterTable
ALTER TABLE [dbo].[HoaDon] ALTER COLUMN [ThangThanhToan] TINYINT NOT NULL;
ALTER TABLE [dbo].[HoaDon] ALTER COLUMN [NgayTao] DATETIME NOT NULL;
ALTER TABLE [dbo].[HoaDon] ALTER COLUMN [NgayHetHan] DATE NOT NULL;
ALTER TABLE [dbo].[HoaDon] DROP COLUMN [NgayThanhToan],
[PhiDichVu],
[PhuongThucThanhToan],
[TienDien],
[TienNuoc],
[TienThue],
[TongTien];
ALTER TABLE [dbo].[HoaDon] ADD [NamThanhToan] SMALLINT NOT NULL;
ALTER TABLE [dbo].[HoaDon] ADD CONSTRAINT [HoaDon_NgayTao_df] DEFAULT CURRENT_TIMESTAMP FOR [NgayTao];

-- AlterTable
ALTER TABLE [dbo].[HopDong] ALTER COLUMN [NgayLap] DATE NOT NULL;
ALTER TABLE [dbo].[HopDong] ALTER COLUMN [TienCoc] DECIMAL(18,2) NOT NULL;
ALTER TABLE [dbo].[HopDong] ALTER COLUMN [MaKhachHang] VARCHAR(10) NOT NULL;
ALTER TABLE [dbo].[HopDong] DROP COLUMN [MaPhong],
[NgayBatDau],
[NgayKetThuc];
ALTER TABLE [dbo].[HopDong] ADD [AnhHopDong] NVARCHAR(2048) NOT NULL;
ALTER TABLE [dbo].[HopDong] ADD CONSTRAINT [HopDong_TienCoc_df] DEFAULT 0 FOR [TienCoc];

-- AlterTable
ALTER TABLE [dbo].[KhachHang] ALTER COLUMN [SoDienThoai] VARCHAR(15) NOT NULL;
ALTER TABLE [dbo].[KhachHang] ALTER COLUMN [DiaChi] NVARCHAR(500) NULL;
ALTER TABLE [dbo].[KhachHang] ALTER COLUMN [NgaySinh] DATE NULL;

-- AlterTable
ALTER TABLE [dbo].[NguoiSuDung] ALTER COLUMN [SoDienThoai] VARCHAR(15) NOT NULL;
ALTER TABLE [dbo].[NguoiSuDung] ALTER COLUMN [HinhAnh] NVARCHAR(2048) NULL;
ALTER TABLE [dbo].[NguoiSuDung] ALTER COLUMN [NgaySinh] DATE NULL;
ALTER TABLE [dbo].[NguoiSuDung] ALTER COLUMN [MaPhong] VARCHAR(10) NOT NULL;
ALTER TABLE [dbo].[NguoiSuDung] ADD [MaHopDong] VARCHAR(10) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[NhanVien] ALTER COLUMN [SoDienThoai] VARCHAR(15) NOT NULL;
ALTER TABLE [dbo].[NhanVien] ALTER COLUMN [NgaySinh] DATE NULL;

-- AlterTable
ALTER TABLE [dbo].[Phong] DROP COLUMN [DonGiaThue],
[HinhAnh];
ALTER TABLE [dbo].[Phong] ADD [GiaThue] DECIMAL(18,2) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[TaiKhoan] DROP CONSTRAINT [TaiKhoan_TrangThaiTaiKhoan_df];
ALTER TABLE [dbo].[TaiKhoan] ALTER COLUMN [Email] VARCHAR(255) NOT NULL;
ALTER TABLE [dbo].[TaiKhoan] ALTER COLUMN [TrangThaiTaiKhoan] NVARCHAR(20) NULL;
ALTER TABLE [dbo].[TaiKhoan] ALTER COLUMN [HanXacThuc] DATETIME NULL;
ALTER TABLE [dbo].[TaiKhoan] ALTER COLUMN [ThoiGianKhoaGui] DATETIME NULL;
ALTER TABLE [dbo].[TaiKhoan] ADD CONSTRAINT [TaiKhoan_TrangThaiTaiKhoan_df] DEFAULT 'Kích hoạt' FOR [TrangThaiTaiKhoan];

-- AlterTable
ALTER TABLE [dbo].[ToaNha] ALTER COLUMN [DiaChi] NVARCHAR(500) NOT NULL;
ALTER TABLE [dbo].[ToaNha] DROP COLUMN [HinhAnh];

-- CreateTable
CREATE TABLE [dbo].[ChiTietHopDong] (
    [MaHopDong] VARCHAR(10) NOT NULL,
    [MaPhong] VARCHAR(10) NOT NULL,
    [NgayBatDau] DATE NOT NULL,
    [NgayKetThuc] DATE NOT NULL,
    [GiaThoaThuan] DECIMAL(18,2) NOT NULL CONSTRAINT [ChiTietHopDong_GiaThoaThuan_df] DEFAULT 0,
    CONSTRAINT [ChiTietHopDong_pkey] PRIMARY KEY CLUSTERED ([MaHopDong],[MaPhong])
);

-- CreateTable
CREATE TABLE [dbo].[DichVu] (
    [MaDichVu] VARCHAR(10) NOT NULL,
    [TenDichVu] NVARCHAR(100) NOT NULL,
    [DonViTinh] NVARCHAR(50) NOT NULL,
    [GiaHienTai] DECIMAL(18,2) NOT NULL,
    CONSTRAINT [DichVu_pkey] PRIMARY KEY CLUSTERED ([MaDichVu])
);

-- CreateTable
CREATE TABLE [dbo].[ChiTietHoaDon] (
    [MaCTHD] VARCHAR(10) NOT NULL,
    [MaHopDong] VARCHAR(10) NOT NULL,
    [MaPhong] VARCHAR(10) NOT NULL,
    [MaHoaDon] VARCHAR(10) NOT NULL,
    [MaDichVu] VARCHAR(10) NOT NULL,
    [ChiSoCu] INT,
    [ChiSoMoi] INT,
    [SoLuong] INT NOT NULL CONSTRAINT [ChiTietHoaDon_SoLuong_df] DEFAULT 0,
    [DonGia] DECIMAL(18,2) NOT NULL,
    CONSTRAINT [ChiTietHoaDon_pkey] PRIMARY KEY CLUSTERED ([MaCTHD])
);

-- CreateTable
CREATE TABLE [dbo].[ThanhToan] (
    [MaThanhToan] VARCHAR(10) NOT NULL,
    [MaHoaDon] VARCHAR(10) NOT NULL,
    [NgayThanhToan] DATETIME NOT NULL,
    [PhuongThucTT] NVARCHAR(20) NOT NULL,
    [SoTienTra] DECIMAL(18,2) NOT NULL,
    [MaGiaoDich] NVARCHAR(100),
    [NguoiNopTien] NVARCHAR(255),
    CONSTRAINT [ThanhToan_pkey] PRIMARY KEY CLUSTERED ([MaThanhToan])
);

-- RedefineTables
BEGIN TRANSACTION;
DECLARE @SQL NVARCHAR(MAX) = N''
SELECT @SQL += N'ALTER TABLE '
    + QUOTENAME(OBJECT_SCHEMA_NAME(PARENT_OBJECT_ID))
    + '.'
    + QUOTENAME(OBJECT_NAME(PARENT_OBJECT_ID))
    + ' DROP CONSTRAINT '
    + OBJECT_NAME(OBJECT_ID) + ';'
FROM SYS.OBJECTS
WHERE TYPE_DESC LIKE '%CONSTRAINT'
    AND OBJECT_NAME(PARENT_OBJECT_ID) = 'YeuCau'
    AND SCHEMA_NAME(SCHEMA_ID) = 'dbo'
EXEC sp_executesql @SQL
;
CREATE TABLE [dbo].[_prisma_new_YeuCau] (
    [MaYeuCau] INT NOT NULL IDENTITY(1,1),
    [MaPhong] VARCHAR(10) NOT NULL,
    [MaNhanVien] VARCHAR(10) NOT NULL,
    [MaKhachHang] VARCHAR(10) NOT NULL,
    [TrangThai] NVARCHAR(20) NOT NULL,
    [NgayTao] DATETIME NOT NULL CONSTRAINT [YeuCau_NgayTao_df] DEFAULT CURRENT_TIMESTAMP,
    [NoiDung] NVARCHAR(1000),
    [LoaiYeuCau] NVARCHAR(50) NOT NULL,
    [NgayHen] DATETIME,
    CONSTRAINT [YeuCau_pkey] PRIMARY KEY CLUSTERED ([MaYeuCau])
);
SET IDENTITY_INSERT [dbo].[_prisma_new_YeuCau] ON;
IF EXISTS(SELECT * FROM [dbo].[YeuCau])
    EXEC('INSERT INTO [dbo].[_prisma_new_YeuCau] ([LoaiYeuCau],[MaKhachHang],[MaPhong],[MaYeuCau],[NgayHen],[NgayTao],[NoiDung],[TrangThai]) SELECT [LoaiYeuCau],[MaKhachHang],[MaPhong],[MaYeuCau],[NgayHen],[NgayTao],[NoiDung],[TrangThai] FROM [dbo].[YeuCau] WITH (holdlock tablockx)');
SET IDENTITY_INSERT [dbo].[_prisma_new_YeuCau] OFF;
DROP TABLE [dbo].[YeuCau];
EXEC SP_RENAME N'dbo._prisma_new_YeuCau', N'YeuCau';
COMMIT;

-- CreateIndex
ALTER TABLE [dbo].[KhachHang] ADD CONSTRAINT [KhachHang_SoDienThoai_key] UNIQUE NONCLUSTERED ([SoDienThoai]);

-- CreateIndex
ALTER TABLE [dbo].[NhanVien] ADD CONSTRAINT [NhanVien_SoDienThoai_key] UNIQUE NONCLUSTERED ([SoDienThoai]);

-- CreateIndex
ALTER TABLE [dbo].[NguoiSuDung] ADD CONSTRAINT [NguoiSuDung_SoDienThoai_key] UNIQUE NONCLUSTERED ([SoDienThoai]);

-- CreateIndex
ALTER TABLE [dbo].[TaiKhoan] ADD CONSTRAINT [TaiKhoan_Email_key] UNIQUE NONCLUSTERED ([Email]);

-- AddForeignKey
ALTER TABLE [dbo].[NguoiSuDung] ADD CONSTRAINT [NguoiSuDung_MaHopDong_MaPhong_fkey] FOREIGN KEY ([MaHopDong], [MaPhong]) REFERENCES [dbo].[ChiTietHopDong]([MaHopDong],[MaPhong]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ChiTietHopDong] ADD CONSTRAINT [ChiTietHopDong_MaHopDong_fkey] FOREIGN KEY ([MaHopDong]) REFERENCES [dbo].[HopDong]([MaHopDong]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ChiTietHopDong] ADD CONSTRAINT [ChiTietHopDong_MaPhong_fkey] FOREIGN KEY ([MaPhong]) REFERENCES [dbo].[Phong]([MaPhong]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ChiTietHoaDon] ADD CONSTRAINT [ChiTietHoaDon_MaHoaDon_fkey] FOREIGN KEY ([MaHoaDon]) REFERENCES [dbo].[HoaDon]([MaHoaDon]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ChiTietHoaDon] ADD CONSTRAINT [ChiTietHoaDon_MaHopDong_MaPhong_fkey] FOREIGN KEY ([MaHopDong], [MaPhong]) REFERENCES [dbo].[ChiTietHopDong]([MaHopDong],[MaPhong]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ChiTietHoaDon] ADD CONSTRAINT [ChiTietHoaDon_MaDichVu_fkey] FOREIGN KEY ([MaDichVu]) REFERENCES [dbo].[DichVu]([MaDichVu]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ThanhToan] ADD CONSTRAINT [ThanhToan_MaHoaDon_fkey] FOREIGN KEY ([MaHoaDon]) REFERENCES [dbo].[HoaDon]([MaHoaDon]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
