/*
  Warnings:

  - Added the required column `SoPhong` to the `Phong` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Phong] ADD [SoPhong] VARCHAR(10) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[TaiKhoan] DROP CONSTRAINT [TaiKhoan_TrangThaiTaiKhoan_df];
ALTER TABLE [dbo].[TaiKhoan] ADD CONSTRAINT [TaiKhoan_TrangThaiTaiKhoan_df] DEFAULT 'Kích hoạt' FOR [TrangThaiTaiKhoan];

-- AddForeignKey
ALTER TABLE [dbo].[YeuCau] ADD CONSTRAINT [YeuCau_MaPhong_fkey] FOREIGN KEY ([MaPhong]) REFERENCES [dbo].[Phong]([MaPhong]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[YeuCau] ADD CONSTRAINT [YeuCau_MaNhanVien_fkey] FOREIGN KEY ([MaNhanVien]) REFERENCES [dbo].[NhanVien]([MaNhanVien]) ON DELETE NO ACTION ON UPDATE NO ACTION;

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
