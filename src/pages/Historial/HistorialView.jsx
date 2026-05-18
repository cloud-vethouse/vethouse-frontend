import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, FileText, Eye } from 'lucide-react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';

export default function HistorialView() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- Estados de Búsqueda y Paginación Frontend ---
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Estados del Modal de Detalles ---
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Pedimos todos los registros de golpe para poder buscar en memoria
      // (Nota: Si tu backend usa /api/consultas para el historial, déjalo así. 
      // Si creaste un endpoint específico, cámbialo a /api/historial?limit=1000)
      const res = await api.get('/api/consultas?limit=1000');
      
      const historialData = res.data?.data || res.data;
      setHistorial(Array.isArray(historialData) ? historialData : []);
      setError(null);
    } catch (err) {
      setError('Error al cargar el historial clínico. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Efecto de "Debounce" para no buscar con cada letra que se escribe, sino al pausar
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Regresamos a la pag 1 al buscar
      setSearchTerm(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '-';
    const date = new Date(fechaStr);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('es-ES', { 
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // --- LÓGICA DE FILTRADO FRONTEND ---
  const filteredHistorial = historial.filter(record => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    // Buscamos coincidencias en los campos más importantes
    const mascota = (record.nombre_mascota || '').toLowerCase();
    const vet = (record.nombre_veterinario || '').toLowerCase();
    const diagnostico = (record.diagnostico || '').toLowerCase();
    const sintomas = (record.sintomas || '').toLowerCase();
    
    return mascota.includes(searchLower) || 
           vet.includes(searchLower) || 
           diagnostico.includes(searchLower) || 
           sintomas.includes(searchLower);
  });

  // --- LÓGICA DE PAGINACIÓN FRONTEND ---
  const totalPages = Math.max(1, Math.ceil(filteredHistorial.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHistorial = filteredHistorial.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historial Clínico</h1>
          <p className="text-gray-500 text-sm mt-1">Registro médico histórico de los pacientes</p>
        </div>
        <Button onClick={() => window.print()} className="flex items-center gap-2" variant="secondary">
          <FileText className="w-4 h-4" /> Exportar / Imprimir
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por mascota, diagnóstico o síntoma..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all bg-white"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12"><Spinner /></div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 bg-red-50">{error}</div>
        ) : (
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Fecha</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Paciente</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Atendido por</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Motivo / Síntomas</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Diagnóstico</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentHistorial.length > 0 ? currentHistorial.map((record, idx) => (
                    <tr key={record._id || record.id || idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">{formatFecha(record.fecha_atencion)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{record.nombre_mascota}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.nombre_veterinario}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-[200px]" title={record.sintomas}>{record.sintomas}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium truncate max-w-[150px]" title={record.diagnostico}>{record.diagnostico}</td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => { setSelectedRecord(record); setIsViewModalOpen(true); }} 
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" 
                          title="Ver Ficha Completa"
                        >
                          <Eye className="w-5 h-5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No se encontraron registros en el historial.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* --- CONTROLES DE PAGINACIÓN FRONTEND --- */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredHistorial.length)} de {filteredHistorial.length} registros
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="text-sm text-gray-700 font-medium px-2">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: VER FICHA CLÍNICA COMPLETA */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Ficha Clínica del Paciente">
        {selectedRecord && (
          <div className="space-y-4 mt-2 overflow-y-auto max-h-[70vh] pr-2">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-primary/5 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedRecord.nombre_mascota}</h3>
                  <p className="text-xs text-gray-500">Atendido el: {formatFecha(selectedRecord.fecha_atencion)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase">Veterinario Tratante</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedRecord.nombre_veterinario}</p>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Motivo de la visita / Síntomas</p>
                  <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded border border-gray-100">{selectedRecord.sintomas}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Diagnóstico Médico</p>
                  <p className="text-sm text-gray-900 font-medium bg-blue-50/50 p-3 rounded border border-blue-100">{selectedRecord.diagnostico}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Tratamientos Aplicados
              </h4>
              {selectedRecord.tratamientos && selectedRecord.tratamientos.length > 0 ? (
                <div className="space-y-3">
                  {selectedRecord.tratamientos.map((t, i) => (
                    <div key={i} className="p-3 border border-gray-200 rounded-lg bg-white shadow-sm flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{t.tipo}</p>
                        <p className="text-xs text-gray-600 mt-1">{t.descripcion}</p>
                      </div>
                      <div className="text-right ml-4">
                        <span className={`inline-block px-2 py-1 text-[10px] font-bold rounded-full border ${
                          t.estado === 'Completado' ? 'bg-green-50 text-green-700 border-green-200' :
                          t.estado === 'Pendiente' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {t.estado || 'Completado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg border border-gray-200 border-dashed text-center">
                  El paciente no recibió tratamientos adicionales registrados en esta visita.
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end sticky bottom-0 bg-white pt-2 border-t border-gray-100">
              <Button type="button" onClick={() => setIsViewModalOpen(false)}>Cerrar Historial</Button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}