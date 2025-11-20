'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth';
import Navbar from '@/components/layout/Navbar';
import { getAllCategories, Category } from '@/lib/api/categories';

interface City {
  id: string;
  name: string;
  department: string;
}

interface ProProfile {
  id: string;
  userId: string;
  businessName: string;
  bio: string;
  yearsExperience: number;
  teamSize: number;
  isAvailable: boolean;
  responseTimeHours: number;
  serviceRadiusKm: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatarUrl: string;
  };
  skills: Array<{
    skill: {
      id: string;
      name: string;
      category: {
        id: string;
        name: string;
      };
    };
  }>;
  serviceAreas: Array<{
    city: {
      id: string;
      name: string;
    };
  }>;
}

export default function ProProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'business' | 'skills' | 'areas' | 'portfolio'>('personal');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Ciudades colombianas principales
  const cities: City[] = [
    { id: '86c2c906-d938-46cd-b364-2e1c0e3c164f', name: 'Bogotá', department: 'Cundinamarca' },
    { id: 'c49b1e6a-5003-4f6b-89d3-48e79a37e368', name: 'Medellín', department: 'Antioquia' },
    { id: '3e11a6b9-7b3c-4a15-846a-08d338a06ce0', name: 'Cali', department: 'Valle del Cauca' },
    { id: '44bab76d-66b4-458f-a346-3a3f529edd18', name: 'Barranquilla', department: 'Atlántico' },
    { id: 'fbd6d428-698e-49f9-a1ab-6d3fc5499082', name: 'Cartagena', department: 'Bolívar' },
    { id: 'c75a8a62-a28b-4a6f-8f0b-04bd041538b5', name: 'Cúcuta', department: 'Norte de Santander' },
    { id: '1e4e40aa-edfa-4281-ab97-cccc037287c0', name: 'Bucaramanga', department: 'Santander' },
    { id: '73624efa-2a8f-491d-82b7-3ba2edd01557', name: 'Pereira', department: 'Risaralda' },
    { id: '8af00f14-97b7-4ca6-9401-64ec250e75be', name: 'Santa Marta', department: 'Magdalena' },
    { id: 'c3dcf094-1251-42a8-9d42-9af2ca1ea718', name: 'Manizales', department: 'Caldas' },
  ];

  // Form data
  const [formData, setFormData] = useState({
    // Personal
    firstName: '',
    lastName: '',
    phone: '',
    avatar: null as File | null,
    avatarUrl: '',
    
    // Business
    businessName: '',
    bio: '',
    yearsExperience: 0,
    teamSize: 1,
    isAvailable: true,
    responseTimeHours: 24,
    serviceRadiusKm: 20,
    
    // Skills (IDs)
    skillIds: [] as string[],
    
    // Service Areas (City IDs)
    cityIds: [] as string[],
  });

  // Auth protection
  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login');
    } else if (_hasHydrated && user?.role !== 'PRO') {
      router.push('/client-dashboard');
    }
  }, [isAuthenticated, user, _hasHydrated, router]);

  // Load categories and profile
  useEffect(() => {
    if (_hasHydrated && isAuthenticated && user?.role === 'PRO') {
      fetchCategories();
      loadProfile();
    }
  }, [_hasHydrated, isAuthenticated, user]);

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const profile = await prosApi.getMyProfile();
      
      // Mock data for now
      const mockProfile: Partial<ProProfile> = {
        id: '123',
        userId: user?.id,
        businessName: 'Construcciones y Remodelaciones Pro',
        bio: 'Experto en construcción y remodelación con más de 10 años de experiencia. Especializado en proyectos residenciales y comerciales.',
        yearsExperience: 10,
        teamSize: 5,
        isAvailable: true,
        responseTimeHours: 2,
        serviceRadiusKm: 30,
        user: {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'pro@test.com',
          phone: '+57 300 123 4567',
          avatarUrl: '',
        },
        skills: [
          {
            skill: {
              id: '1',
              name: 'Albañilería',
              category: { id: '1', name: 'Construcción' },
            },
          },
          {
            skill: {
              id: '2',
              name: 'Pintura',
              category: { id: '1', name: 'Construcción' },
            },
          },
        ],
        serviceAreas: [
          { city: { id: '86c2c906-d938-46cd-b364-2e1c0e3c164f', name: 'Bogotá' } },
          { city: { id: 'c49b1e6a-5003-4f6b-89d3-48e79a37e368', name: 'Medellín' } },
        ],
      };

      setFormData({
        firstName: mockProfile.user?.firstName || '',
        lastName: mockProfile.user?.lastName || '',
        phone: mockProfile.user?.phone || '',
        avatar: null,
        avatarUrl: mockProfile.user?.avatarUrl || '',
        businessName: mockProfile.businessName || '',
        bio: mockProfile.bio || '',
        yearsExperience: mockProfile.yearsExperience || 0,
        teamSize: mockProfile.teamSize || 1,
        isAvailable: mockProfile.isAvailable ?? true,
        responseTimeHours: mockProfile.responseTimeHours || 24,
        serviceRadiusKm: mockProfile.serviceRadiusKm || 20,
        skillIds: mockProfile.skills?.map(s => s.skill.id) || [],
        cityIds: mockProfile.serviceAreas?.map(a => a.city.id) || [],
      });
    } catch (error) {
      console.error('Error loading profile:', error);
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, avatar: 'La imagen debe ser menor a 5MB' }));
        return;
      }
      setFormData(prev => ({ ...prev, avatar: file }));
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSkillToggle = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      skillIds: prev.skillIds.includes(skillId)
        ? prev.skillIds.filter(id => id !== skillId)
        : [...prev.skillIds, skillId],
    }));
  };

  const handleCityToggle = (cityId: string) => {
    setFormData(prev => ({
      ...prev,
      cityIds: prev.cityIds.includes(cityId)
        ? prev.cityIds.filter(id => id !== cityId)
        : [...prev.cityIds, cityId],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (activeTab === 'personal') {
      if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es requerido';
      if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es requerido';
      if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido';
    }

    if (activeTab === 'business') {
      if (!formData.bio.trim()) newErrors.bio = 'La biografía es requerida';
      if (formData.bio.length < 50) newErrors.bio = 'La biografía debe tener al menos 50 caracteres';
      if (formData.yearsExperience < 0) newErrors.yearsExperience = 'Los años de experiencia no pueden ser negativos';
      if (formData.teamSize < 1) newErrors.teamSize = 'El tamaño del equipo debe ser al menos 1';
    }

    if (activeTab === 'skills') {
      if (formData.skillIds.length === 0) newErrors.skillIds = 'Selecciona al menos una habilidad';
    }

    if (activeTab === 'areas') {
      if (formData.cityIds.length === 0) newErrors.cityIds = 'Selecciona al menos una ciudad de servicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      // TODO: Replace with actual API call
      // await prosApi.updateProfile(formData);
      
      console.log('💾 Guardando perfil:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert('✅ Perfil actualizado exitosamente');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setErrors({ submit: error.response?.data?.message || 'Error al guardar el perfil' });
    } finally {
      setSaving(false);
    }
  };

  if (!_hasHydrated || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Mi Perfil Profesional</h1>
              <p className="mt-2 text-blue-100">Completa tu perfil para recibir más propuestas</p>
            </div>
            <Link
              href="/pro-dashboard"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
            >
              ← Volver al Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'personal', label: 'Información Personal', icon: '👤' },
              { id: 'business', label: 'Información del Negocio', icon: '💼' },
              { id: 'skills', label: 'Habilidades', icon: '🛠️' },
              { id: 'areas', label: 'Áreas de Servicio', icon: '📍' },
              { id: 'portfolio', label: 'Portafolio', icon: '📸' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          
          {/* Personal Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Información Personal</h2>
                <p className="text-gray-600">Tu información básica de contacto</p>
              </div>

              {/* Avatar */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-gray-200">
                      {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Foto de perfil</h3>
                  <p className="text-sm text-gray-500 mt-1">JPG, PNG o GIF. Máximo 5MB.</p>
                  {errors.avatar && <p className="text-sm text-red-600 mt-1">{errors.avatar}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Juan"
                  />
                  {errors.firstName && <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Pérez"
                  />
                  {errors.lastName && <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+57 300 123 4567"
                  />
                  {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">El email no se puede cambiar</p>
                </div>
              </div>
            </div>
          )}

          {/* Business Tab */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Información del Negocio</h2>
                <p className="text-gray-600">Detalles sobre tus servicios profesionales</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Negocio (opcional)
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Construcciones y Remodelaciones Pro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biografía Profesional *
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={6}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.bio ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe tu experiencia, especialidades y qué te hace único como profesional..."
                  maxLength={1000}
                />
                <div className="flex justify-between mt-1">
                  {errors.bio && <p className="text-sm text-red-600">{errors.bio}</p>}
                  <p className="text-sm text-gray-500 ml-auto">{formData.bio.length}/1000</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Años de Experiencia
                  </label>
                  <input
                    type="number"
                    value={formData.yearsExperience}
                    onChange={(e) => handleInputChange('yearsExperience', parseInt(e.target.value) || 0)}
                    min="0"
                    max="50"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.yearsExperience ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.yearsExperience && <p className="text-sm text-red-600 mt-1">{errors.yearsExperience}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tamaño del Equipo
                  </label>
                  <input
                    type="number"
                    value={formData.teamSize}
                    onChange={(e) => handleInputChange('teamSize', parseInt(e.target.value) || 1)}
                    min="1"
                    max="100"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.teamSize ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.teamSize && <p className="text-sm text-red-600 mt-1">{errors.teamSize}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiempo de Respuesta (horas)
                  </label>
                  <select
                    value={formData.responseTimeHours}
                    onChange={(e) => handleInputChange('responseTimeHours', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={1}>Menos de 1 hora</option>
                    <option value={2}>2 horas</option>
                    <option value={4}>4 horas</option>
                    <option value={12}>12 horas</option>
                    <option value={24}>24 horas</option>
                    <option value={48}>48 horas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Radio de Servicio (km)
                  </label>
                  <input
                    type="number"
                    value={formData.serviceRadiusKm}
                    onChange={(e) => handleInputChange('serviceRadiusKm', parseInt(e.target.value) || 20)}
                    min="5"
                    max="200"
                    step="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <h4 className="font-semibold text-gray-900">Disponibilidad</h4>
                  <p className="text-sm text-gray-600">¿Estás disponible para nuevos proyectos?</p>
                </div>
                <button
                  onClick={() => handleInputChange('isAvailable', !formData.isAvailable)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    formData.isAvailable ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      formData.isAvailable ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Habilidades</h2>
                <p className="text-gray-600">Selecciona las habilidades que dominas</p>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Filtrar por categoría
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      selectedCategory === ''
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    Todas
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedCategory === category.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      {category.icon} {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills Grid */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Habilidades seleccionadas: {formData.skillIds.length}
                </label>
                
                {categories.length === 0 ? (
                  <div className="flex items-center justify-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
                      <p className="text-gray-600">Cargando habilidades...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {(selectedCategory ? [categories.find(c => c.id === selectedCategory)] : categories)
                      .filter(Boolean)
                      .map((category) => (
                        <div key={category!.id} className="mb-6">
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="text-2xl mr-2">{category!.icon}</span>
                            {category!.name}
                          </h3>
                          {category!.skills && category!.skills.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {category!.skills.map((skill) => (
                                <button
                                  key={skill.id}
                                  onClick={() => handleSkillToggle(skill.id)}
                                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                                    formData.skillIds.includes(skill.id)
                                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                                      : 'border-gray-200 text-gray-700 hover:border-blue-300'
                                  }`}
                                >
                                  {skill.name}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No hay habilidades disponibles en esta categoría</p>
                          )}
                        </div>
                      ))}
                  </>
                )}
                {errors.skillIds && <p className="text-sm text-red-600 mt-2">{errors.skillIds}</p>}
              </div>
            </div>
          )}

          {/* Service Areas Tab */}
          {activeTab === 'areas' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Áreas de Servicio</h2>
                <p className="text-gray-600">Ciudades donde ofreces tus servicios</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Ciudades seleccionadas: {formData.cityIds.length}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleCityToggle(city.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.cityIds.includes(city.id)
                          ? 'border-blue-600 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{city.name}</h3>
                          <p className="text-sm text-gray-600">{city.department}</p>
                        </div>
                        {formData.cityIds.includes(city.id) && (
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {errors.cityIds && <p className="text-sm text-red-600 mt-2">{errors.cityIds}</p>}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">Consejo</h4>
                    <p className="text-sm text-blue-800">
                      Selecciona todas las ciudades donde puedas ofrecer tus servicios. Los clientes de estas ciudades verán tu perfil en las búsquedas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Portafolio</h2>
                <p className="text-gray-600">Muestra tus mejores trabajos</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <div className="text-4xl mb-3">🚧</div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Próximamente</h3>
                <p className="text-sm text-yellow-800">
                  La funcionalidad de portafolio estará disponible próximamente. Podrás subir fotos de tus trabajos anteriores.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
