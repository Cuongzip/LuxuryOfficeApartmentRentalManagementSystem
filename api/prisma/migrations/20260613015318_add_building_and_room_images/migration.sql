BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[AnhToaNha] (
    [MaAnh] VARCHAR(10) NOT NULL,
    [DuongDanAnh] NVARCHAR(255) NOT NULL,
    [ThuTuHienThi] INT NOT NULL,
    [LaAnhDaiDien] BIT NOT NULL,
    [MaToaNha] VARCHAR(10),
    CONSTRAINT [AnhToaNha_pkey] PRIMARY KEY CLUSTERED ([MaAnh])
);

-- CreateTable
CREATE TABLE [dbo].[AnhPhong] (
    [MaAnh] VARCHAR(10) NOT NULL,
    [DuongDanAnh] NVARCHAR(255) NOT NULL,
    [ThuTuHienThi] INT NOT NULL,
    [LaAnhDaiDien] BIT NOT NULL,
    [MaPhong] VARCHAR(10),
    CONSTRAINT [AnhPhong_pkey] PRIMARY KEY CLUSTERED ([MaAnh])
);

-- AddForeignKey
ALTER TABLE [dbo].[AnhToaNha] ADD CONSTRAINT [AnhToaNha_MaToaNha_fkey] FOREIGN KEY ([MaToaNha]) REFERENCES [dbo].[ToaNha]([MaToaNha]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AnhPhong] ADD CONSTRAINT [AnhPhong_MaPhong_fkey] FOREIGN KEY ([MaPhong]) REFERENCES [dbo].[Phong]([MaPhong]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
