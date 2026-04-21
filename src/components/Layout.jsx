import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PawPrint, Users, Dog, Activity, Calendar, FileText, Menu } from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const navItems = [
    { name: 'Dashboard', path: '/analytics', icon: Activity },
    { name: 'Mascotas', path: '/mascotas', icon: Dog },
    { name: 'Dueños', path: '/duenos', icon: Users },
    { name: 'Citas', path: '/citas', icon: Calendar },
    { name: 'Tratamientos', path: '/tratamientos', icon: FileText },
    { name: 'Veterinarios', path: '/veterinarios', icon: Users },
    { name: 'Historial Clínico', path: '/historial', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out bg-white border-r border-gray-200 flex flex-col`}>
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <PawPrint className="w-8 h-8 text-primary" />
          {isSidebarOpen && <span className="ml-3 text-xl font-bold text-gray-800">VetSystem</span>}
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {isSidebarOpen && <span className="ml-3">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              A
            </div>
          </div>
        </header>

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
