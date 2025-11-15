# Deployment Checklist

## Pre-Deployment

### 1. Environment Variables ✅
Đảm bảo tất cả environment variables đã được cấu hình trên server:

```bash
# Database
DATABASE_URL=mongodb://... hoặc mongodb+srv://...

# NextAuth
NEXTAUTH_SECRET=your-secret-minimum-32-characters
NEXTAUTH_URL=https://your-domain.com

# Public URL
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional
CRON_SECRET=your-secret-token (nếu cần gọi API cleanup manual)
RESEND_API_KEY=your-resend-key (nếu dùng email)
```

### 2. Database Setup ✅
- [ ] MongoDB đã được setup và accessible từ server
- [ ] Database connection string đã được test
- [ ] Prisma Client đã được generate: `npx prisma generate`
- [ ] Database đã được seed: `npm run seed` (nếu cần)

### 3. Build Test ✅
```bash
# Test build locally trước khi deploy
npm run build

# Kiểm tra không có lỗi build
# Kiểm tra .next folder đã được tạo
```

### 4. Dependencies ✅
```bash
# Đảm bảo tất cả dependencies đã được cài
npm install

# Kiểm tra không có vulnerabilities nghiêm trọng
npm audit
```

### 5. Code Quality ✅
```bash
# Chạy linter
npm run lint

# Kiểm tra không có linter errors
```

## Deployment Steps

### 1. Server Preparation
- [ ] Server đã được setup với Node.js (version 18+)
- [ ] PM2 hoặc process manager đã được cài đặt
- [ ] Nginx hoặc reverse proxy đã được cấu hình (nếu cần)
- [ ] Firewall đã được cấu hình đúng (port 3000 hoặc port bạn dùng)

### 2. Code Deployment
```bash
# 1. Clone hoặc pull code mới nhất
git pull origin main

# 2. Cài đặt dependencies
npm install --production

# 3. Generate Prisma Client
npx prisma generate

# 4. Build application
npm run build

# 5. Start application với PM2
pm2 start npm --name "wellington-app" -- start
# Hoặc
pm2 start ecosystem.config.js (nếu có)

# 6. Save PM2 configuration
pm2 save
pm2 startup
```

### 3. Environment Variables trên Server
- [ ] Tạo file `.env` trên server với tất cả biến môi trường
- [ ] Đảm bảo `.env` không được commit vào git
- [ ] Kiểm tra permissions của `.env` file (chmod 600)

### 4. Process Management
```bash
# Kiểm tra app đang chạy
pm2 list

# Xem logs
pm2 logs wellington-app

# Restart app
pm2 restart wellington-app

# Stop app
pm2 stop wellington-app
```

### 5. Nginx Configuration (nếu dùng)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Post-Deployment Verification

### 1. Health Checks ✅
- [ ] Homepage load được: `https://your-domain.com`
- [ ] Admin login hoạt động: `https://your-domain.com/login`
- [ ] API endpoints hoạt động
- [ ] Image upload hoạt động
- [ ] Database queries hoạt động

### 2. Cron Scheduler ✅
- [ ] Kiểm tra logs khi server start - phải thấy:
  ```
  [Cron] Đang khởi động cron scheduler...
  [Cron] Scheduler đã được khởi động thành công!
  [Cron] Cleanup task sẽ chạy vào 3h đêm ngày 1 mỗi tháng (GMT+7)
  [Instrumentation] Cron scheduler đã được khởi động
  ```

### 3. Monitoring ✅
- [ ] Setup monitoring/logging (nếu có)
- [ ] Kiểm tra error logs
- [ ] Kiểm tra performance

### 4. Security ✅
- [ ] SSL certificate đã được cài đặt (Let's Encrypt)
- [ ] HTTPS redirect đã được cấu hình
- [ ] Environment variables không bị expose
- [ ] Admin credentials đã được đổi từ default

## Rollback Plan

Nếu có vấn đề sau khi deploy:

```bash
# 1. Stop current app
pm2 stop wellington-app

# 2. Rollback code
git checkout <previous-commit-hash>

# 3. Rebuild
npm run build

# 4. Restart
pm2 restart wellington-app
```

## Troubleshooting

### App không start
- Kiểm tra logs: `pm2 logs wellington-app`
- Kiểm tra environment variables
- Kiểm tra database connection
- Kiểm tra port có bị chiếm không: `lsof -i :3000`

### Cron không chạy
- Kiểm tra `next.config.ts` có `instrumentationHook: true`
- Kiểm tra `instrumentation.ts` có tồn tại
- Kiểm tra logs khi server start

### Database connection errors
- Kiểm tra `DATABASE_URL` đúng format
- Kiểm tra MongoDB đang chạy
- Kiểm tra network/firewall rules
- Test connection: `npm run validate:db`

### Image upload không hoạt động
- Kiểm tra Cloudinary credentials
- Kiểm tra file permissions
- Kiểm tra network connectivity to Cloudinary

## Maintenance

### Regular Tasks
- [ ] Monitor logs hàng ngày
- [ ] Backup database định kỳ
- [ ] Update dependencies hàng tháng
- [ ] Review và cleanup orphan images (tự động chạy ngày 1 mỗi tháng)

### Updates
```bash
# Update dependencies
npm update

# Rebuild và restart
npm run build
pm2 restart wellington-app
```


