'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth';
import { jobsApi, Job } from '@/lib/api/jobs';
import Navbar from '@/components/layout/Navbar';

export default function SubmitProposalPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    amount: '',
    estimatedDays: '',
    coverLetter: '',
  });

  // Auth protection - Only PROs can submit proposals
  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login');
    } else if (_hasHydrated && user?.role !== 'PRO') {
      router.push('/client-dashboard');
    }
  }, [isAuthenticated, user, _hasHydrated, router]);

  // Load job details
  useEffect(() => {
    if (_hasHydrated && isAuthenticated && user?.role === 'PRO') {
      loadJobDetails();
    }
  }, [_hasHydrated, isAuthenticated, user, jobId]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);
      const data = await jobsApi.findOne(jobId);
      setJob(data);
    } catch (error) {
      console.error('Error loading job:', error);
      alert('Error al cargar el trabajo. Redirigiendo...');
      router.push('/pro-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount) {
      newErrors.amount = 'El monto es requerido';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    } else if (job && job.budget && parseFloat(formData.amount) > job.budget) {
      newErrors.amount = `El monto no puede exceder ${formatCurrency(job.budget)}`;
    }

    if (!formData.estimatedDays) {
      newErrors.estimatedDays = 'El tiempo estimado es requerido';
    } else if (parseInt(formData.estimatedDays) <= 0) {
      newErrors.estimatedDays = 'El tiempo debe ser mayor a 0';
    }

    if (!formData.coverLetter.trim()) {
      newErrors.coverLetter = 'La carta de presentación es requerida';
    } else if (formData.coverLetter.length < 100) {
      newErrors.coverLetter = 'La carta debe tener al menos 100 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // TODO: Replace with actual API call
      // await proposalsApi.create({
      //   jobId,
      //   amount: parseFloat(formData.amount),
      //   estimatedDuration: parseInt(formData.estimatedDays),
      //   description: formData.coverLetter,
      // });

      console.log('📤 Enviando propuesta:', {
        jobId,
        amount: parseFloat(formData.amount),
        estimatedDays: parseInt(formData.estimatedDays),
        coverLetter: formData.coverLetter,
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      alert('✅ Propuesta enviada exitosamente');
      router.push('/pro-dashboard');
    } catch (error: any) {
      console.error('Error submitting proposal:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Error al enviar la propuesta' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!_hasHydrated || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Cargando trabajo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Enviar Propuesta</h1>
              <p className="mt-2 text-blue-100">Presenta tu mejor oferta para este trabajo</p>
            </div>
            <Link
              href={`/jobs/${jobId}`}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
            >
              ← Volver
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Job Summary - Left Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Resumen del Trabajo</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{job.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3">{job.description}</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Presupuesto:</span>
                    <span className="font-semibold text-gray-900">
                      {job.budget ? formatCurrency(job.budget) : 'A convenir'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Cliente:</span>
                    <span className="font-semibold text-gray-900">
                      {job.client.firstName} {job.client.lastName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Ubicación:</span>
                    <span className="font-semibold text-gray-900">{job.city.name}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Propuestas:</span>
                    <span className="font-semibold text-gray-900">{job.proposalsCount || 0}</span>
                  </div>
                </div>

                {/* Skills */}
                {job.skills && job.skills.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Habilidades requeridas:</p>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <span
                          key={skill.id}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Proposal Form - Right Side */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tu Propuesta</h2>

              {/* Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto de tu propuesta (COP) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="1,500,000"
                    min="0"
                    step="10000"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount}</p>}
                {job.budget && (
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Presupuesto del cliente: {formatCurrency(job.budget)}
                  </p>
                )}
              </div>

              {/* Estimated Days */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo estimado (días) *
                </label>
                <input
                  type="number"
                  value={formData.estimatedDays}
                  onChange={(e) => handleInputChange('estimatedDays', e.target.value)}
                  placeholder="7"
                  min="1"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.estimatedDays ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.estimatedDays && <p className="text-sm text-red-600 mt-1">{errors.estimatedDays}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  📅 ¿Cuántos días necesitas para completar este trabajo?
                </p>
              </div>

              {/* Cover Letter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carta de presentación *
                </label>
                <textarea
                  value={formData.coverLetter}
                  onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                  placeholder="Describe tu experiencia relevante, enfoque para este proyecto y por qué eres el mejor candidato..."
                  rows={8}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.coverLetter ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={2000}
                />
                <div className="flex justify-between mt-1">
                  {errors.coverLetter && <p className="text-sm text-red-600">{errors.coverLetter}</p>}
                  <p className="text-sm text-gray-500 ml-auto">{formData.coverLetter.length}/2000</p>
                </div>
              </div>

              {/* Tips */}
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">Consejos para una propuesta exitosa</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Destaca tu experiencia relevante en proyectos similares</li>
                      <li>• Explica tu enfoque y metodología de trabajo</li>
                      <li>• Sé específico sobre lo que incluye tu propuesta</li>
                      <li>• Menciona materiales o herramientas que usarás</li>
                      <li>• Sé realista con los tiempos y costos</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Preview Summary */}
              <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Vista previa de tu propuesta</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monto:</span>
                    <span className="font-semibold text-gray-900">
                      {formData.amount ? formatCurrency(parseFloat(formData.amount)) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tiempo estimado:</span>
                    <span className="font-semibold text-gray-900">
                      {formData.estimatedDays ? `${formData.estimatedDays} días` : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Carta:</span>
                    <span className="font-semibold text-gray-900">
                      {formData.coverLetter.length} caracteres
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{errors.submit}</p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <Link
                  href={`/jobs/${jobId}`}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all text-center"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    '📤 Enviar Propuesta'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
