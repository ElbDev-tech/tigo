import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import {
  LayoutDashboard,
  Users,
  FileText,
  Wrench,
  DollarSign,
  AlertTriangle,
  Shield,
  LogOut,
  Moon,
  Sun,
  Package,
  UserCog,
} from 'lucide-react';
import tigoBlack from './assets/tigo_blackmode.png';
import tigoWhite from './assets/tigo_whitemode.png';
import LoginView from './components/LoginView';
import Dashboard from './components/Dashboard';
import ClientesView from './components/ClientesView';
import ContratosView from './components/ContratosView';
import InstalacionesView from './components/InstalacionesView';
import PagosView from './components/PagosView';
import IncidenciasView from './components/IncidenciasView';
import AccionesView from './components/AccionesView';
import InventarioView from './components/InventarioView';
import UsuariosView from './components/UsuariosView';

type View = 'dashboard' | 'clientes' | 'contratos' | 'instalaciones' | 'pagos' | 'incidencias' | 'acciones' | 'inventario' | 'usuarios';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  if (!session) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <LoginView />
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const menuItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clientes' as View, label: 'Clientes', icon: Users },
    { id: 'contratos' as View, label: 'Contratos', icon: FileText },
    { id: 'instalaciones' as View, label: 'Instalaciones', icon: Wrench },
    { id: 'pagos' as View, label: 'Pagos', icon: DollarSign },
    { id: 'incidencias' as View, label: 'Incidencias', icon: AlertTriangle },
    { id: 'acciones' as View, label: 'Acciones Preventivas', icon: Shield },
    { id: 'inventario' as View, label: 'Inventario', icon: Package },
    { id: 'usuarios' as View, label: 'Gestión Usuarios', icon: UserCog },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'clientes':
        return <ClientesView />;
      case 'contratos':
        return <ContratosView />;
      case 'instalaciones':
        return <InstalacionesView />;
      case 'pagos':
        return <PagosView />;
      case 'incidencias':
        return <IncidenciasView />;
      case 'acciones':
        return <AccionesView />;
      case 'inventario':
        return <InventarioView />;
      case 'usuarios':
        return <UsuariosView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex">
        <aside className="w-64 min-h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed left-0 top-0 transition-colors duration-200 z-10 overflow-y-auto">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-center">
              <img
                src={darkMode ? tigoWhite : tigoBlack}
                alt="Tigo Perú"
                className="h-12 w-auto object-contain transition-all duration-300"
              />
            </div>
          </div>

          <nav className="p-4 flex flex-col min-h-[calc(100vh-89px)] justify-between">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === item.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span>{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </nav>
        </aside>

        <main className="ml-64 flex-1 p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-200">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
