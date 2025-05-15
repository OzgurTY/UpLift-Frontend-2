// src/config/api.ts

const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      VERIFY: '/api/auth/verify',
    },
    USER: {
      ME: '/api/users/me',
      PROFILE: (id: string) => `/api/users/${id}`,
      UPDATE_PROFILE: '/api/users/update-profile',
      CHANGE_PASSWORD: '/api/users/change-password',
    },
    THERAPIST: {
      LIST: '/api/therapists/list',
      PROFILE: (id: string) => `/api/therapists/${id}`,
      SLOTS: (id: string) => `/api/slot/therapist/${id}`,
    },
    APPOINTMENT: {
      LIST: '/api/appointments/my',
      BOOK: (slotId: string) => `/api/payment/book/${slotId}`,
      CANCEL: (id: string) => `/api/appointments/${id}`,
    },
  },
  getUrl(endpoint: string): string {
    return `${this.BASE_URL}${endpoint}`;
  },
  getAuthHeader(token: string | null): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  },
  async fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(this.getUrl(endpoint), {
        ...options,
        headers: {
          ...this.getAuthHeader(token),
          ...(options.headers || {}),
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/auth/login';
          throw new Error('Authentication required');
        }
        
        const errorText = await response.text();
        throw new Error(errorText || `API error: ${response.status}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }
};

export default API_CONFIG;