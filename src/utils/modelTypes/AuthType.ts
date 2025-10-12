import { ImageType } from ".";

// Role type
export interface RoleType {
  id: number;
  name: string;
  permissions: string[];
  created_at: string;
  updated_at?: string | null;
  user_id?: number;
}

// Shop type
export interface AuthShopType {
  id: number;
  name: string;
}

// User type (nested inside Auth)
export interface UserDataType {
  id: number;
  name: string;
  phone_no?: string;
  image?: ImageType;
  email: string;
  is_active: boolean;
  roles: RoleType[];
  shops: AuthShopType[];
  created_at: string;
  updated_at?: string | null;
}

// Auth response root type
export interface AuthDataType {
  message: string;
  token_type: string; // "bearer"
  access_token: string;
  refresh_token: string;
  user: UserDataType;
  exp: string; // ISO timestamp like "2025-10-12T12:46:29.929459+00:00"
}
