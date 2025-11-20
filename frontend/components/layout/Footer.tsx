import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">S</span>
              </div>
              <div>
                <h3 className="text-white text-lg font-bold">Soluciona Remodelaciones</h3>
                <p className="text-sm text-gray-400">Tu proyecto, nuestra misión</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 max-w-md">
              Conectamos a los mejores profesionales de remodelación con clientes que buscan 
              transformar sus espacios. Calidad, confianza y resultados garantizados.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Para Clientes</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search" className="hover:text-white transition-colors">
                  Buscar Profesionales
                </Link>
              </li>
              <li>
                <Link href="/client/dashboard" className="hover:text-white transition-colors">
                  Mis Proyectos
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  ¿Cómo funciona?
                </Link>
              </li>
            </ul>
          </div>

          {/* Pro Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Para Profesionales</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pro/onboarding" className="hover:text-white transition-colors">
                  Únete como Pro
                </Link>
              </li>
              <li>
                <Link href="/pro/dashboard" className="hover:text-white transition-colors">
                  Dashboard Pro
                </Link>
              </li>
              <li>
                <Link href="/pro/benefits" className="hover:text-white transition-colors">
                  Beneficios
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Soluciona Remodelaciones. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
              Términos
            </Link>
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
              Privacidad
            </Link>
            <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
