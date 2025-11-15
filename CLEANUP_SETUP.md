# Image Cleanup Cron Job Setup

## Tổng quan

Hệ thống cleanup tự động sẽ xóa các ảnh "orphan" (ảnh trên Cloudinary nhưng không còn được tham chiếu trong database) vào lúc **3h đêm ngày 1 mỗi tháng**.

## Cấu trúc

- **`src/app/actions/cleanupActions.ts`**: Logic cleanup - tìm và xóa orphan images
- **`src/lib/cronScheduler.ts`**: Cron scheduler service - tự động chạy khi server khởi động
- **`instrumentation.ts`**: Next.js instrumentation hook - khởi động cron scheduler
- **`src/app/api/cron/cleanup-images/route.ts`**: API endpoint để trigger cleanup manually (tùy chọn)

## Cách hoạt động

1. **Lấy tất cả image URLs từ database**:
   - Post images (`Post.imageUrl`)
   - Property images (`Property.imageUrls`)
   - Office photos (`Office.photos`)
   - SiteContent images (`SiteContent.imageUrl`)

2. **Lấy tất cả images từ Cloudinary** trong folder `thewellingtonoffices`

3. **So sánh và tìm orphan images** (có trong Cloudinary nhưng không có trong database)

4. **Xóa orphan images** khỏi Cloudinary

## Setup

### 1. Automatic Scheduler (Tự động - Khuyến nghị)

Cron job sẽ **tự động chạy** khi server khởi động nhờ Next.js instrumentation hook. Không cần cấu hình thêm gì!

**Cách hoạt động:**
- Khi server start, `instrumentation.ts` sẽ được gọi
- Nó sẽ khởi động `cronScheduler` với schedule: **3h đêm ngày 1 mỗi tháng (GMT+7)**
- Cron job sẽ tự động chạy theo lịch đã định

**Schedule**: `0 3 1 * *` = 3:00 AM ngày 1 mỗi tháng (múi giờ Việt Nam)

**Lưu ý:**
- Cron job chỉ chạy khi server đang chạy
- Nếu server restart, cron job sẽ tự động khởi động lại
- Đảm bảo server chạy 24/7 để cron job hoạt động đúng

### 2. Manual Testing

Bạn có thể test cleanup function manually bằng cách:

**Option 1: Gọi API endpoint**
```bash
curl -X GET https://your-domain.com/api/cron/cleanup-images \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Option 2: Tạo test script**
Tạo file `scripts/test-cleanup.ts`:
```typescript
import { cleanupOrphanImages } from '../src/app/actions/cleanupActions';

cleanupOrphanImages().then(result => {
  console.log('Cleanup result:', result);
  process.exit(0);
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
```

Chạy:
```bash
ts-node -P tsconfig.seed.json scripts/test-cleanup.ts
```

**Option 3: Gọi API endpoint (nếu cần trigger manual)**
```bash
curl -X GET http://localhost:3000/api/cron/cleanup-images
```

### 3. VPS/Server Setup

**Đảm bảo:**
1. Server chạy 24/7 (dùng PM2, systemd, hoặc process manager khác)
2. Next.js app chạy với `npm start` hoặc `node .next/standalone/server.js` (nếu dùng standalone build)
3. Cron scheduler sẽ tự động khởi động khi app start

**Ví dụ với PM2:**
```bash
pm2 start npm --name "wellington-app" -- start
pm2 save
pm2 startup
```

**Ví dụ với systemd:**
Tạo file `/etc/systemd/system/wellington-app.service`:
```ini
[Unit]
Description=Wellington Offices App
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/the_wellington_offices
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target
```

Sau đó:
```bash
sudo systemctl enable wellington-app
sudo systemctl start wellington-app
```

## Environment Variables

Đảm bảo có các biến môi trường sau:

```env
# Cloudinary (bắt buộc)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Database (bắt buộc)
DATABASE_URL=your-mongodb-url

# Cron Secret (tùy chọn, chỉ dùng nếu gọi API endpoint manual)
CRON_SECRET=your-secret-token-here
```

**Lưu ý**: `CRON_SECRET` chỉ cần nếu bạn muốn gọi API endpoint `/api/cron/cleanup-images` từ bên ngoài. Cron scheduler tự động không cần secret này.

## Logs

Cleanup function sẽ log các thông tin sau:
- Số lượng images trong Cloudinary
- Số lượng images trong database
- Số lượng orphan images tìm thấy
- Số lượng images đã xóa thành công
- Số lượng images xóa thất bại (nếu có)
- Chi tiết lỗi (nếu có)

Bạn có thể xem logs trong:
- **Vercel**: Dashboard → Functions → Logs
- **Local**: Console output khi chạy manual

## Lưu ý

1. **Backup**: Cleanup sẽ xóa vĩnh viễn các ảnh orphan. Đảm bảo bạn đã backup nếu cần.

2. **Performance**: Nếu có nhiều ảnh (hàng nghìn), cleanup có thể mất vài phút. Vercel cron job có timeout 60 giây cho Hobby plan, 300 giây cho Pro plan.

3. **Rate Limits**: Cloudinary có rate limits. Nếu có quá nhiều ảnh cần xóa, có thể cần chia nhỏ hoặc tăng thời gian giữa các lần xóa.

4. **Testing**: Nên test cleanup function trên staging environment trước khi deploy lên production.

## Troubleshooting

### Cron job không chạy
- Kiểm tra server có đang chạy không (`pm2 list` hoặc `systemctl status`)
- Kiểm tra logs khi server start - phải thấy message `[Cron] Scheduler đã được khởi động thành công!`
- Kiểm tra `next.config.ts` có `instrumentationHook: true` không
- Kiểm tra `instrumentation.ts` có tồn tại và đúng format không
- Kiểm tra timezone - cron job chạy theo GMT+7 (Asia/Ho_Chi_Minh)

### Lỗi "Unauthorized"
- Kiểm tra `CRON_SECRET` trong environment variables
- Kiểm tra Authorization header khi gọi API

### Lỗi khi xóa ảnh
- Kiểm tra Cloudinary credentials
- Kiểm tra permissions của Cloudinary API key
- Xem logs để biết chi tiết lỗi

### Cleanup chạy quá lâu
- Có thể có quá nhiều ảnh cần xóa
- Xem xét tăng timeout hoặc chia nhỏ batch

