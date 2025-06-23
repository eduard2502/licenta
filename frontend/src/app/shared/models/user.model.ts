export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  address?: string;
  avatarImageBase64?: string;
  roles: string[];
}

export interface UserUpdateDto {
  email: string;
  fullName?: string;
  phone?: string;
  address?: string;
  avatarImageBase64?: string | null;
  roles?: string[];
}
// Ar putea fi util să ai și un model pentru răspunsul JWT de la login
export interface JwtResponse {
    token: string;
    type?: string; // Usually 'Bearer'
    id: number;
    username: string;
    email: string;
    avatarImageBase64?: string | null;
    roles: string[];
}

// Model pentru LoginRequest (dacă vrei să-l typezi explicit în AuthService)
export interface LoginRequest {
    username?: string; // Optional dacă folosești un DTO mai generic
    password?: string;
}

// Model pentru SignupRequest (dacă vrei să-l typezi explicit în AuthService/SignupComponent)
export interface SignupRequest {
    username?: string;
    email?: string;
    password?: string;
    role?: string[]; // Poate fi un set de roluri la înregistrare
}