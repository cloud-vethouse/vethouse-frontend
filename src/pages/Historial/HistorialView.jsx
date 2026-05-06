import React, { useState, useEffect } from 'react';
import { 
  Search, Dog, Calendar, FileText, Stethoscope, 
  ChevronLeft, ChevronRight, Hash, AlertCircle, Phone, Mail 
} from 'lucide-react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';

export default function HistorialView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [historiales, setHistoriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistoriales = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/api/historial?page=${page}&limit=10`);
      
      const dataArray = res.data?.data || [];
      setHistoriales(Array.isArray(dataArray) ? dataArray : []);
      
      if (res.data?.pagination) {
        setTotalPages(res.data.pagination.totalPages || 1);
      }

      if (dataArray.length > 0 && !selectedHistoryId) {
        setSelectedHistoryId(dataArray[0].mascota?.id_mascota);
      }
    } catch (err) {
      console.error("Error en el fetch del historial:", err);
      setError('No se pudo conectar con el servicio de historiales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoriales();
  }, [page]);

  const filteredHistoriales = historiales.filter((h) => {
    const term = searchTerm.toLowerCase();
    const petId = String(h.mascota?.id_mascota || '');
    const petName = (h.mascota?.nombre || '').toLowerCase();
    const ownerName = (h.mascota?.dueno?.nombre || '').toLowerCase();
    return petId.includes(term) || petName.includes(term) || ownerName.includes(term);
  });

  const historialSeleccionado = historiales.find(
    (h) => h.mascota?.id_mascota === selectedHistoryId
  ) || null;


  if (loading) return <Layout><div className="flex justify-center p-20"><Spinner /></div></Layout>;

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" /> Historial Clínico
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por ID (ej: 21), Mascota o Dueño..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b font-semibold text-gray-700 text-sm">
              Pacientes (Página {page})
            </div>
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {filteredHistoriales.length > 0 ? filteredHistoriales.map((h) => (
                <button
                  key={h.mascota?.id_mascota}
                  onClick={() => setSelectedHistoryId(h.mascota?.id_mascota)}
                  className={`w-full px-4 py-3 text-left transition-colors ${h.mascota?.id_mascota === selectedHistoryId ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded text-xs font-bold text-gray-500">
                      #{h.mascota?.id_mascota}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{h.mascota?.nombre}</p>
                      <p className="text-[11px] text-gray-500 truncate">Dueño: {h.mascota?.dueno?.nombre || 'Sin datos'}</p>
                    </div>
                  </div>
                </button>
              )) : <div className="p-8 text-center text-gray-400 text-sm">No se encontraron resultados</div>}
            </div>
            
            <div className="p-3 bg-gray-50 border-t flex justify-between items-center">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 border rounded bg-white disabled:opacity-30"><ChevronLeft className="w-4 h-4"/></button>
              <span className="text-[10px] font-bold text-gray-500 uppercase">Pág {page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 border rounded bg-white disabled:opacity-30"><ChevronRight className="w-4 h-4"/></button>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-6">
          {historialSeleccionado ? (
            <>
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-6 border-b pb-4">
                  <Dog className="w-8 h-8 text-primary" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Expediente Clínico: {historialSeleccionado.mascota?.nombre}</h2>
                    <p className="text-sm text-gray-500">ID de Registro: {historialSeleccionado.mascota?.id_mascota}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Hash className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Dueño:</span>
                      <span className="font-semibold">{historialSeleccionado.mascota?.dueno?.nombre || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Teléfono:</span>
                      <span className="font-semibold">{historialSeleccionado.mascota?.dueno?.telefono || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Dog className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Especie/Raza:</span>
                      <span className="font-semibold">{historialSeleccionado.mascota?.especie} - {historialSeleccionado.mascota?.raza || 'Mestizo'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Peso:</span>
                      <span className="font-semibold">{historialSeleccionado.mascota?.peso} kg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tablas de Detalles (MS2 y MS3)[cite: 1, 2] */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Citas (MS2 - Java)[cite: 1] */}
                <div className="bg-white rounded-xl shadow-sm border p-4">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" /> Agenda de Citas
                  </h3>
                  <div className="space-y-3">
                    {historialSeleccionado.citas?.length > 0 ? historialSeleccionado.citas.map((cita, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs font-bold text-primary">{new Date(cita.fecha_hora).toLocaleDateString()}</p>
                        <p className="text-sm font-medium text-gray-800">{cita.motivo_consulta}</p>
                        <p className="text-[10px] text-gray-500">Vet: {cita.nombre_veterinario || 'Asignado'}</p>
                      </div>
                    )) : <p className="text-xs text-gray-400 italic">No hay citas registradas</p>}
                  </div>
                </div>

                {/* Consultas y Tratamientos (MS3 - Node/Mongo)[cite: 1, 4] */}
                <div className="bg-white rounded-xl shadow-sm border p-4">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-primary" /> Registro Clínico
                  </h3>
                  <div className="space-y-3">
                    {historialSeleccionado.tratamientos?.length > 0 ? historialSeleccionado.tratamientos.map((t, i) => (
                      <div key={i} className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-[10px] font-bold text-blue-600 uppercase">{t.tipo_procedimiento}</p>
                          <p className="text-[9px] text-gray-400">{t.fecha_procedimiento}</p>
                        </div>
                        <p className="text-sm text-gray-700 leading-tight">{t.descripcion}</p>
                      </div>
                    )) : <p className="text-xs text-gray-400 italic">Sin antecedentes clínicos</p>}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
              <Dog className="w-16 h-16 text-gray-200 mb-4" />
              <p className="text-gray-500">Selecciona una mascota de la lista para ver su historial clínico completo.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 