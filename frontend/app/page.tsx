import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-xl w-10 h-10 rounded-lg flex items-center justify-center shadow-md">
                S
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Soluciona</h1>
                <p className="text-xs text-gray-500">Remodelaciones</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link 
                href="/register" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Transforma tu hogar con los
            <span className="block mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              mejores profesionales
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Conecta con expertos verificados en remodelación y construcción. 
            Tu proyecto en las mejores manos.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/register?role=CLIENT" 
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:from-blue-700 hover:to-blue-800 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Publicar un proyecto
            </Link>
            <Link 
              href="/register?role=PRO" 
              className="w-full sm:w-auto bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Soy profesional
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-blue-600 text-white w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Profesionales verificados
              </h3>
              <p className="text-gray-600">
                Todos nuestros profesionales son verificados y cuentan con calificaciones de clientes reales.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-green-600 text-white w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Presupuestos competitivos
              </h3>
              <p className="text-gray-600">
                Recibe múltiples cotizaciones y elige la que mejor se ajuste a tu presupuesto.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-purple-600 text-white w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Pagos seguros
              </h3>
              <p className="text-gray-600">
                Sistema de pagos protegido que garantiza la seguridad de tus transacciones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            En 3 simples pasos conecta con el profesional ideal
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-xl">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Publica tu proyecto
              </h3>
              <p className="text-gray-600">
                Describe tu proyecto de remodelación con fotos y detalles
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-xl">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Recibe propuestas
              </h3>
              <p className="text-gray-600">
                Profesionales interesados te enviarán sus cotizaciones
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-xl">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Contrata y comienza
              </h3>
              <p className="text-gray-600">
                Elige al profesional ideal y comienza tu proyecto
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para comenzar tu proyecto?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a miles de clientes satisfechos que transformaron sus hogares
          </p>
          <Link 
            href="/register" 
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-3xl"
          >
            Comenzar ahora gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-xl w-10 h-10 rounded-lg flex items-center justify-center">
              S
            </div>
            <span className="text-white font-bold text-xl">Soluciona Remodelaciones</span>
          </div>
          <p className="text-gray-400 mb-4">
            © 2025 Soluciona Remodelaciones. Todos los derechos reservados.
          </p>
          <div className="flex justify-center space-x-6">
            <Link href="/about" className="hover:text-white transition-colors">
              Acerca de
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Términos
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
