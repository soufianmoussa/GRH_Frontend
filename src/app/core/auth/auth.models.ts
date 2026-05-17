export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  username: string;
  roles: string[];
  matricule: string | null;
  agentId: number | null;
}

export interface UserInfo {
  id: number;
  username: string;
  roles: string[];
  matricule: string | null;
  agentId: number | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details?: string[];
}

export interface AccountDTO {
  id: number;
  username: string;
  roles: string[];
  enabled: boolean;
  failedAttempts: number;
  lockUntil: string | null;
  agentId: number | null;
  agentName: string | null;
  matricule: string | null;
}

export interface AccountCreationRequest {
  username: string;
  password: string;
  roles: string[];
  agentId: number | null;
}

export interface RoleUpdateRequest {
  roles: string[];
  agentId: number | null;
}

export interface PasswordResetRequest {
  newPassword: string;
}

export interface LinkAgentRequest {
  agentId: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface AccountSearchParams {
  search?: string;
  role?: string | null;
  enabled?: boolean | null;
  locked?: boolean | null;
  linked?: boolean | null;
  page?: number;
  size?: number;
  sort?: string;
}

export interface AuthAuditLogDTO {
  id: number;
  username: string;
  action: string;
  ipAddress: string;
  timestamp: string;
  details: string;
}

export interface AuthAuditSearchParams {
  username?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sort?: string;
}
