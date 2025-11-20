'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth';
import { jobsApi, Job } from '@/lib/api/jobs';
import Navbar from '@/components/layout/Navbar';

interface Proposal {
  id: string;
  amount: number;
  description: string;
  estimatedDuration: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  pro: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    rating: number;
    completedJobs: number;
  };
}

export default function JobDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const [job, setJob] = useState<Job | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'proposals'>('details');

  useEffect(() => {
    if (!_hasHydrated) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadJobDetails();
  }, [isAuthenticated, user, router, _hasHydrated, jobId]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);
      const jobData = await jobsApi.findOne(jobId);
      setJob(jobData);
      
      // TODO: Load proposals when backend endpoint is ready
      // const proposalsData = await proposalsApi.findByJob(jobId);
      // setProposals(proposalsData);
      
      // Mock proposals for now
      setProposals([]);
    } catch (error) {
      console.error('Error loading job:', error);
      router.push('/client-dashboard');
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
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Borrador' },
      PUBLISHED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Publicado' },
      IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En Progreso' },
      COMPLETED: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Completado' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
    };
    const badge = badges[status] || badges.DRAFT;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const badges: Record<string, { icon: string; label: string; color: string }> = {
      URGENT: { icon: '🔥', label: 'Urgente', color: 'text-red-600' },
      HIGH: { icon: '⚡', label: 'Alta', color: 'text-orange-600' },
      MEDIUM: { icon: '📅', label: 'Media', color: 'text-blue-600' },
      LOW: { icon: '🕐', label: 'Baja', color: 'text-gray-600' },
    };
    const badge = badges[urgency] || badges.MEDIUM;
    return (
      <span className={`flex items-center gap-1 font-medium ${badge.color}`}>
        <span>{badge.icon}</span>
        <span>{badge.label}</span>
      </span>
    );
  };

  if (loading || !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Cargando proyecto...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/client-dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver al Dashboard
            </Link>
            {getStatusBadge(job.status)}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Publicado el {formatDate(job.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.city?.name || 'Ciudad'}
            </span>
            <span>{getUrgencyBadge(job.urgency)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'details'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Detalles del Proyecto
            </button>
            <button
              onClick={() => setActiveTab('proposals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'proposals'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Propuestas Recibidas
              {proposals.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs font-semibold">
                  {proposals.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'details' && (
              <>
                {/* Description */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Descripción</h2>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description}</p>
                </div>

                {/* Category & Skills */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Categoría y Habilidades</h2>
                  
                  <div className="mb-4">
                    <span className="text-sm text-gray-600 font-medium">Categoría:</span>
                    <div className="mt-2 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-semibold">
                      <span className="text-2xl">📋</span>
                      <span>{job.category?.name || 'Sin categoría'}</span>
                    </div>
                  </div>

                  {job.skills && job.skills.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600 font-medium">Habilidades requeridas:</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {job.skills.map((skill: any) => (
                          <span
                            key={skill.id}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Ubicación</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">{job.city?.name || 'Ciudad'}</p>
                        <p className="text-gray-600">{job.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'proposals' && (
              <div className="space-y-4">
                {proposals.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No hay propuestas aún</h3>
                    <p className="text-gray-600 mb-6">
                      Los profesionales interesados enviarán sus propuestas pronto.
                    </p>
                    <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Recibirás notificaciones cuando lleguen propuestas
                    </div>
                  </div>
                ) : (
                  proposals.map((proposal) => (
                    <div key={proposal.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {proposal.pro.firstName[0]}{proposal.pro.lastName[0]}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {proposal.pro.firstName} {proposal.pro.lastName}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {proposal.pro.rating.toFixed(1)}
                              </span>
                              <span>•</span>
                              <span>{proposal.pro.completedJobs} trabajos completados</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{formatCurrency(proposal.amount)}</p>
                          <p className="text-sm text-gray-600">{proposal.estimatedDuration} días</p>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{proposal.description}</p>

                      <div className="flex items-center gap-3">
                        <button className="flex-1 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                          Aceptar Propuesta
                        </button>
                        <button className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                          Ver Perfil
                        </button>
                        <button className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                          Mensaje
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Budget */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Presupuesto</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Presupuesto:</span>
                  <span className="font-bold text-gray-900">{formatCurrency(Number(job.budget))}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones</h3>
              
              {job.status === 'PUBLISHED' && (
                <>
                  <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg">
                    📣 Promocionar Proyecto
                  </button>
                  <button className="w-full border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                    ✏️ Editar Proyecto
                  </button>
                  <button className="w-full border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors">
                    ❌ Cancelar Proyecto
                  </button>
                </>
              )}

              {job.status === 'IN_PROGRESS' && (
                <>
                  <button className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                    ✅ Marcar como Completado
                  </button>
                  <button className="w-full border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                    💬 Contactar Profesional
                  </button>
                </>
              )}

              {job.status === 'COMPLETED' && (
                <button className="w-full bg-yellow-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors">
                  ⭐ Dejar Reseña
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Estadísticas</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Vistas</span>
                    <span className="font-bold text-gray-900">0</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Propuestas</span>
                    <span className="font-bold text-gray-900">{proposals.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${Math.min(proposals.length * 10, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
