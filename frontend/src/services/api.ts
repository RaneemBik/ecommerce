// API service layer for backend communication

const API_BASE = '/api';
export const AUTH_TOKEN_KEY = 'auth_token';
export const AUTH_USER_KEY = 'novadash_user';

interface ApiError {
  message: string;
  errors?: Array<{ path: string; message: string }>;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on init
    this.token = localStorage.getItem(AUTH_TOKEN_KEY);
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: 'An error occurred',
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(path: string, data?: any): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(path: string, data?: any): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }
}

export const api = new ApiClient();

// Health check (not under /api prefix)
export async function checkHealth(): Promise<{ ok: boolean }> {
  const response = await fetch('/health');
  return response.json();
}

// Auth endpoints
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
  };
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const result = await api.post<AuthResponse>('/auth/login', data);
  api.setToken(result.token);
  return result;
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  return api.post<RegisterResponse>('/auth/register', data);
}

export function logout() {
  api.clearToken();
  localStorage.removeItem(AUTH_USER_KEY);
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
}
