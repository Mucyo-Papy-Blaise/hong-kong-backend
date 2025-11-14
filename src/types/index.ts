import type { Request } from "express"
import type { JwtPayload } from "jsonwebtoken"

// User role types
export type UserRole = "user" | "admin"

// Extended request with authenticated user
export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: UserRole
  }
}

// JWT payload interface
export interface TokenPayload extends JwtPayload {
  id: string
  email: string
  role: UserRole
}

// Pagination query params
export interface PaginationQuery {
  page?: string
  limit?: string
}

// Product filter query params
export interface ProductFilterQuery extends PaginationQuery {
  brand?: string
  minPrice?: string
  maxPrice?: string
  search?: string
  sort?: string
  gender?: string
  lensType?: string
  shape?: string;
}

// Cart item type
export interface CartItem {
  productId: string
  quantity: number
  priceAtAddTime: number
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}
