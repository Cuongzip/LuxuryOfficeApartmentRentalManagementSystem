BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[TaiKhoan] DROP CONSTRAINT [TaiKhoan_TrangThaiTaiKhoan_df];
ALTER TABLE [dbo].[TaiKhoan] ADD CONSTRAINT [TaiKhoan_TrangThaiTaiKhoan_df] DEFAULT 'Kích hoạt' FOR [TrangThaiTaiKhoan];

-- CreateTable
CREATE TABLE [dbo].[DanhSachDenToken] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [Token] VARCHAR(2048) NOT NULL,
    [ThoiGianHetHan] DATETIME NOT NULL,
    [NgayTao] DATETIME NOT NULL CONSTRAINT [DanhSachDenToken_NgayTao_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [DanhSachDenToken_pkey] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [DanhSachDenToken_Token_key] UNIQUE NONCLUSTERED ([Token])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
