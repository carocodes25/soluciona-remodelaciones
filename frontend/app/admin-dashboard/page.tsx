'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import Navbar from '@/components/layout/Navbar';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-lg p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Panel de Administración 🛡️
          </h1>
          <p className="text-purple-100">
            Bienvenido, {user?.name} - Gestiona la plataforma
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Usuarios</h3>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">52</p>
            <p className="text-xs text-green-600 mt-1">↑ Activos</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Profesionales</h3>
              <span className="text-2xl">👷</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">20</p>
            <p className="text-xs text-gray-500 mt-1">Verificados</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Trabajos</h3>
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-xs text-gray-500 mt-1">Publicados</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Ingresos</h3>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">$0</p>
            <p className="text-xs text-gray-500 mt-1">Este mes</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Usuarios Recientes</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Carlos Rueda</p>
                    <p className="text-sm text-gray-600">soporte@concrecol.com</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    CLIENT
                  </span>
                </div>
                <div className="text-center py-4 text-gray-500 text-sm">
                  + 51 usuarios más
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Gestión</h2>
            </div>
            <div className="p-6 space-y-3">
              <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-3 px-4 rounded-lg transition-colors text-left">
                <div className="flex items-center">
                  <span className="text-xl mr-3">👥</span>
                  <div>
                    <div className="font-semibold">Gestionar Usuarios</div>
                    <div className="text-xs text-blue-600">Ver todos los usuarios</div>
                  </div>
                </div>
              </button>

              <button className="w-full bg-green-50 hover:bg-green-100 text-green-700 font-medium py-3 px-4 rounded-lg transition-colors text-left">
                <div className="flex items-center">
                  <span className="text-xl mr-3">✅</span>
                  <div>
                    <div className="font-semibold">Verificaciones</div>
                    <div className="text-xs text-green-600">Aprobar profesionales</div>
                  </div>
                </div>
              </button>

              <button className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-3 px-4 rounded-lg transition-colors text-left">
                <div className="flex items-center">
                  <span className="text-xl mr-3">🔍</span>
                  <div>
                    <div className="font-semibold">Auditoría</div>
                    <div className="text-xs text-purple-600">Ver logs del sistema</div>
                  </div>
                </div>
              </button>

              <button className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium py-3 px-4 rounded-lg transition-colors text-left">
                <div className="flex items-center">
                  <span className="text-xl mr-3">⚠️</span>
                  <div>
                    <div className="font-semibold">Disputas</div>
                    <div className="text-xs text-orange-600">Resolver conflictos</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Estado del Sistema</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-semibold text-gray-900">Backend API</p>
                  <p className="text-sm text-green-700">Operativo</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-semibold text-gray-900">Base de Datos</p>
                  <p className="text-sm text-green-700">Conectada</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-semibold text-gray-900">Redis Cache</p>
                  <p className="text-sm text-green-700">Activo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
