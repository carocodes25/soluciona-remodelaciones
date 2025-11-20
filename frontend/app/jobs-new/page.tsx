'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAllCategories, Category, Skill } from '@/lib/api/categories';
import { createJob } from '@/lib/api/jobs';

export default function NewJobPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    skillIds: [] as string[],
    cityId: '',
    address: '',
    budget: '',
    urgency: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    photos: [] as File[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Ciudades colombianas principales (UUIDs reales de la BD)
  const cities = [
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

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('🔄 Cargando categorías...');
      const data = await getAllCategories();
      console.log('✅ Categorías cargadas:', data.length, 'categorías');
      console.log('📦 Primera categoría:', data[0]);
      setCategories(data);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSkillToggle = (skillId: string) => {
    const isAdding = !formData.skillIds.includes(skillId);
    console.log(isAdding ? '➕' : '➖', 'Skill ID:', skillId);
    setFormData(prev => ({
      ...prev,
      skillIds: prev.skillIds.includes(skillId)
        ? prev.skillIds.filter(id => id !== skillId)
        : [...prev.skillIds, skillId]
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (formData.photos.length + files.length > 5) {
      setErrors(prev => ({ ...prev, photos: 'Máximo 5 fotos permitidas' }));
      return;
    }
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.title.trim()) newErrors.title = 'El título es requerido';
      if (formData.title.length < 10) newErrors.title = 'El título debe tener al menos 10 caracteres';
      if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
      if (formData.description.length < 50) newErrors.description = 'La descripción debe tener al menos 50 caracteres';
    }

    if (currentStep === 2) {
      if (!formData.categoryId) newErrors.categoryId = 'Selecciona una categoría';
      if (formData.skillIds.length === 0) newErrors.skillIds = 'Selecciona al menos una habilidad';
    }

    if (currentStep === 3) {
      if (!formData.cityId) newErrors.cityId = 'Selecciona una ciudad';
      if (!formData.address.trim()) newErrors.address = 'La dirección es requerida';
      if (!formData.budget) newErrors.budget = 'El presupuesto es requerido';
      if (formData.budget && parseFloat(formData.budget) <= 0) {
        newErrors.budget = 'El presupuesto debe ser mayor a 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      // Upload photos first (if backend supports file upload)
      // For now, we'll create the job without photos
      const jobData = {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        skillIds: formData.skillIds,
        cityId: formData.cityId,
        address: formData.address,
        budget: parseFloat(formData.budget),
        urgency: formData.urgency,
      };

      console.log('📤 Enviando trabajo:', jobData);
      const newJob = await createJob(jobData);
      console.log('✅ Trabajo creado:', newJob);
      router.push(`/client-dashboard`);
    } catch (error: any) {
      console.error('❌ Error creating job:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear el trabajo';
      setErrors({ submit: Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c.id === formData.categoryId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Publicar nuevo proyecto</h1>
              <p className="mt-2 text-gray-600">Describe tu proyecto y recibe propuestas de profesionales</p>
            </div>
            <Link
              href="/client/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      s < step
                        ? 'bg-green-500 text-white'
                        : s === step
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {s < step ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      s
                    )}
                  </div>
                  <span className={`mt-2 text-sm font-medium ${s === step ? 'text-blue-600' : 'text-gray-600'}`}>
                    {s === 1 && 'Detalles'}
                    {s === 2 && 'Categoría'}
                    {s === 3 && 'Ubicación'}
                  </span>
                </div>
                {s < 3 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-all ${
                      s < step ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Step 1: Basic Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Detalles del proyecto</h2>
                <p className="text-gray-600">Cuéntanos qué necesitas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del proyecto *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ej: Remodelación de cocina integral"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={100}
                />
                <div className="flex justify-between mt-1">
                  {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                  <p className="text-sm text-gray-500 ml-auto">{formData.title.length}/100</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción detallada *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe tu proyecto con el mayor detalle posible: medidas, materiales, acabados deseados, plazos, etc."
                  rows={8}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={2000}
                />
                <div className="flex justify-between mt-1">
                  {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                  <p className="text-sm text-gray-500 ml-auto">{formData.description.length}/2000</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">Consejos para una buena descripción</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Incluye medidas específicas del área a trabajar</li>
                      <li>• Menciona si ya tienes materiales o si el profesional debe proveerlos</li>
                      <li>• Indica tu disponibilidad horaria y fechas preferidas</li>
                      <li>• Adjunta fotos del área actual (en el siguiente paso)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Category & Skills */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Categoría y habilidades</h2>
                <p className="text-gray-600">Selecciona el tipo de trabajo que necesitas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Categoría del proyecto *
                </label>
                {categories.length === 0 ? (
                  <div className="flex items-center justify-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
                      <p className="text-gray-600">Cargando categorías...</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          console.log('🎯 Categoría seleccionada:', category.name, category.id);
                          handleInputChange('categoryId', category.id);
                          handleInputChange('skillIds', []);
                        }}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.categoryId === category.id
                            ? 'border-blue-600 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl">{category.icon || '📋'}</span>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{category.name}</h3>
                            <p className="text-sm text-gray-600">{category.description}</p>
                          </div>
                          {formData.categoryId === category.id && (
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {errors.categoryId && <p className="text-sm text-red-600 mt-2">{errors.categoryId}</p>}
              </div>

              {selectedCategory && selectedCategory.skills && selectedCategory.skills.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Habilidades específicas * (selecciona todas las que apliquen)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedCategory.skills.map((skill) => (
                      <button
                        key={skill.id}
                        type="button"
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
                  {errors.skillIds && <p className="text-sm text-red-600 mt-2">{errors.skillIds}</p>}
                </div>
              )}
              
              {selectedCategory && (!selectedCategory.skills || selectedCategory.skills.length === 0) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Esta categoría no tiene habilidades disponibles. Contacta al administrador.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Location & Budget */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Ubicación y presupuesto</h2>
                <p className="text-gray-600">¿Dónde se realizará el trabajo?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad *
                  </label>
                  <select
                    value={formData.cityId}
                    onChange={(e) => handleInputChange('cityId', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.cityId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecciona una ciudad</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  {errors.cityId && <p className="text-sm text-red-600 mt-1">{errors.cityId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Dirección del proyecto"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Presupuesto disponible (COP) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    placeholder="1,000,000"
                    min="0"
                    step="10000"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.budget ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.budget && <p className="text-sm text-red-600 mt-1">{errors.budget}</p>}
                <p className="text-xs text-gray-500 mt-2">
                  💡 Este es el presupuesto máximo que tienes disponible para el proyecto
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Urgencia del proyecto *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { value: 'URGENT', label: 'Urgente', icon: '🔥', desc: 'Menos de 7 días' },
                    { value: 'HIGH', label: 'Alta', icon: '⚡', desc: '1-2 semanas' },
                    { value: 'MEDIUM', label: 'Media', icon: '📅', desc: '2-4 semanas' },
                    { value: 'LOW', label: 'Baja', icon: '🕐', desc: 'Más de 1 mes' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleInputChange('urgency', option.value)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        formData.urgency === option.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{option.icon}</div>
                      <div className="font-semibold text-gray-900">{option.label}</div>
                      <div className="text-xs text-gray-600 mt-1">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}



          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                ← Anterior
              </button>
            ) : (
              <Link
                href="/client/dashboard"
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Cancelar
              </Link>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transition-all"
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold shadow-lg hover:from-green-700 hover:to-green-800 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Publicando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Publicar proyecto
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
