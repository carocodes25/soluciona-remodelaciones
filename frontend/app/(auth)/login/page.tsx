'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login({ email, password });
      
      // Redirect based on role
      const user = useAuthStore.getState().user;
      if (user?.role === 'CLIENT') {
        router.push('/client-dashboard');
      } else if (user?.role === 'PRO') {
        router.push('/pro-dashboard');
      } else if (user?.role === 'ADMIN') {
        router.push('/admin-dashboard');
      } else {
        router.push('/');
      }
    } catch (err) {
      // Error is handled by the store
      console.error('Login failed:', err);
    }
  };

  const fillDemoCredentials = (role: 'client' | 'pro' | 'admin') => {
    if (role === 'client') {
      setEmail('maría.gonzález@gmail.com');
      setPassword('Demo123!');
    } else if (role === 'pro') {
      setEmail('carlos.pintor@gmail.com');
      setPassword('Demo123!');
    } else {
      setEmail('admin@soluciona.co');
      setPassword('Admin123!');
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <span className="text-blue-600 text-2xl font-bold">S</span>
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold">Soluciona</h1>
              <p className="text-blue-100 text-sm">Remodelaciones</p>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6">
            Transforma tu hogar con los mejores profesionales
          </h2>
          
          <p className="text-blue-100 text-lg mb-8">
            Conecta con expertos verificados en remodelación y construcción. 
            Tu proyecto en las mejores manos.
          </p>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">✓</span>
              </div>
              <span className="text-white">Profesionales verificados</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">✓</span>
              </div>
              <span className="text-white">Presupuestos competitivos</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">✓</span>
              </div>
              <span className="text-white">Pagos seguros</span>
            </div>
          </div>
        </div>

        <div className="text-blue-100 text-sm">
          © 2025 Soluciona Remodelaciones. Todos los derechos reservados.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Bienvenido de nuevo
            </h2>
            <p className="mt-2 text-gray-600">
              Inicia sesión para continuar
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="flex items-center">
                  <span className="text-red-600 mr-2">⚠️</span>
                  <div className="text-sm text-red-800">{error}</div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Recordarme
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Regístrate gratis
                </Link>
              </p>
            </div>

            {/* Demo credentials - Improved design */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <p className="text-xs font-semibold text-blue-900 mb-3 flex items-center">
                <span className="mr-2">🔑</span>
                Credenciales de prueba - Click para autocompletar
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('client')}
                  className="w-full text-left px-3 py-2 text-xs bg-white hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
                >
                  <span className="font-medium text-gray-900">👤 Cliente:</span>
                  <span className="text-gray-600 ml-2">client1@example.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('pro')}
                  className="w-full text-left px-3 py-2 text-xs bg-white hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
                >
                  <span className="font-medium text-gray-900">🔧 Profesional:</span>
                  <span className="text-gray-600 ml-2">pro1@example.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('admin')}
                  className="w-full text-left px-3 py-2 text-xs bg-white hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
                >
                  <span className="font-medium text-gray-900">👑 Admin:</span>
                  <span className="text-gray-600 ml-2">admin@soluciona.co</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
