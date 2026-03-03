# 📋 AlexStore Frontend — Kế hoạch phát triển toàn diện

> **Tech Stack:** Next.js 16 · React 19 · Tailwind CSS v4 · Shadcn/ui · Zustand · TanStack Query · React Hook Form + Zod · Axios · Lucide Icons

---

## 📁 Cấu trúc thư mục đề xuất

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group: đăng nhập / đăng ký
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── (buyer)/                  # Route group: người mua
│   │   ├── layout.tsx            # Layout chung cho buyer (Header + Footer)
│   │   ├── page.tsx              # Trang chủ
│   │   ├── products/
│   │   │   ├── page.tsx          # Danh sách sản phẩm
│   │   │   └── [id]/page.tsx     # Chi tiết sản phẩm
│   │   ├── cart/page.tsx         # Giỏ hàng
│   │   ├── checkout/page.tsx     # Thanh toán
│   │   ├── orders/
│   │   │   ├── page.tsx          # Lịch sử đơn hàng
│   │   │   └── [id]/page.tsx     # Chi tiết đơn hàng
│   │   └── profile/page.tsx      # Hồ sơ cá nhân
│   │
│   ├── (seller)/                 # Route group: người bán
│   │   ├── layout.tsx            # Layout cho seller (Sidebar + Topbar)
│   │   └── seller/
│   │       ├── dashboard/page.tsx
│   │       ├── products/
│   │       │   ├── page.tsx      # Quản lý sản phẩm
│   │       │   ├── new/page.tsx  # Thêm sản phẩm
│   │       │   └── [id]/edit/page.tsx
│   │       ├── orders/page.tsx   # Đơn hàng của seller
│   │       └── reviews/page.tsx  # Đánh giá từ buyer
│   │
│   └── (admin)/                  # Route group: admin
│       ├── layout.tsx            # Layout Admin Dashboard
│       └── admin/
│           ├── dashboard/page.tsx
│           ├── users/page.tsx
│           ├── products/page.tsx
│           ├── categories/page.tsx
│           ├── orders/page.tsx
│           └── reviews/page.tsx
│
├── components/
│   ├── ui/                       # Shadcn/ui components (auto-generated)
│   ├── layout/
│   │   ├── Header.tsx            # Header buyer
│   │   ├── Footer.tsx            # Footer buyer
│   │   ├── AdminSidebar.tsx      # Sidebar admin
│   │   ├── AdminTopbar.tsx       # Top bar admin
│   │   ├── SellerSidebar.tsx     # Sidebar seller
│   │   └── SellerTopbar.tsx      # Top bar seller
│   ├── shared/
│   │   ├── DataTable.tsx         # Bảng dữ liệu dùng chung
│   │   ├── Pagination.tsx        # Phân trang
│   │   ├── SearchInput.tsx       # Ô tìm kiếm
│   │   ├── StatusBadge.tsx       # Badge trạng thái
│   │   ├── ConfirmDialog.tsx     # Dialog xác nhận
│   │   ├── ImageUploader.tsx     # Upload ảnh
│   │   ├── StarRating.tsx        # Hiển thị sao đánh giá
│   │   └── LoadingSpinner.tsx    # Loading
│   ├── products/
│   │   ├── ProductCard.tsx       # Card sản phẩm (buyer)
│   │   ├── ProductGrid.tsx       # Grid sản phẩm
│   │   ├── ProductFilters.tsx    # Bộ lọc sản phẩm
│   │   └── ProductForm.tsx       # Form tạo/sửa sản phẩm (seller/admin)
│   ├── cart/
│   │   ├── CartItem.tsx
│   │   └── CartSummary.tsx
│   ├── orders/
│   │   ├── OrderCard.tsx
│   │   ├── OrderTimeline.tsx     # Timeline trạng thái đơn hàng
│   │   └── OrderItemRow.tsx
│   └── reviews/
│       ├── ReviewCard.tsx
│       └── ReviewForm.tsx
│
├── hooks/                        # Custom hooks (TanStack Query)
│   ├── useAuth.ts
│   ├── useProducts.ts
│   ├── useCategories.ts
│   ├── useCart.ts
│   ├── useOrders.ts
│   ├── useReviews.ts
│   └── useUsers.ts
│
├── services/                     # API layer (Axios)
│   ├── api.ts                    # Axios instance + interceptors
│   ├── auth.service.ts
│   ├── products.service.ts
│   ├── categories.service.ts
│   ├── cart.service.ts
│   ├── orders.service.ts
│   ├── reviews.service.ts
│   └── users.service.ts
│
├── stores/                       # Zustand stores
│   ├── authStore.ts              # Token, user info, role
│   ├── cartStore.ts              # Cart state (optimistic UI)
│   └── uiStore.ts                # Sidebar open/close, theme, toast
│
├── schemas/                      # Zod validation schemas
│   ├── auth.schema.ts
│   ├── product.schema.ts
│   ├── category.schema.ts
│   ├── order.schema.ts
│   ├── review.schema.ts
│   └── user.schema.ts
│
├── types/                        # TypeScript types/interfaces
│   ├── user.types.ts
│   ├── product.types.ts
│   ├── category.types.ts
│   ├── cart.types.ts
│   ├── order.types.ts
│   └── review.types.ts
│
├── lib/
│   ├── utils.ts                  # Utility functions (đã có)
│   ├── queryClient.ts            # React Query config
│   └── constants.ts              # Hằng số, enum maps
│
└── providers/
    ├── QueryProvider.tsx          # TanStack Query Provider
    └── AuthProvider.tsx           # Auth context (check token, redirect)
```

---

## 1. 🔐 Authentication (Xác thực)

### Trang Login — `/login`

| Thành phần | Chi tiết |
|---|---|
| **Form fields** | `email` · `password` |
| **Validation (Zod)** | Email hợp lệ · Password tối thiểu 6 ký tự |
| **UI** | Card ở giữa màn hình · gradient background · logo AlexStore · nút "Đăng nhập" và link "Đăng ký" |
| **Xử lý** | Gọi `POST /auth/login` → lưu `accessToken` vào Zustand `authStore` → redirect theo role |
| **Redirect** | `ADMIN` → `/admin/dashboard` · `SELLER` → `/seller/dashboard` · `BUYER` → `/` |

### Trang Register — `/register`

| Thành phần | Chi tiết |
|---|---|
| **Form fields** | `username` · `email` · `password` · `confirmPassword` |
| **Validation (Zod)** | Username 3-50 ký tự · Email hợp lệ · Password ≥ 6 · confirmPassword khớp |
| **UI** | Tương tự Login · thêm select role (`BUYER` / `SELLER`) |
| **Xử lý** | Gọi `POST /auth/register` → tự động login hoặc redirect sang `/login` |

### Zustand `authStore`

```ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}
```

### `AuthProvider` — Wrapper bảo vệ route

- Kiểm tra token khi mount
- Redirect nếu chưa đăng nhập
- Redirect nếu không đúng role (VD: buyer truy cập `/admin`)

---

## 2. 🛡️ Admin Dashboard

### 2.1 Thiết kế giao diện Admin (Layout chung)

```
┌─────────────────────────────────────────────────────────────┐
│                      ADMIN TOPBAR                           │
│  🔍 Search...          🔔 Notifications   👤 Admin ▼        │
├────────────┬────────────────────────────────────────────────┤
│            │                                                │
│  SIDEBAR   │              MAIN CONTENT                      │
│            │                                                │
│  📊 Dashboard│                                              │
│  👥 Users    │                                               │
│  📦 Products │                                               │
│  📂 Categories│                                              │
│  🛒 Orders   │                                               │
│  ⭐ Reviews  │                                               │
│            │                                                │
│            │                                                │
│  ─────────│                                                │
│  ⚙ Settings │                                               │
│  🚪 Logout  │                                               │
│            │                                                │
└────────────┴────────────────────────────────────────────────┘
```

#### Đặc điểm UI Admin

| Yếu tố | Mô tả |
|---|---|
| **Màu chủ đạo** | Dark sidebar (`slate-900`) + nền chính sáng (`slate-50`) + accent màu xanh indigo/violet |
| **Sidebar** | Collapsible · active state highlight · icon từ Lucide · hover animation |
| **Topbar** | Search global · notification bell (badge đếm) · avatar dropdown (Profile / Settings / Logout) |
| **Cards** | Bo tròn `rounded-xl` · shadow nhẹ · hover scale nhẹ · border subtle |
| **Bảng dữ liệu** | Striped rows · hover highlight · sortable columns · inline actions |
| **Responsive** | Sidebar ẩn trên mobile → hamburger menu · layout stack vertical |
| **Animation** | Framer Motion hoặc CSS transitions cho sidebar toggle, page transition |
| **Typography** | Font `Inter` hoặc `Geist` (Next.js default) |

---

### 2.2 Trang Dashboard — `/admin/dashboard`

> Tổng quan hệ thống với các số liệu thống kê quan trọng.

#### Stat Cards (hàng trên cùng)

| Card | Dữ liệu | Icon | Màu |
|---|---|---|---|
| Tổng người dùng | Đếm users | `Users` | Blue |
| Tổng sản phẩm | Đếm products | `Package` | Green |
| Tổng đơn hàng | Đếm orders | `ShoppingCart` | Orange |
| Doanh thu | Tổng `total_amount` orders PAID | `DollarSign` | Purple |

#### Khu vực bổ sung

- **Biểu đồ doanh thu** (tùy chọn thêm thư viện `recharts`): Line chart doanh thu theo tháng
- **Đơn hàng gần đây**: Bảng 5 đơn hàng mới nhất (order_code, buyer, total, status)
- **Sản phẩm chờ duyệt**: Danh sách sản phẩm `status = PENDING` cần admin duyệt
- **Người dùng mới**: 5 user đăng ký gần nhất

---

### 2.3 Quản lý người dùng — `/admin/users`

#### UI chính: DataTable

| Cột | Kiểu |
|---|---|
| Username | Text |
| Email | Text |
| Role | Badge (`BUYER` xanh / `SELLER` cam / `ADMIN` đỏ) |
| Verified Seller | Checkbox icon (✅ / ❌) |
| Trạng thái | Badge (`Active` / `Deleted`) |
| Ngày tạo | Date format |
| Actions | Dropdown: Xem · Sửa role · Verify seller · Soft delete |

#### Chức năng

- **Lọc**: Theo role, trạng thái (active / deleted)
- **Tìm kiếm**: Theo username, email
- **Phân trang**: Server-side pagination
- **Dialog sửa**: Đổi role (react-hook-form + zod) · Toggle `is_seller_verified`
- **Xóa mềm**: Confirm dialog → `is_deleted = true`

#### API tương ứng (Backend: `UsersController`)

| Action | Method | Endpoint |
|---|---|---|
| Danh sách | `GET` | `/users?page=&limit=&role=&search=` |
| Chi tiết | `GET` | `/users/:id` |
| Cập nhật | `PATCH` | `/users/:id` |
| Xóa mềm | `DELETE` | `/users/:id` |

---

### 2.4 Quản lý sản phẩm — `/admin/products`

#### UI chính: DataTable

| Cột | Kiểu |
|---|---|
| Ảnh | Thumbnail (ảnh `is_primary`) |
| Tên sản phẩm | Text (truncate) |
| Seller | Username |
| Danh mục | Category name |
| Giá | Currency format (VNĐ) |
| Tồn kho | Number |
| Trạng thái | Badge: `PENDING` (vàng) · `APPROVED` (xanh) · `REJECTED` (đỏ) · `HIDDEN` (xám) |
| Rating | Star display + count |
| Actions | Xem · Duyệt / Từ chối · Ẩn · Xóa |

#### Chức năng

- **Duyệt sản phẩm**: Nút Approve / Reject nhanh trên từng row hoặc bulk action
- **Lọc**: Theo status, category, seller
- **Tìm kiếm**: Theo tên sản phẩm
- **Xem chi tiết**: Modal hoặc trang riêng — hiển thị tất cả ảnh, mô tả, thông tin seller

#### API tương ứng (Backend: `ProductsController`)

| Action | Method | Endpoint |
|---|---|---|
| Danh sách | `GET` | `/products?page=&status=&category=&search=` |
| Chi tiết | `GET` | `/products/:id` |
| Duyệt/Reject | `PATCH` | `/products/:id` (`{ status: 'APPROVED' }`) |
| Xóa mềm | `DELETE` | `/products/:id` |

---

### 2.5 Quản lý danh mục — `/admin/categories`

#### UI: Tree table hoặc danh sách phẳng có indent

| Cột | Kiểu |
|---|---|
| Tên danh mục | Text (indent theo level) |
| Danh mục cha | Text hoặc "—" nếu root |
| Số sản phẩm | Count |
| Actions | Sửa · Thêm con · Xóa |

#### Chức năng

- **Thêm danh mục**: Dialog form (name, parent_id select)
- **Sửa**: Inline edit hoặc dialog
- **Xóa**: Confirm dialog (cảnh báo nếu có sản phẩm)
- **Hierarchical display**: Hỗ trợ danh mục cha/con (parent_id)

#### Zod Schema

```ts
const categorySchema = z.object({
  name: z.string().min(1, "Tên danh mục là bắt buộc").max(100),
  parentId: z.number().nullable().optional(),
});
```

#### API tương ứng (Backend: `CategoriesController`)

| Action | Method | Endpoint |
|---|---|---|
| Danh sách | `GET` | `/categories` |
| Thêm | `POST` | `/categories` |
| Sửa | `PATCH` | `/categories/:id` |
| Xóa | `DELETE` | `/categories/:id` |

---

### 2.6 Quản lý đơn hàng — `/admin/orders`

#### DataTable

| Cột | Kiểu |
|---|---|
| Mã đơn hàng | `order_code` |
| Người mua | Username |
| Tổng tiền | Currency |
| Trạng thái đơn | Badge: `PENDING` · `PAID` · `SHIPPING` · `DELIVERED` · `CANCELLED` |
| Thanh toán | Badge: `UNPAID` · `PAID` · `FAILED` · `REFUNDED` |
| Ngày đặt | DateTime |
| Actions | Xem chi tiết · Cập nhật trạng thái |

#### Chi tiết đơn hàng (Dialog / Page)

- Thông tin buyer
- Địa chỉ giao hàng (`shipping_address`)
- Danh sách `order_items`: sản phẩm, số lượng, giá tại thời điểm mua
- Timeline trạng thái (component `OrderTimeline`)
- Thông tin thanh toán: method, transaction_id, `paid_at`
- Dropdown cập nhật trạng thái (PENDING → PAID → SHIPPING → DELIVERED)

#### API tương ứng (Backend: `OrdersController`)

| Action | Method | Endpoint |
|---|---|---|
| Danh sách | `GET` | `/orders?page=&status=&payment_status=` |
| Chi tiết | `GET` | `/orders/:id` |
| Cập nhật | `PATCH` | `/orders/:id` |

---

### 2.7 Quản lý đánh giá — `/admin/reviews`

#### DataTable

| Cột | Kiểu |
|---|---|
| Sản phẩm | Product name |
| Người mua | Username |
| Điểm | Star rating (1-5) |
| Nội dung | Text (truncate) |
| Ngày | DateTime |
| Actions | Xem · Xóa |

#### API tương ứng (Backend: `ReviewsController`)

| Action | Method | Endpoint |
|---|---|---|
| Danh sách | `GET` | `/reviews?page=&product=` |
| Xóa | `DELETE` | `/reviews/:id` |

---

## 3. 🏪 Seller Dashboard (Người bán hàng)

### 3.1 Layout Seller

Tương tự Admin nhưng sidebar gọn hơn:

```
SIDEBAR:
  📊 Dashboard
  📦 Sản phẩm của tôi
  🛒 Đơn hàng
  ⭐ Đánh giá
  👤 Hồ sơ
```

- **Màu chủ đạo**: Sidebar tối + accent màu emerald/teal
- **Topbar**: Tên shop · avatar · notifications

---

### 3.2 Dashboard Seller — `/seller/dashboard`

#### Stat Cards

| Card | Dữ liệu |
|---|---|
| Tổng sản phẩm | Đếm products của seller |
| Sản phẩm đã duyệt | Products `status = APPROVED` |
| Tổng đơn hàng | Đếm orders chứa sản phẩm của seller |
| Doanh thu | Tổng tiền từ order_items của seller |

#### Nội dung bổ sung

- Sản phẩm chờ duyệt (status = PENDING)
- Đơn hàng mới cần xử lý
- Đánh giá gần đây

---

### 3.3 Quản lý sản phẩm — `/seller/products`

#### DataTable (chỉ sản phẩm của seller hiện tại)

| Cột | Kiểu |
|---|---|
| Ảnh | Thumbnail |
| Tên | Text |
| Danh mục | Category name |
| Giá | Currency |
| Tồn kho | Number (⚠️ highlight nếu < 10) |
| Trạng thái | Badge |
| Actions | Sửa · Ẩn/Hiện · Xóa |

#### Trang tạo sản phẩm — `/seller/products/new`

**Form fields (React Hook Form + Zod):**

```ts
const productSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().positive("Giá phải lớn hơn 0"),
  stockQuantity: z.number().int().min(0),
  categoryId: z.number().int().positive(),
});
```

**UI Form:**
- Input tên sản phẩm
- Textarea mô tả (có thể dùng rich text editor)
- Input giá (format VNĐ)
- Input số lượng tồn kho
- Select danh mục (hierarchical dropdown)
- **Image uploader**: Drag & drop / click to upload · preview · đánh dấu ảnh chính · sắp xếp thứ tự
- Nút "Lưu nháp" / "Gửi duyệt"

#### Trang sửa sản phẩm — `/seller/products/[id]/edit`

- Pre-fill form với dữ liệu hiện tại
- Quản lý ảnh: thêm/xóa/đổi thứ tự/đổi ảnh chính

---

### 3.4 Đơn hàng Seller — `/seller/orders`

> Hiển thị các đơn hàng có chứa sản phẩm của seller.

#### DataTable

| Cột | Kiểu |
|---|---|
| Mã đơn | `order_code` |
| Buyer | Username |
| Sản phẩm | Danh sách items của seller |
| Tổng tiền (phần seller) | Currency |
| Trạng thái | Badge |
| Actions | Xem chi tiết |

---

### 3.5 Đánh giá Seller — `/seller/reviews`

> Hiển thị đánh giá trên sản phẩm của seller.

| Cột | Kiểu |
|---|---|
| Sản phẩm | Tên + ảnh |
| Buyer | Username |
| Rating | Stars |
| Nội dung | Text |
| Ngày | Date |

---

## 4. 🛍️ Buyer Interface (Người mua hàng)

### 4.1 Layout Buyer

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: Logo · Search · Categories · Cart(badge) · Avatar  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                      PAGE CONTENT                           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ FOOTER: Links · About · Contact · Social · Copyright        │
└─────────────────────────────────────────────────────────────┘
```

- **Header sticky** · search bar trung tâm · icon giỏ hàng với badge số lượng
- **Design**: Clean, modern · gradient hero · card-based layout

---

### 4.2 Trang chủ — `/`

| Section | Mô tả |
|---|---|
| **Hero Banner** | Full-width banner với CTA "Mua sắm ngay" · background gradient hoặc carousel |
| **Danh mục nổi bật** | Grid icon + tên danh mục (lấy từ categories root) |
| **Sản phẩm mới** | Grid `ProductCard` — 8 sản phẩm mới nhất (`APPROVED`, sort by `created_at`) |
| **Sản phẩm đánh giá cao** | Grid `ProductCard` — top rated (`sort by avg_rating`) |
| **Đánh giá từ khách hàng** | Carousel testimonials (tuỳ chọn) |

---

### 4.3 Danh sách sản phẩm — `/products`

#### Layout: Sidebar filters + Product Grid

**Sidebar Filters:**
- Danh mục (checkbox tree)
- Khoảng giá (range slider hoặc min/max input)
- Rating tối thiểu (star selector)
- Sort: Mới nhất · Giá tăng · Giá giảm · Rating cao

**Product Grid:**
- Responsive: 4 cột (desktop) · 2 cột (tablet) · 1 cột (mobile)
- Mỗi `ProductCard`: Ảnh · Tên · Giá · Rating · Nút "Thêm vào giỏ"
- Infinite scroll hoặc pagination
- Loading skeleton khi fetch

#### TanStack Query Hook

```ts
const useProducts = (filters: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getAll(filters),
    placeholderData: keepPreviousData,
  });
};
```

---

### 4.4 Chi tiết sản phẩm — `/products/[id]`

#### Layout

| Section | Mô tả |
|---|---|
| **Image Gallery** | Slideshow ảnh sản phẩm · thumbnail navigation · zoom on hover |
| **Thông tin** | Tên · Giá (lớn, nổi bật) · Rating (stars + review count) · Mô tả · Danh mục |
| **Seller info** | Username seller · badge verified |
| **Tồn kho** | Hiển thị "Còn X sản phẩm" hoặc "Hết hàng" |
| **Thêm vào giỏ** | Input số lượng + Nút "Thêm vào giỏ hàng" |
| **Reviews** | Danh sách reviews · average rating chart · form viết review (nếu đã mua) |

#### Viết Review (Form)

```ts
const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});
```

- Star picker interactive
- Textarea comment
- Chỉ hiển thị nếu buyer đã mua sản phẩm và chưa review (unique constraint: `buyer_id + product_id`)

---

### 4.5 Giỏ hàng — `/cart`

#### UI

| Thành phần | Mô tả |
|---|---|
| **CartItem** | Ảnh · Tên · Giá · Quantity selector (+/-) · Xóa · Subtotal |
| **CartSummary** | Tổng số sản phẩm · Tổng tiền · Nút "Thanh toán" |
| **Giỏ trống** | Illustration + CTA "Tiếp tục mua sắm" |

#### Zustand `cartStore` (optimistic updates)

```ts
interface CartState {
  items: CartItem[];
  addItem: (productId: string, quantity: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  removeItem: (itemId: number) => void;
  clearCart: () => void;
  totalAmount: () => number;
}
```

- Sync với server qua TanStack Query (mutation + invalidation)
- Optimistic update: cập nhật UI trước, rollback nếu API fail

#### API tương ứng (Backend: `CartController`)

| Action | Method | Endpoint |
|---|---|---|
| Lấy giỏ hàng | `GET` | `/cart` |
| Thêm item | `POST` | `/cart/items` |
| Cập nhật quantity | `PATCH` | `/cart/items/:id` |
| Xóa item | `DELETE` | `/cart/items/:id` |

---

### 4.6 Thanh toán — `/checkout`

#### Form (React Hook Form + Zod)

```ts
const checkoutSchema = z.object({
  shippingAddress: z.string().min(10, "Địa chỉ không hợp lệ"),
  paymentMethod: z.enum(["COD", "BANK_TRANSFER", "MOMO", "VNPAY"]),
});
```

#### UI

| Section | Mô tả |
|---|---|
| **Thông tin giao hàng** | Textarea địa chỉ + có thể lưu địa chỉ mặc định |
| **Tóm tắt đơn hàng** | List items từ cart · tổng tiền |
| **Phương thức thanh toán** | Radio group: COD · Chuyển khoản · MoMo · VNPay |
| **Nút đặt hàng** | Disabled khi đang submit · loading state |

#### Luồng xử lý

1. Validate form
2. `POST /orders` (body: `{ shippingAddress, paymentMethod, items }`)
3. Server tạo order + order_items + clear cart
4. Redirect → trang xác nhận đơn hàng hoặc `/orders/:id`

---

### 4.7 Đơn hàng — `/orders`

#### Danh sách đơn hàng buyer

| Cột | Kiểu |
|---|---|
| Mã đơn | `order_code` |
| Ngày đặt | DateTime |
| Tổng tiền | Currency |
| Trạng thái | Badge + color |
| Thanh toán | Badge |
| Actions | Xem chi tiết · Hủy (nếu PENDING) |

#### Chi tiết đơn hàng — `/orders/[id]`

- **OrderTimeline**: Visual timeline trạng thái (PENDING → PAID → SHIPPING → DELIVERED)
- Danh sách sản phẩm đã mua (ảnh, tên, số lượng, giá tại thời điểm mua)
- Thông tin giao hàng
- Thông tin thanh toán
- Nút "Hủy đơn" (nếu status = PENDING)
- Nút "Đã nhận hàng" (nếu status = SHIPPING → confirm DELIVERED)

---

### 4.8 Hồ sơ cá nhân — `/profile`

| Field | Kiểu |
|---|---|
| Avatar | Upload ảnh (tuỳ chọn mở rộng) |
| Username | Read-only |
| Email | Read-only |
| Role | Badge |
| Đổi mật khẩu | Form: old password · new password · confirm |
| Đăng ký bán hàng | Nút "Trở thành người bán" (nếu role = BUYER) → gửi request |

---

## 5. 🧩 Shared Components chi tiết

### `DataTable`

- Props: `columns`, `data`, `isLoading`, `pagination`, `onSort`, `onFilter`
- Sử dụng Shadcn `Table` component
- Hỗ trợ: sorting, filtering, multi-select actions, export (tuỳ chọn)
- Loading state: Skeleton rows

### `StatusBadge`

```tsx
// Mapping trạng thái → màu
const statusColors = {
  PENDING: 'yellow', APPROVED: 'green', REJECTED: 'red', HIDDEN: 'gray',
  PAID: 'green', SHIPPING: 'blue', DELIVERED: 'emerald', CANCELLED: 'red',
  UNPAID: 'yellow', FAILED: 'red', REFUNDED: 'orange',
};
```

### `ProductCard`

- Ảnh chính (hover zoom)
- Tên sản phẩm (max 2 dòng, truncate)
- Giá format VNĐ
- Star rating + review count
- Nút "Thêm vào giỏ" (heart icon save/wishlist tuỳ chọn)
- Hover: shadow tăng + slight translateY

### `ImageUploader`

- Drag & drop zone
- Preview grid
- Đánh dấu ảnh chính (star icon)
- Kéo thả để sắp xếp (`sort_order`)
- Upload lên server hoặc cloud storage

### `OrderTimeline`

- Vertical timeline
- Mỗi step: icon + label + datetime
- Step hiện tại: highlighted
- Step tương lai: mờ (disabled)

---

## 6. 🔧 Services Layer (Axios)

### `api.ts` — Axios Instance

```ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401, error toast
api.interceptors.response.use(
  (res) => res.data,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 7. 📊 TanStack Query — Patterns

### Query Keys Convention

```ts
const queryKeys = {
  products: {
    all: ['products'],
    list: (filters) => ['products', 'list', filters],
    detail: (id) => ['products', 'detail', id],
  },
  orders: {
    all: ['orders'],
    list: (filters) => ['orders', 'list', filters],
    detail: (id) => ['orders', 'detail', id],
  },
  // ... tương tự cho categories, users, reviews, cart
};
```

### Mutation + Cache Invalidation

```ts
const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success('Sản phẩm đã được tạo!');
    },
  });
};
```

---

## 8. 🎨 Zustand Stores

### `uiStore`

```ts
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}
```

### Persist middleware

- `authStore`: persist token vào `localStorage`
- `cartStore`: persist items vào `localStorage` (offline-first)

---

## 9. 🚀 Thứ tự triển khai đề xuất

### Phase 1 — Nền tảng (Foundation)

| # | Task | Ưu tiên |
|---|---|---|
| 1 | Setup cấu trúc thư mục | 🔴 Cao |
| 2 | Cấu hình Axios + interceptors | 🔴 Cao |
| 3 | Cấu hình TanStack Query Provider | 🔴 Cao |
| 4 | Tạo TypeScript types + Zod schemas | 🔴 Cao |
| 5 | Zustand stores (auth, cart, ui) | 🔴 Cao |
| 6 | Auth pages (Login + Register) | 🔴 Cao |
| 7 | AuthProvider + Route guards | 🔴 Cao |

### Phase 2 — Admin Dashboard

| # | Task | Ưu tiên |
|---|---|---|
| 8 | Admin Layout (Sidebar + Topbar) | 🔴 Cao |
| 9 | Admin Dashboard page (Stats) | 🟡 Trung bình |
| 10 | Admin Users management | 🟡 Trung bình |
| 11 | Admin Categories management | 🟡 Trung bình |
| 12 | Admin Products management + approval | 🔴 Cao |
| 13 | Admin Orders management | 🟡 Trung bình |
| 14 | Admin Reviews management | 🟢 Thấp |

### Phase 3 — Seller Dashboard

| # | Task | Ưu tiên |
|---|---|---|
| 15 | Seller Layout | 🔴 Cao |
| 16 | Seller Dashboard page | 🟡 Trung bình |
| 17 | Seller Products CRUD + Image upload | 🔴 Cao |
| 18 | Seller Orders view | 🟡 Trung bình |
| 19 | Seller Reviews view | 🟢 Thấp |

### Phase 4 — Buyer Interface

| # | Task | Ưu tiên |
|---|---|---|
| 20 | Buyer Layout (Header + Footer) | 🔴 Cao |
| 21 | Trang chủ (Hero + product sections) | 🔴 Cao |
| 22 | Danh sách sản phẩm + Filters | 🔴 Cao |
| 23 | Chi tiết sản phẩm + Reviews | 🔴 Cao |
| 24 | Giỏ hàng | 🔴 Cao |
| 25 | Checkout | 🔴 Cao |
| 26 | Đơn hàng buyer | 🟡 Trung bình |
| 27 | Profile page | 🟢 Thấp |

### Phase 5 — Polish & Optimization

| # | Task | Ưu tiên |
|---|---|---|
| 28 | Responsive design tất cả pages | 🔴 Cao |
| 29 | Error handling + Toast notifications | 🟡 Trung bình |
| 30 | Loading states + Skeleton UI | 🟡 Trung bình |
| 31 | Dark mode toggle | 🟢 Thấp |
| 32 | SEO + Meta tags | 🟢 Thấp |
| 33 | Performance optimization | 🟢 Thấp |

---

## 10. 📎 Ghi chú kỹ thuật

| Vấn đề | Giải pháp |
|---|---|
| **UUIDv7 binary** | Backend trả về UUID dạng string → FE dùng string bình thường |
| **Decimal fields** | `price`, `totalAmount` → parse thành `number` hoặc dùng `Intl.NumberFormat` để format VNĐ |
| **Image upload** | Cần thêm endpoint upload file ở BE (multer/cloud storage) hoặc dùng service bên thứ 3 |
| **Pagination** | Server-side: `?page=1&limit=20` → response kèm `{ data, total, page, lastPage }` |
| **Soft delete** | Đánh dấu `is_deleted = true` · FE ẩn khỏi danh sách · Admin có thể toggle filter |
| **Role-based routing** | Middleware Next.js hoặc `AuthProvider` kiểm tra role trước khi render |
| **Toast** | Dùng Shadcn `Sonner` hoặc `Toast` component cho notifications |
| **Date format** | Dùng `Intl.DateTimeFormat('vi-VN')` hoặc thư viện `date-fns` |
