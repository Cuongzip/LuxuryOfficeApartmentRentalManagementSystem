# Luxury Office & Apartment Rental Management System

Hệ thống quản lý cho thuê căn hộ/văn phòng cao cấp, gồm 2 phần:

- **`api/`** — Backend Express.js + Prisma ORM (kết nối **Microsoft SQL Server**)
- **`web/`** — Frontend Next.js (React 19)

---

## 1. Yêu cầu môi trường

Trước khi bắt đầu, cài đặt các công cụ sau:

| Công cụ | Phiên bản gợi ý | Ghi chú |
|---|---|---|
| [Node.js](https://nodejs.org/) | >= 18 | Kèm npm |
| [SQL Server](https://www.microsoft.com/sql-server/sql-server-downloads) | 2019+ (Developer/Express) | Chạy local |
| [SQL Server Management Studio (SSMS)](https://learn.microsoft.com/sql/ssms/download-ssms) | mới nhất | Không bắt buộc nhưng nên có để xem dữ liệu |
| Git | mới nhất | Để clone repo |

---

## 2. Cài đặt & cấu hình SQL Server Express local

SQL Server Express mặc định **không cho phép kết nối qua TCP/IP** và chỉ cho **Windows Authentication**, nên cần cấu hình thêm vài bước thì Prisma mới connect được.

### 2.1. Cài SQL Server Express

Tải và cài tại: [SQL Server Express](https://www.microsoft.com/sql-server/sql-server-downloads) (chọn bản **Express**).

Trong quá trình cài, nếu được hỏi tên instance, mặc định sẽ là `SQLEXPRESS`.

### 2.2. Bật SQL Server Authentication (Mixed Mode)

Mặc định SQL Server Express chỉ cho đăng nhập bằng Windows Authentication, cần đổi sang **Mixed Mode** để dùng được user `sa`:

1. Mở **SSMS**, kết nối vào server bằng **Windows Authentication**.
2. Click chuột phải vào server (ở Object Explorer) → **Properties** → **Security**.
3. Chọn **SQL Server and Windows Authentication mode** → OK.
4. Trong Object Explorer: **Security → Logins → sa** → chuột phải → **Properties**:
   - Tab **General**: đặt mật khẩu mới cho `sa` (ghi nhớ lại).
   - Tab **Status**: set **Login** = **Enabled**.
5. **Restart SQL Server service** để áp dụng (mở **Services.msc**, tìm `SQL Server (SQLEXPRESS)` → Restart).

### 2.3. Bật TCP/IP và đặt port cố định

1. Mở **SQL Server Configuration Manager**.
2. Vào `SQL Server Network Configuration > Protocols for SQLEXPRESS`.
3. Click phải vào **TCP/IP** → **Enable** (nếu đang Disabled).
4. Vẫn trong TCP/IP → tab **Properties** → tab **IP Addresses** → kéo xuống mục **IPAll**:
   - Xoá giá trị ở **TCP Dynamic Ports** (để trống).
   - Điền **TCP Port** = `1433`.
5. Vào `SQL Server Services` (cùng cửa sổ Configuration Manager) → restart lại **SQL Server (SQLEXPRESS)**.
6. (Nên làm) Bật luôn dịch vụ **SQL Server Browser** → set chế độ chạy = **Automatic** → Start. Dịch vụ này giúp resolve tên instance, tránh lỗi kết nối khi không chỉ định port rõ ràng.

> Sau bước này, vì đã đặt port cố định `1433`, bạn có thể kết nối bằng `localhost:1433` mà **không cần** ghi tên instance `\SQLEXPRESS` trong connection string.

### 2.4. Kiểm tra firewall (nếu vẫn không connect được)

Nếu vẫn lỗi timeout, mở **Windows Defender Firewall** → **Advanced Settings** → **Inbound Rules** → tạo rule mới cho phép port `TCP 1433`.

### Tạo database

Mở SSMS (hoặc `sqlcmd`) kết nối vào SQL Server bằng user `sa`, sau đó tạo database:

```sql
CREATE DATABASE luxury_rental;
```

---

## 3. Clone dự án

```bash
git clone https://github.com/Cuongzip/LuxuryOfficeApartmentRentalManagementSystem.git
cd LuxuryOfficeApartmentRentalManagementSystem
```

---

## 4. Cài đặt Backend (`api/`)

```bash
cd api
npm install
```

### Tạo file `.env`

Copy file mẫu rồi chỉnh lại theo thông tin SQL Server của bạn:

```bash
cp .env.example .env
```

Nội dung `.env` cần khai báo (sửa `password` và `database` cho khớp với máy bạn):

```env
PORT=3000
API_URL="http://localhost:3000"
CLIENT_URL="http://localhost:3001"
JWT_SECRET="your-super-secret-key"
DATABASE_URL="sqlserver://localhost:1433;database=luxury_rental;user=sa;password=YourPassword123!;encrypt=true;trustServerCertificate=true"

# SMTP (dùng cho gửi email — có thể dùng Gmail App Password)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM_NAME="Luxury Office & Apartment Rental"
SMTP_FROM_EMAIL="noreply@luxuryrental.com"
```

> Nếu bạn dùng Cách B (Docker), `password` chính là `MSSQL_SA_PASSWORD` đã đặt ở bước trên.
> Phần SMTP không bắt buộc phải đúng thật để chạy API, nhưng cần điền nếu muốn test các chức năng gửi email (ví dụ: quên mật khẩu).

### Chạy Prisma migrate để tạo schema trong database

Lệnh này sẽ áp toàn bộ các migration có sẵn trong `api/prisma/migrations` vào database `luxury_rental` vừa tạo:

```bash
npx prisma migrate dev
```

Nếu chỉ muốn generate Prisma Client mà không tạo migration mới:

```bash
npm run db:generate
```

### (Tuỳ chọn) Xem dữ liệu bằng Prisma Studio

```bash
npm run db:studio
```

Mở `http://localhost:5555` để xem/sửa dữ liệu trực quan.

### Chạy server API

```bash
npm start
```

API sẽ chạy tại `http://localhost:3000`.

---

## 5. Cài đặt Frontend (`web/`)

Mở terminal mới (giữ API đang chạy):

```bash
cd web
npm install
```

### Tạo file `.env`

```bash
cp .env.example .env
```

```env
API_URL="http://localhost:3000/api"
```

### Chạy frontend

Vì API đã chiếm port `3000`, chạy web ở port `3001` (khớp với `CLIENT_URL` trong `api/.env`):

```bash
npm run dev -- -p 3001
```

Mở `http://localhost:3001` để xem website.

---

## 6. Tổng kết các lệnh thường dùng

| Lệnh (trong `api/`) | Chức năng |
|---|---|
| `npm install` | Cài dependencies |
| `npx prisma migrate dev` | Tạo/cập nhật bảng trong SQL Server theo schema |
| `npm run db:generate` | Generate lại Prisma Client sau khi sửa `schema.prisma` |
| `npm run db:studio` | Mở Prisma Studio để xem dữ liệu |
| `npm start` | Chạy server (nodemon, port 3000) |

| Lệnh (trong `web/`) | Chức năng |
|---|---|
| `npm install` | Cài dependencies |
| `npm run dev -- -p 3001` | Chạy frontend Next.js (port 3001) |
| `npm run build` | Build production |

---

## 7. Lỗi thường gặp

- **`Login failed for user 'sa'`**: chưa bật Mixed Mode Authentication (bước 2.2), hoặc login `sa` đang ở trạng thái Disabled, hoặc sai mật khẩu trong `DATABASE_URL`.
- **`Could not connect (timeout)` / `ECONNREFUSED`**: chưa bật TCP/IP, hoặc TCP Port chưa đặt là `1433` (bước 2.3) — kiểm tra lại trong SQL Server Configuration Manager, nhớ **restart service** sau khi đổi.
- **`self signed certificate` / lỗi SSL**: thêm `trustServerCertificate=true` vào `DATABASE_URL` (đã có sẵn trong mẫu ở trên).
- **Vẫn không kết nối được dù đã làm hết các bước trên**: thử dùng tên instance trong connection string thay vì port, ví dụ:
  `DATABASE_URL="sqlserver://localhost\\SQLEXPRESS;database=luxury_rental;user=sa;password=...;encrypt=true;trustServerCertificate=true"`
  (yêu cầu dịch vụ **SQL Server Browser** đang chạy — xem bước 2.3.6).
- **Port 3000 bị trùng**: vì cả `api` (mặc định 3000) và `web` (mặc định Next.js là 3000) đều dùng port 3000, nhớ chạy `web` với `-p 3001`.

---

## 8. Cấu trúc dự án (tóm tắt)

```
LuxuryOfficeApartmentRentalManagementSystem/
├── api/                # Backend: Express + Prisma (SQL Server)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── src/
│       ├── index.js        # entry point
│       ├── app.js          # cấu hình express app
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       └── validators/
├── web/                # Frontend: Next.js (React 19 + Tailwind 4)
│   └── src/
└── docs/               # Tài liệu phân tích thiết kế (Use Case, ERD...)
```
