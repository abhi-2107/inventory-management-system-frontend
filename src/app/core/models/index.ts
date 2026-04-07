// ========================================
// AUTH MODELS
// ========================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  orgName: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  organization: Organization;
  token: string;
}

export interface JwtPayload {
  userId: string;
  orgId: string;
  role: Role;
  iat: number;
  exp: number;
}

// ========================================
// USER / ORG MODELS
// ========================================

export type Role = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    members: number;
    products: number;
  };
}

export interface Member {
  id: string;
  role: Role;
  userId: string;
  organizationId: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// CATEGORY MODELS
// ========================================

export interface Category {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface CategoryCreateRequest {
  name: string;
  description?: string;
}

// ========================================
// PRODUCT MODELS
// ========================================

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  categoryId: string | null;
  organizationId: string;
  category?: Category | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreateRequest {
  sku: string;
  name: string;
  description?: string;
  price: number;
  categoryId?: string;
}

export interface ProductUpdateRequest {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
}

// ========================================
// INVENTORY / STOCK MODELS
// ========================================

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface StockMovement {
  id: string;
  productId: string;
  product?: Product;
  type: MovementType;
  quantity: number;
  reason: string | null;
  userId: string | null;
  organizationId: string;
  createdAt: string;
}

export interface StockMovementRequest {
  productId: string;
  type: MovementType;
  quantity: number;
  reason?: string;
}

export interface StockMovementResponse {
  movement: StockMovement;
  updatedProduct: Product;
}

// ========================================
// AUDIT MODELS
// ========================================

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  details: Record<string, unknown> | null;
  userId: string;
  user?: User;
  organizationId: string;
  createdAt: string;
}

// ========================================
// UI MODELS
// ========================================

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => string;
  width?: string;
}
