'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { prosApi, Professional, SearchProsParams } from '@/lib/api/pros';
import { getAllCategories } from '@/lib/api/categories';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export default function SearchProsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState<SearchProsParams>({
    page: 1,
    limit: 12,
    sortBy: 'rating',
    sortOrder: 'desc',
  });

  // Ciudades colombianas
  const cities = [
    { id: '1', name: 'Bogotá' },
    { id: '2', name: 'Medellín' },
    { id: '3', name: 'Cali' },
    { id: '4', name: 'Barranquilla' },
    { id: '5', name: 'Cartagena' },
    { id: '6', name: 'Cúcuta' },
    { id: '7', name: 'Bucaramanga' },
    { id: '8', name: 'Pereira' },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    searchProfessionals();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const searchProfessionals = async () => {
    setLoading(true);
    try {
      const response = await prosApi.search(filters);
      setProfessionals(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (error) {
      console.error('Error searching professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof SearchProsParams, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sortBy: 'rating',
      sortOrder: 'desc',
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'No especificado';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getRatingStars = (rating?: number) => {
    const stars = [];
    const ratingValue = rating || 0;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-5 h-5 ${i <= ratingValue ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-4">Encuentra profesionales calificados</h1>
          <p className="text-xl text-blue-100 mb-6">
            Miles de expertos verificados listos para ayudarte con tu proyecto
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Buscar por nombre o habilidad..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white"
              />
              <button
                onClick={searchProfessionals}
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all"
              >
                🔍 Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Limpiar
                </button>
              </div>

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={filters.categoryId || ''}
                    onChange={(e) => handleFilterChange('categoryId', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <select
                    value={filters.cityId || ''}
                    onChange={(e) => handleFilterChange('cityId', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">Todas las ciudades</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rating mínimo
                  </label>
                  <div className="flex gap-2">
                    {[3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleFilterChange('minRating', filters.minRating === rating ? undefined : rating)}
                        className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          filters.minRating === rating
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-blue-300'
                        }`}
                      >
                        {rating}+ ⭐
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Hourly Rate */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tarifa máxima por hora
                  </label>
                  <input
                    type="number"
                    placeholder="Ej: 50000"
                    value={filters.maxHourlyRate || ''}
                    onChange={(e) => handleFilterChange('maxHourlyRate', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Availability */}
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.isAvailable || false}
                      onChange={(e) => handleFilterChange('isAvailable', e.target.checked || undefined)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Solo disponibles ahora
                    </span>
                  </label>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ordenar por
                  </label>
                  <select
                    value={filters.sortBy || 'rating'}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="rating">Rating más alto</option>
                    <option value="completedJobs">Más trabajos completados</option>
                    <option value="hourlyRate">Tarifa más baja</option>
                    <option value="createdAt">Más recientes</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header with view toggle */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {total} profesionales encontrados
                </h2>
                {filters.categoryId && (
                  <p className="text-sm text-gray-600 mt-1">
                    en {categories.find(c => c.id === filters.categoryId)?.name}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Empty State */}
            {!loading && professionals.length === 0 && (
              <div className="text-center py-20">
                <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No se encontraron profesionales
                </h3>
                <p className="text-gray-600 mb-6">
                  Intenta ajustar los filtros para obtener más resultados
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                >
                  Limpiar filtros
                </button>
              </div>
            )}

            {/* Grid View */}
            {!loading && professionals.length > 0 && viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {professionals.map((pro) => (
                  <Link
                    key={pro.id}
                    href={`/pros/${pro.id}`}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all overflow-hidden group"
                  >
                    {/* Avatar */}
                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden">
                      {pro.avatar ? (
                        <img
                          src={pro.avatar}
                          alt={`${pro.firstName} ${pro.lastName}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl font-bold text-blue-600">
                            {pro.firstName[0]}{pro.lastName[0]}
                          </span>
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      {pro.isAvailable && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          Disponible
                        </div>
                      )}
                      
                      {/* Verification Badge */}
                      {pro.verificationStatus === 'APPROVED' && (
                        <div className="absolute top-3 left-3 bg-blue-600 text-white p-1.5 rounded-full">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      {/* Name */}
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {pro.firstName} {pro.lastName}
                      </h3>

                      {/* City */}
                      {pro.city && (
                        <p className="text-sm text-gray-600 mb-3">
                          📍 {pro.city.name}
                        </p>
                      )}

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">
                          {getRatingStars(pro.rating)}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {pro.rating?.toFixed(1) || 'N/A'}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({pro.totalReviews || 0})
                        </span>
                      </div>

                      {/* Bio */}
                      {pro.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {pro.bio}
                        </p>
                      )}

                      {/* Skills */}
                      {pro.skills && pro.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {pro.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill.id}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded"
                            >
                              {skill.name}
                            </span>
                          ))}
                          {pro.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                              +{pro.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold text-gray-900">
                            {pro.completedJobs || 0}
                          </span>{' '}
                          trabajos
                        </div>
                        <div className="text-sm font-bold text-blue-600">
                          {formatCurrency(pro.hourlyRate)}/hora
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* List View */}
            {!loading && professionals.length > 0 && viewMode === 'list' && (
              <div className="space-y-4">
                {professionals.map((pro) => (
                  <Link
                    key={pro.id}
                    href={`/pros/${pro.id}`}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all p-6 flex gap-6 group"
                  >
                    {/* Avatar */}
                    <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl relative overflow-hidden">
                      {pro.avatar ? (
                        <img
                          src={pro.avatar}
                          alt={`${pro.firstName} ${pro.lastName}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl font-bold text-blue-600">
                            {pro.firstName[0]}{pro.lastName[0]}
                          </span>
                        </div>
                      )}
                      {pro.verificationStatus === 'APPROVED' && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white p-1.5 rounded-full">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {pro.firstName} {pro.lastName}
                            {pro.isAvailable && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                Disponible
                              </span>
                            )}
                          </h3>
                          {pro.city && (
                            <p className="text-sm text-gray-600">
                              📍 {pro.city.name}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(pro.hourlyRate)}
                          </div>
                          <div className="text-sm text-gray-600">por hora</div>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">
                          {getRatingStars(pro.rating)}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {pro.rating?.toFixed(1) || 'N/A'}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({pro.totalReviews || 0} reseñas)
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-600">
                          {pro.completedJobs || 0} trabajos completados
                        </span>
                      </div>

                      {/* Bio */}
                      {pro.bio && (
                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                          {pro.bio}
                        </p>
                      )}

                      {/* Skills */}
                      {pro.skills && pro.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {pro.skills.map((skill) => (
                            <span
                              key={skill.id}
                              className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full"
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && professionals.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  ← Anterior
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
