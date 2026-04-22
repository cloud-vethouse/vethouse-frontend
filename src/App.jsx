import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MascotasList from './pages/Mascotas/MascotasList';
import DuenosList from './pages/Duenos/DuenosList';
import AnalyticsDashboard from './pages/Analytics/AnalyticsDashboard';
import VeterinariosList from './pages/Veterinarios/VeterinariosList';
import CitasList from './pages/Citas/CitasList';
import Layout from './components/Layout';

// Componentes Placeholder para las rutas no implementadas aún
const PlaceholderPage = ({ title }) => (
  <Layout>
    <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-200 shadow-sm">
      <h2 className="text-xl text-gray-500 font-medium">Página en construcción: {title}</h2>
    </div>
  </Layout>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/analytics" replace />} />
        
        {/* Rutas Implementadas */}
        <Route path="/mascotas" element={<MascotasList />} />
        <Route path="/duenos" element={<DuenosList />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        
        {/* Rutas Placeholder (Requeridas por el Layout) */}
        <Route path="/citas" element={<CitasList />} />
        <Route path="/tratamientos" element={<PlaceholderPage title="Tratamientos" />} />
        <Route path="/veterinarios" element={<VeterinariosList />} />
        <Route path="/historial" element={<PlaceholderPage title="Historial Clínico" />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/analytics" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
