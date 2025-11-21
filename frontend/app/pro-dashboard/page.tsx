'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth';
import Navbar from '@/components/layout/Navbar';

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  budget: number;
  urgency: string;
  city: {
    id: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
    icon: string;
  };
  skills: Array<{
    id: string;
    name: string;
  }>;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  proposalsCount: number;
}

interface Proposal {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  amount: number;
  estimatedDays: number;
  coverLetter: string;
  createdAt: string;
  job: {
    id: string;
    title: string;
    status: string;
    client: {
      firstName: string;
      lastName: string;
    };
  };
}

interface Stats {
  activeProposals: number;
  activeContracts: number;
  completedJobs: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
}

export default function ProDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'jobs' | 'proposals'>('jobs');
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [myProposals, setMyProposals] = useState<Proposal[]>([]);
  const [stats, setStats] = useState<Stats>({
    activeProposals: 0,
    activeContracts: 0,
    completedJobs: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterUrgency, setFilterUrgency] = useState<string>('');

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login');
    } else if (_hasHydrated && user?.role !== 'PRO') {
      router.push('/client-dashboard');
    }
  }, [isAuthenticated, user, _hasHydrated, router]);

  useEffect(() => {
    if (_hasHydrated && isAuthenticated && user?.role === 'PRO') {
      loadDashboardData();
    }
  }, [_hasHydrated, isAuthenticated, user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with real API calls
      // const [jobsData, proposalsData, statsData] = await Promise.all([
      //   jobsApi.findAvailableForPro(),
      //   proposalsApi.getMyProposals(),
      //   prosApi.getMyStats()
      // ]);
      
      // Mock data for now
      setAvailableJobs([
        {
          id: '1',
          title: 'Reparación de instalación eléctrica residencial',
          description: 'Necesito un electricista certificado para revisar y reparar problemas con el sistema eléctrico de mi casa...',
          status: 'PUBLISHED',
          budget: 850000,
          urgency: 'URGENT',
          city: { id: '1', name: 'Bogotá' },
          category: { id: '1', name: 'Electricidad', icon: '⚡' },
          skills: [
            { id: '1', name: 'Instalaciones eléctricas' },
            { id: '2', name: 'Mantenimiento' },
          ],
          client: { id: '1', firstName: 'Carlos', lastName: 'Rueda' },
          createdAt: new Date().toISOString(),
          proposalsCount: 3,
        },
        {
          id: '2',
          title: 'Remodelación completa de baño',
          description: 'Busco un profesional con experiencia en remodelación de baños...',
          status: 'PUBLISHED',
          budget: 4000000,
          urgency: 'NORMAL',
          city: { id: '2', name: 'Medellín' },
          category: { id: '2', name: 'Plomería', icon: '🔧' },
          skills: [
            { id: '3', name: 'Remodelación' },
            { id: '4', name: 'Instalación de sanitarios' },
          ],
          client: { id: '2', firstName: 'María', lastName: 'González' },
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          proposalsCount: 5,
        },
      ]);

      setMyProposals([
        {
          id: '1',
          status: 'PENDING',
          amount: 800000,
          estimatedDays: 3,
          coverLetter: 'Tengo 10 años de experiencia en instalaciones eléctricas...',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          job: {
            id: '3',
            title: 'Instalación de sistema de iluminación LED',
            status: 'PUBLISHED',
            client: { firstName: 'Pedro', lastName: 'Martínez' },
          },
        },
        {
          id: '2',
          status: 'ACCEPTED',
          amount: 1500000,
          estimatedDays: 5,
          coverLetter: 'Especialista en reparaciones de techos...',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          job: {
            id: '4',
            title: 'Reparación de goteras en techo',
            status: 'IN_PROGRESS',
            client: { firstName: 'Ana', lastName: 'López' },
          },
        },
        {
          id: '3',
          status: 'REJECTED',
          amount: 600000,
          estimatedDays: 2,
          coverLetter: 'Puedo realizar el trabajo en 2 días...',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          job: {
            id: '5',
            title: 'Pintura de fachada',
            status: 'PUBLISHED',
            client: { firstName: 'Luis', lastName: 'Ramírez' },
          },
        },
      ]);

      setStats({
        activeProposals: 1,
        activeContracts: 1,
        completedJobs: 12,
        totalEarnings: 15000000,
        averageRating: 4.8,
        totalReviews: 15,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Hace ${diffMins} minutos`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getUrgencyBadge = (urgency: string) => {
    const badges = {
      URGENT: { label: '🔥 Urgente', color: 'bg-red-100 text-red-800 border-red-200' },
      NORMAL: { label: '📅 Normal', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      FLEXIBLE: { label: '🕐 Flexible', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    };
    const badge = badges[urgency as keyof typeof badges] || badges.NORMAL;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getProposalStatusBadge = (status: string) => {
    const badges = {
      PENDING: { label: '⏳ Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      ACCEPTED: { label: '✅ Aceptada', color: 'bg-green-100 text-green-800 border-green-200' },
      REJECTED: { label: '❌ Rechazada', color: 'bg-red-100 text-red-800 border-red-200' },
      WITHDRAWN: { label: '🚫 Retirada', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    };
    const badge = badges[status as keyof typeof badges] || badges.PENDING;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const filteredJobs = availableJobs.filter(job => {
    if (filterCategory && job.category.id !== filterCategory) return false;
    if (filterUrgency && job.urgency !== filterUrgency) return false;
    return true;
  });

  if (!_hasHydrated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                👋 Hola, {user?.firstName}
              </h1>
              <p className="text-blue-100 mt-1">Bienvenido a tu panel de profesional</p>
            </div>
            <Link
              href="/pro-profile"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg"
            >
              ⚙️ Mi Perfil
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Propuestas Activas</p>
                <p className="text-3xl font-bold text-blue-600">{stats.activeProposals}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Contratos Activos</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeContracts}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Trabajos Completados</p>
                <p className="text-3xl font-bold text-purple-600">{stats.completedJobs}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ganancias Totales</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.totalEarnings)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Card */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg p-6 mt-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold">{stats.averageRating}</div>
              <div>
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-6 h-6 ${star <= stats.averageRating ? 'text-white' : 'text-yellow-200'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-yellow-100">
                  {stats.totalReviews} reseñas de clientes satisfechos
                </p>
              </div>
            </div>
            <Link
              href="/pro/reviews"
              className="px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-yellow-50 transition-all"
            >
              Ver todas
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                activeTab === 'jobs'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              💼 Trabajos Disponibles ({filteredJobs.length})
            </button>
            <button
              onClick={() => setActiveTab('proposals')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                activeTab === 'proposals'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              📝 Mis Propuestas ({myProposals.length})
            </button>
          </div>

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <div className="p-6">
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas las categorías</option>
                  <option value="1">⚡ Electricidad</option>
                  <option value="2">🔧 Plomería</option>
                  <option value="3">🎨 Pintura</option>
                </select>

                <select
                  value={filterUrgency}
                  onChange={(e) => setFilterUrgency(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas las urgencias</option>
                  <option value="URGENT">🔥 Urgente</option>
                  <option value="NORMAL">📅 Normal</option>
                  <option value="FLEXIBLE">🕐 Flexible</option>
                </select>

                <button
                  onClick={() => {
                    setFilterCategory('');
                    setFilterUrgency('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  Limpiar filtros
                </button>
              </div>

              {/* Jobs List */}
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">{job.category.icon}</span>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                            <p className="text-sm text-gray-600">
                              Por {job.client.firstName} {job.client.lastName} • {formatDate(job.createdAt)}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                        
                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills.map((skill) => (
                            <span
                              key={skill.id}
                              className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full"
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-right ml-6">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {formatCurrency(job.budget)}
                        </div>
                        {getUrgencyBadge(job.urgency)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>📍 {job.city.name}</span>
                        <span>📝 {job.proposalsCount} propuestas</span>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                        >
                          Ver detalles
                        </Link>
                        <Link
                          href={`/jobs/${job.id}/submit-proposal`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md"
                        >
                          Enviar propuesta
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredJobs.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      No hay trabajos disponibles
                    </h3>
                    <p className="text-gray-600">
                      Intenta ajustar los filtros o vuelve más tarde
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Proposals Tab */}
          {activeTab === 'proposals' && (
            <div className="p-6">
              <div className="space-y-4">
                {myProposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{proposal.job.title}</h3>
                          {getProposalStatusBadge(proposal.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Cliente: {proposal.job.client.firstName} {proposal.job.client.lastName} • 
                          Enviada {formatDate(proposal.createdAt)}
                        </p>
                        <p className="text-gray-700 mb-3 line-clamp-2">{proposal.coverLetter}</p>
                      </div>
                      
                      <div className="text-right ml-6">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {formatCurrency(proposal.amount)}
                        </div>
                        <p className="text-sm text-gray-600">{proposal.estimatedDays} días</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        Estado del trabajo: <span className="font-semibold">{proposal.job.status}</span>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/jobs/${proposal.job.id}`}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                        >
                          Ver trabajo
                        </Link>
                        {proposal.status === 'PENDING' && (
                          <button
                            className="px-4 py-2 border border-red-300 text-red-700 rounded-lg font-semibold hover:bg-red-50 transition-all"
                          >
                            Retirar propuesta
                          </button>
                        )}
                        {proposal.status === 'ACCEPTED' && (
                          <Link
                            href={`/contracts/${proposal.id}`}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
                          >
                            Ver contrato
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {myProposals.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      No tienes propuestas aún
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Explora los trabajos disponibles y envía tu primera propuesta
                    </p>
                    <button
                      onClick={() => setActiveTab('jobs')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                    >
                      Ver trabajos disponibles
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
