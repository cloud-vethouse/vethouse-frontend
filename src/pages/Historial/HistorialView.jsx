import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, FileText, Eye, Activity, Calendar, User, PawPrint } from 'lucide-react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';

export default function HistorialView() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  // --- Variables de Paginación del Servidor ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const itemsPerPage = 10;

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Pedimos datos paginados y filtrados
      const res = await api.get(`/api/historial?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`);
      const historialData = res.data?.data || [];
      
      setHistorial(Array.isArray(historialData) ? historialData : []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
      setTotalRegistros(res.data?.pagination?.total || 0);
      setError(null);
    } catch (err) {
      console.error(err); // Agregamos el log para ver el error real si falla
      setError('Error al cargar el historial clínico. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm]); // Se ejecuta al cambiar la página o la búsqueda

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      setSearchTerm(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '-';
    const date = new Date(fechaStr);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('es-ES', { 
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historial Médico General</h1>
          <p className="text-gray-500 text-sm mt-1">Visión 360° de pacientes, citas y tratamientos</p>
        </div>
        <Button onClick={() => window.print()} className="flex items-center gap-2" variant="secondary">
          <FileText className="w-4 h-4" /> Exportar / Imprimir
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 print:hidden">
            <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar paciente o dueño..."
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
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Paciente</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Especie</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Dueño</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Consultas</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Citas</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {historial.length > 0 ? historial.map((record, idx) => (
                    <tr key={record.mascota?.id_mascota || idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 flex items-center gap-2">
                        <PawPrint className="w-4 h-4 text-primary opacity-50" />
                        {record.mascota?.nombre || 'Desconocido'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.mascota?.especie || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.mascota?.dueno?.nombre || 'Sin registrar'}</td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">
                          {record.tratamientos?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className="bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full font-medium">
                          {record.citas?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => { setSelectedRecord(record); setIsViewModalOpen(true); }} 
                          className="px-3 py-1.5 text-sm bg-primary/10 text-primary font-medium hover:bg-primary hover:text-white rounded-lg transition-colors"
                        >
                          Ver Historial
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No se encontraron pacientes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Mostrando {historial.length} de {totalRegistros} pacientes
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-1 rounded-md border border-gray-300 disabled:opacity-50 hover:bg-gray-50"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
                  <span className="text-sm text-gray-700 font-medium px-2">Página {currentPage} de {totalPages}</span>
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-1 rounded-md border border-gray-300 disabled:opacity-50 hover:bg-gray-50"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL MAESTRO: VISIÓN 360 DEL PACIENTE */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Expediente Clínico 360°">
        {selectedRecord && (
          <div className="space-y-6 mt-2 overflow-y-auto max-h-[75vh] pr-2">
            
            {/* 1. PERFIL DEL PACIENTE Y DUEÑO */}
            <div className="bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {selectedRecord.mascota?.nombre}
                </h3>
                <p className="text-sm text-gray-700 mt-1">
                  {selectedRecord.mascota?.especie} {selectedRecord.mascota?.raza ? `• ${selectedRecord.mascota.raza}` : ''} • {selectedRecord.mascota?.sexo} • {selectedRecord.mascota?.peso} kg
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm min-w-[200px]">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1 flex items-center gap-1"><User className="w-3 h-3"/> Contacto del Dueño</p>
                <p className="text-sm font-semibold text-gray-900">{selectedRecord.mascota?.dueno?.nombre || 'No registrado'}</p>
                <p className="text-xs text-gray-600">{selectedRecord.mascota?.dueno?.telefono || 'Sin teléfono'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 2. HISTORIAL DE CONSULTAS Y TRATAMIENTOS */}
              <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                <h4 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                  <Activity className="w-5 h-5 text-blue-500" /> Registro Médico
                </h4>
                {selectedRecord.tratamientos && selectedRecord.tratamientos.length > 0 ? (
                  <div className="space-y-3">
                    {selectedRecord.tratamientos.map((t, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-sm text-gray-900">{t.tipo_procedimiento || 'Consulta'}</p>
                          <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">{formatFecha(t.fecha_procedimiento)}</span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{t.descripcion || 'Sin descripción'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic text-center py-4">Sin registros médicos previos.</p>
                )}
              </div>

              {/* 3. AGENDA E HISTÓRICO DE CITAS */}
              <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                <h4 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                  <Calendar className="w-5 h-5 text-green-500" /> Citas Registradas
                </h4>
                {selectedRecord.citas && selectedRecord.citas.length > 0 ? (
                  <div className="space-y-3">
                    {selectedRecord.citas.map((cita, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-sm text-gray-900">{formatFecha(cita.fecha_hora)}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            cita.estado === 'Completada' ? 'bg-green-100 text-green-800' :
                            cita.estado === 'Cancelada' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {cita.estado}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">Dr(a). {cita.nombre_veterinario || 'Por asignar'}</p>
                        <p className="text-xs text-gray-500 mt-1 truncate">Motivo: {cita.motivo_consulta}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic text-center py-4">Sin citas registradas.</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end sticky bottom-0 bg-white pt-3 border-t border-gray-100">
              <Button type="button" onClick={() => setIsViewModalOpen(false)}>Cerrar Expediente</Button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}