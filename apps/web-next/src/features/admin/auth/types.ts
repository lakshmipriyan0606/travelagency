export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN" | "USER";
  exp?: number;
}

export interface SessionData {
  user: AdminUser;
  accessToken: string;
}
