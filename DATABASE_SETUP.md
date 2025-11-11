# Database Setup Guide

## MongoDB Connection String Format

### Local MongoDB
```env
DATABASE_URL=mongodb://username:password@localhost:27017/database_name?authSource=admin
```

### MongoDB Atlas (Cloud)
```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

## Environment Variables Required

Create a `.env` file in the root directory with:

```env
# Database Configuration
DATABASE_URL=mongodb://username:password@host:port/database?authSource=admin

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here-minimum-32-characters-long
NEXTAUTH_URL=http://localhost:3000

# Public Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Admin User Credentials (for seeding)
SEED_ADMIN_EMAIL=admin@wellington.com
SEED_ADMIN_PASSWORD=123456
```

## Validate Database Connection

Run the validation script to check your database connection:

```bash
npm run validate:db
```

This will:
- ✅ Check if DATABASE_URL is set
- ✅ Validate connection string format
- ✅ Test connection to MongoDB
- ✅ Run a sample query to verify access

## Common Issues

### Authentication Failed Error

**Error:** `SCRAM failure: bad auth : Authentication failed`

**Solutions:**
1. **Check username and password** in DATABASE_URL
   - Ensure they are URL-encoded if they contain special characters
   - Example: `password@123` → `password%40123`

2. **Verify authSource parameter**
   - For local MongoDB: Add `?authSource=admin` to connection string
   - For MongoDB Atlas: Usually not needed, but can add `?authSource=admin`

3. **Check user permissions**
   - User must have read/write access to the database
   - For MongoDB Atlas: Check Database Access settings

4. **IP Whitelist (MongoDB Atlas)**
   - Add your IP address to Network Access whitelist
   - Or allow access from anywhere (0.0.0.0/0) for development

### Connection Refused Error

**Error:** `ENOTFOUND` or `ECONNREFUSED`

**Solutions:**
1. **Check if MongoDB is running** (local)
   ```bash
   # Windows
   net start MongoDB
   
   # Linux/Mac
   sudo systemctl start mongod
   ```

2. **Verify host and port**
   - Default MongoDB port: `27017`
   - For MongoDB Atlas: Use the connection string from Atlas dashboard

3. **Check firewall settings**
   - Ensure port 27017 (or Atlas port) is not blocked

## Testing Connection

### Using MongoDB Compass
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Paste your connection string
3. Click "Connect"

### Using mongosh (MongoDB Shell)
```bash
mongosh "mongodb://username:password@localhost:27017/database?authSource=admin"
```

### Using the validation script
```bash
npm run validate:db
```

## Next Steps

After setting up DATABASE_URL:

1. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Seed the database:**
   ```bash
   npm run seed
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

