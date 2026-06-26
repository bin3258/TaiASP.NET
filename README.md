# 🏪 TaiCMS - Hệ thống quản lý bán hàng (Shop NUTRI.)

## Giới thiệu

**TaiCMS** là một hệ thống quản lý nội dung và bán hàng trực tuyến (E-commerce CMS), được xây dựng với kiến trúc:

- **Frontend:** React 19 (SPA)
- **Backend API:** ASP.NET Core 8 (Web API + MVC)
- **Cơ sở dữ liệu:** SQL Server + Entity Framework Core 8

Hệ thống cung cấp giao diện khách hàng (storefront) và trang quản trị (admin) giúp quản lý sản phẩm, đơn hàng, khách hàng, bài viết, banner, đánh giá,... Dưới tên thương hiệu **Shop NUTRI.**

## Công nghệ sử dụng

### Backend (`CMS.Backend` + `CMS.Data`)

| Công nghệ | Mục đích |
|-----------|----------|
| .NET 8 / ASP.NET Core | Nền tảng backend |
| Entity Framework Core 8 | ORM, truy vấn CSDL |
| SQL Server (LocalDB) | Cơ sở dữ liệu |
| BCrypt.Net-Next | Mã hóa mật khẩu |
| Swagger / OpenAPI | Tài liệu API tự động |
| SendGrid API | Gửi email (xác nhận đơn hàng, quên mật khẩu) |
| Cookie Authentication | Xác thực admin |

### Frontend (`cms.frontend`)

| Công nghệ | Mục đích |
|-----------|----------|
| React 19 | Thư viện UI |
| React Router DOM 7 | Điều hướng SPA |
| Axios | HTTP client gọi API |
| Bootstrap 5 | CSS framework (admin) |
| CSS thuần | Tùy chỉnh giao diện (storefront) |

## Cấu trúc dự án

```
TaiCMS_Solution/
├── CMS.Backend/              # Backend ASP.NET Core
│   ├── Controllers/          # API + MVC controllers (24 controllers)
│   ├── Services/             # EmailService, IEmailService
│   ├── Settings/             # EmailSettings
│   ├── Views/                # Razor Views (admin trang)
│   ├── wwwroot/              # Static files (images, libs)
│   └── Program.cs            # Entry point
├── CMS.Data/                 # Data Layer
│   └── Entities/             # 14 entity classes
├── cms.frontend/             # Frontend React
│   └── src/
│       ├── api/              # Axios client config
│       ├── components/       # Shared components (Header, Footer, Login,...)
│       ├── contexts/         # AuthContext, CartContext
│       ├── pages/            # Page components (shop, cart, orders,...)
│       └── services/         # API service modules
└── TaiCMS_Solution.sln       # Solution file
```

## Tính năng chính

### Storefront (Giao diện khách hàng)

- 🏠 Trang chủ với banner, sản phẩm nổi bật, bài viết mới
- 🛍️ Danh mục sản phẩm + tìm kiếm + lọc giá + sắp xếp
- 🛒 Giỏ hàng (thêm, sửa, xóa)
- 💳 Thanh toán / Đặt hàng
- 📋 Quản lý đơn hàng cá nhân + đánh giá sản phẩm
- 👤 Đăng ký / Đăng nhập / Quên mật khẩu
- ✍️ Blog / Tin tức
- 📞 Liên hệ + Giới thiệu

### Admin Panel (Giao diện quản trị)

- 📊 Dashboard
- 📦 Quản lý sản phẩm, danh mục sản phẩm
- 📝 Quản lý bài viết, danh mục bài viết
- 👥 Quản lý khách hàng, thành viên
- 🚚 Quản lý đơn hàng
- 🏭 Quản lý kho hàng, tồn kho
- 🖼️ Quản lý banner
- ⭐ Quản lý đánh giá sản phẩm

## Cài đặt & Chạy

### Yêu cầu

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (Express hoặc LocalDB)
- Trình duyệt web hiện đại

### 1. Cấu hình cơ sở dữ liệu

Sửa chuỗi kết nối trong `CMS.Backend/appsettings.json`:

```json
"ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=TaiCMS_DB;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
}
```

### 2. Chạy migration & tạo database

```bash
cd CMS.Backend
dotnet ef database update
```

### 3. Chạy Backend

```bash
cd CMS.Backend
dotnet run
```

Backend chạy tại `https://localhost:7068` — Swagger UI tại `/swagger`.

### 4. Chạy Frontend

```bash
cd cms.frontend
npm install
npx react-scripts start
```

Frontend chạy tại `http://localhost:3000`.

> **Lưu ý:** Nếu dùng **Bun**, `react-scripts` có thể bị crash. Dùng `rundev.bat` hoặc `rundev.ps1` để bypass.

### 5. Đăng nhập Admin

Truy cập `https://localhost:7068/Account/Login`.

### API Endpoints chính

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/Products` | Danh sách sản phẩm |
| GET | `/api/Products/search` | Tìm kiếm + lọc + sắp xếp |
| GET | `/api/Products/{id}` | Chi tiết sản phẩm |
| GET | `/api/Products/hot` | Sản phẩm bán chạy |
| POST | `/api/Auth/CustomerLogin` | Đăng nhập khách hàng |
| POST | `/api/Auth/CustomerRegister` | Đăng ký khách hàng |
| POST | `/api/Auth/ForgotPassword` | Quên mật khẩu |
| GET/POST | `/api/Carts` | Giỏ hàng |
| GET/POST | `/api/Orders` | Đơn hàng |
| GET/POST | `/api/Reviews` | Đánh giá sản phẩm |
| PUT/DELETE | `/api/Reviews/{id}` | Sửa/xóa đánh giá |

## Lưu ý phát triển

- Backend dùng cả MVC (cho admin) và Web API (cho React) — không nhầm lẫn giữa `ProductsController` (API) và `ProductController` (MVC).
- Cookie Authentication dùng cho admin; API khách hàng dùng cơ chế stateless (không JWT).
- Khi rebuild backend, có thể cần `Stop-Process -Name "CMS.Backend"` để giải phóng DLL.
