import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Wrench,
  DollarSign,
  AlertTriangle,
  Shield,
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import ClientesView from './components/ClientesView';
import ContratosView from './components/ContratosView';
import InstalacionesView from './components/InstalacionesView';
import PagosView from './components/PagosView';
import IncidenciasView from './components/IncidenciasView';
import AccionesView from './components/AccionesView';

type View = 'dashboard' | 'clientes' | 'contratos' | 'instalaciones' | 'pagos' | 'incidencias' | 'acciones';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const menuItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clientes' as View, label: 'Clientes', icon: Users },
    { id: 'contratos' as View, label: 'Contratos', icon: FileText },
    { id: 'instalaciones' as View, label: 'Instalaciones', icon: Wrench },
    { id: 'pagos' as View, label: 'Pagos', icon: DollarSign },
    { id: 'incidencias' as View, label: 'Incidencias', icon: AlertTriangle },
    { id: 'acciones' as View, label: 'Acciones Preventivas', icon: Shield },
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
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-white border-r border-gray-200 fixed left-0 top-0">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Tigo Perú</h1>
            <p className="text-sm text-gray-600 mt-1">Sistema de Gestión</p>
          </div>

          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      currentView === item.id
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="ml-64 flex-1 p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
