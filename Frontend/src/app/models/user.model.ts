// Frontend/src/app/models/user.model.ts
export interface User {
  id: string;
  email: string;
  username: string;
  saldo: number;
  esDemo: boolean;
  avatar?: string;
  roles?: string[];
}

export interface AuthResponse {
  access_token: string;
  user: User;
}