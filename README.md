# Eyewear E-commerce Backend

A complete TypeScript backend for an eyewear e-commerce platform built with Express, MongoDB, and Cloudinary.

## Features

- 🔐 **JWT Authentication** - Access and refresh tokens with role-based access control
- 👤 **User Management** - User registration, login, and profile management
- 🛍️ **Product Management** - Full CRUD operations with image uploads
- 🏷️ **Brand Management** - Brand catalog with logo uploads
- 🛒 **Shopping Cart** - Add, update, and remove items from cart
- ❤️ **Wishlist** - Save favorite products
- 📊 **Admin Dashboard** - Overview statistics and management
- 📸 **Image Upload** - Cloudinary integration for product and brand images
- 📄 **API Documentation** - Complete OpenAPI/Swagger documentation
- 🔍 **Advanced Filtering** - Search, filter, sort, and paginate products

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **File Upload**: Multer + Cloudinary
- **Validation**: express-validator
- **Documentation**: Swagger UI + OpenAPI 3.0

## Project Structure

\`\`\`
src/
├── config/          # Configuration files (database, cloudinary, multer, jwt)
├── controllers/     # Request handlers (class-based controllers)
├── models/          # Mongoose schemas and TypeScript interfaces
├── routes/          # Express route definitions
├── services/        # Business logic (cloudinary, token service)
├── middleware/      # Auth, validation, error handling
├── types/           # TypeScript type definitions
├── utils/           # Helper functions (pagination, logger)
├── seed/            # Database seeding script
├── app.ts           # Express app configuration
└── server.ts        # Server entry point

docs/
└── openapi.yaml     # OpenAPI 3.0 specification
\`\`\`

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd eyewear-ecommerce-backend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Create environment file**
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. **Configure environment variables**
   
   Edit `.env` with your values:
   \`\`\`env
   # Server
   PORT=5000
   NODE_ENV=development

   # Database
   MONGO_URI=mongodb://localhost:27017/eyewear-ecommerce

   # JWT Secrets (change these!)
   JWT_SECRET=your-super-secret-jwt-key-change-this
   REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-change-this
   JWT_EXPIRES_IN=15m
   REFRESH_TOKEN_EXPIRES_IN=7d

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret

   # Admin
   ADMIN_INVITE_CODE=secret-admin-code-123
   \`\`\`

5. **Seed the database**
   \`\`\`bash
   npm run seed
   \`\`\`

   This creates:
   - Admin user: `admin@eyewear.com` / `admin123`
   - Regular user: `user@eyewear.com` / `user123`
   - Sample products, brands, and insurance logos

6. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

   Server runs on `http://localhost:5000`

### Production Build

\`\`\`bash
npm run build
npm start
\`\`\`

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:5000/docs
- **Health Check**: http://localhost:5000/health

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user

### Products
- `GET /products` - Get all products (with filters)
- `GET /products/:id` - Get single product
- `POST /products` - Create product (admin)
- `PUT /products/:id` - Update product (admin)
- `DELETE /products/:id` - Delete product (admin)
- `GET /products/related/:productId` - Get related products

### Brands
- `GET /brands` - Get all brands
- `GET /brands/:id` - Get single brand
- `POST /brands` - Create brand (admin)
- `PUT /brands/:id` - Update brand (admin)
- `DELETE /brands/:id` - Delete brand (admin)
- `GET /brands/:brandSlug/products` - Get products by brand

### Insurance Logos
- `GET /insurance-logos` - Get all insurance logos
- `POST /insurance-logos` - Create logo (admin)
- `PUT /insurance-logos/:id` - Update logo (admin)
- `DELETE /insurance-logos/:id` - Delete logo (admin)

### Cart
- `GET /cart` - Get user's cart
- `POST /cart` - Add item to cart
- `PUT /cart/:itemId` - Update cart item
- `DELETE /cart/:itemId` - Remove from cart

### Wishlist
- `GET /wishlist` - Get user's wishlist
- `POST /wishlist` - Add to wishlist
- `DELETE /wishlist/:productId` - Remove from wishlist

### Admin
- `GET /admin/overview` - Dashboard overview (admin)

## Example API Calls

### Register User
\`\`\`bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
\`\`\`

### Login
\`\`\`bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@eyewear.com",
    "password": "admin123"
  }'
\`\`\`

### Get Products (with filters)
\`\`\`bash
curl "http://localhost:5000/products?page=1&limit=12&brand=Ray-Ban&sort=price-asc"
\`\`\`

### Create Product (admin)
\`\`\`bash
curl -X POST http://localhost:5000/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "name=New Sunglasses" \
  -F "brand=Ray-Ban" \
  -F "price=199.99" \
  -F "description=Amazing sunglasses" \
  -F "colors=[\"Black\",\"Blue\"]" \
  -F "features=[\"UV Protection\"]" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
\`\`\`

### Add to Cart
\`\`\`bash
curl -X POST http://localhost:5000/cart \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_ID",
    "quantity": 2
  }'
\`\`\`

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run seed` - Seed database with initial data
- `npm run lint` - Run ESLint

## Authentication Flow

1. **Register/Login** - Receive `accessToken` (15min) and `refreshToken` (7 days)
2. **Use Access Token** - Include in Authorization header: `Bearer YOUR_ACCESS_TOKEN`
3. **Refresh Token** - When access token expires, use refresh token to get new access token
4. **Logout** - Invalidate refresh token

## Admin Access

To create an admin user, include the `ADMIN_INVITE_CODE` from your `.env` file:

\`\`\`json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "securepassword",
  "role": "admin",
}
\`\`\`

## Error Handling

All endpoints return consistent error responses:

\`\`\`json
{
  "success": false,
  "error": "Error message here",
  "details": ["Additional error details if applicable"]
}
\`\`\`

## License

MIT

## Support

For issues or questions, please open an issue on the repository.
