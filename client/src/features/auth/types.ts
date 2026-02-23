// Auth Feature — Types
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: "CITIZEN" | "ADMIN";
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
