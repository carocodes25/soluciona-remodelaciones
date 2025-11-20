import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi, LoginDto, RegisterDto } from '../api/auth';

interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  name?: string;
  avatar?: string;
  isEmailVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;
  
  // Actions
  login: (credentials: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
  initializeAuth: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      login: async (credentials: LoginDto) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);
          
          // Save tokens to localStorage
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          
          set({
            user: response.user,
            accessToken: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          const message = error.response?.data?.message || 'Error al iniciar sesión';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterDto) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);
          
          // Save tokens to localStorage
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          
          set({
            user: response.user,
            accessToken: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          const message = error.response?.data?.message || 'Error al registrarse';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Error during logout:', error);
        } finally {
          // Clear everything
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      clearError: () => {
        set({ error: null });
      },

      initializeAuth: () => {
        // Check if we have tokens in localStorage
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (accessToken && refreshToken) {
          const state = get();
          // If we have tokens but no user in state, restore from storage
          if (!state.user && !state.isAuthenticated) {
            const stored = localStorage.getItem('auth-storage');
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                if (parsed.state?.user && parsed.state?.accessToken) {
                  set({
                    user: parsed.state.user,
                    accessToken: parsed.state.accessToken,
                    isAuthenticated: true,
                  });
                }
              } catch (error) {
                console.error('Error parsing stored auth:', error);
              }
            }
          }
        }
      },

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
