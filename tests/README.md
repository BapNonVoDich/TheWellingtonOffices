# Testing Guide

## Tổng quan

Test suite này sử dụng Playwright để test:
- Truy cập các trang web
- CRUD operations (Create, Read, Update, Delete)
- Upload ảnh
- Form submissions

## Cấu trúc

```
tests/
├── pages/          # Test truy cập trang
├── crud/           # Test CRUD operations
├── forms/          # Test form submissions
└── helpers/        # Helper functions
```

## Chuẩn bị

### 1. Seed database
Trước khi chạy tests, cần seed database với dữ liệu test:

```bash
npm run seed
```

### 2. Environment Variables
Đảm bảo có file `.env` với các biến môi trường:

**Bắt buộc:**
```env
DATABASE_URL=your_mongodb_url
NEXTAUTH_SECRET=your_secret
```

**Cho testing (tùy chọn, nếu không có sẽ dùng defaults):**
```env
# Credentials cho admin user (phải match với seed)
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=your_password

# Hoặc dùng riêng cho test
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=your_password
```

**Lưu ý:** Email và password trong `.env` phải khớp với credentials được tạo trong `npm run seed`.

## Chạy tests

### Chạy tất cả tests
```bash
npm test
```

### Chạy với UI mode (dễ debug - KHUYẾN NGHỊ)
```bash
npm run test:ui
```

### Chạy với browser hiển thị
```bash
npm run test:headed
```

### Debug mode
```bash
npm run test:debug
```

### Chạy test cụ thể
```bash
# Test một file
npm test -- tests/pages/homepage.spec.ts

# Test một folder
npm test -- tests/pages/

# Test với filter
npm test -- -g "Tạo bài viết"
```

## Test Coverage

### Pages Tests (15 tests)
- ✅ Homepage (2 tests)
- ✅ Search pages (2 tests)
- ✅ Static pages (4 tests)
- ✅ Admin pages (4 tests)
- ✅ Example test (1 test)

### CRUD Tests (12 tests)
- ✅ Posts: Create, Read, Update, Delete (với upload ảnh) - 4 tests
- ✅ Properties: Create, Read, Update, Delete (với upload ảnh) - 4 tests
- ✅ Offices: Create, Read, Update, Delete - 4 tests

### Form Tests (2 tests)
- ✅ Contact form submission
- ✅ Consignment form submission

**Tổng cộng: ~29 tests**

## Troubleshooting

### Login failed errors
Nếu thấy lỗi "Login failed", kiểm tra:
1. Email/password trong `.env` có đúng không
2. Đã chạy `npm run seed` chưa
3. Admin user có tồn tại trong database không

### Tests timeout
Nếu tests bị timeout:
- Tăng timeout trong `playwright.config.ts`
- Kiểm tra dev server có chạy không
- Kiểm tra database connection

### Upload image fails
- Kiểm tra Cloudinary credentials trong `.env`
- Test upload sử dụng 1x1 pixel PNG image (không cần ảnh thật)

## Cleanup Test Data

### Tự động cleanup
- Tests tự động cleanup sau mỗi test case (trong `afterEach` hook)
- Global teardown cleanup sau khi tất cả tests chạy xong
- **CHỈ xóa data có prefix "TEST_"** để đảm bảo không xóa data thực tế

### Cleanup thủ công
Nếu cần cleanup thủ công (ví dụ sau khi test bị crash):

```bash
npm run test:cleanup
```

Script này sẽ xóa **TẤT CẢ** data có prefix "TEST_" trong database.

### Lưu ý về Test Data
- **Tất cả test data phải có prefix "TEST_"** trong tên (title, name, etc.)
- Test data được tạo với timestamp để tránh conflict
- Cleanup functions chỉ tìm và xóa items có prefix "TEST_"
- Data thực tế (không có prefix "TEST_") sẽ **KHÔNG BAO GIỜ** bị xóa

## Notes

- Tests tự động start dev server nếu chưa chạy
- Tests cần có data trong database (chạy seed trước)
- Upload ảnh test sử dụng 1x1 pixel PNG image
- Một số tests có thể skip nếu không có data (ví dụ: test edit/delete khi không có items)
- Tests chạy song song, có thể gây conflict nếu cùng thao tác trên cùng data
- **Test data được cleanup tự động sau mỗi test và sau test suite**
