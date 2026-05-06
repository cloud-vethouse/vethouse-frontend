import React, { useState, useEffect } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';

export default function ConsultasList() {
  const [consultas, setConsultas] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [citas, setCitas] = useState([]);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState(null);
  
  const [formData, setFormData] = useState({
    id_cita: '', id_mascota: '', id_veterinario: '', fecha_atencion: '',
    sintomas: '', diagnostico: '', tratamiento_tipo: '', tratamiento_desc: '',
    costo_referencial: '', estado: 'Completado'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [consRes, mascotasRes, vetsRes, citasRes] = await Promise.all([
        api.get(`/api/consultas?page=${page}&limit=${limit}&search=${searchTerm}`),
        api.get('/api/mascotas'),
        api.get('/api/veterinarios'),
        api.get('/api/citas')
      ]);

      const consultasData = consRes.data?.data || consRes.data;
      setConsultas(Array.isArray(consultasData) ? consultasData : []);
      if (consRes.data?.pagination) setTotalPages(consRes.data.pagination.totalPages);

      setMascotas(Array.isArray(mascotasRes.data) ? mascotasRes.data : []);
      setVeterinarios(Array.isArray(vetsRes.data) ? vetsRes.data : []);
      setCitas(Array.isArray(citasRes.data) ? citasRes.data : []);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearchTerm(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id_cita: formData.id_cita, id_mascota: formData.id_mascota, id_veterinario: formData.id_veterinario,
        fecha_atencion: formData.fecha_atencion, sintomas: formData.sintomas, diagnostico: formData.diagnostico,
        tratamientos: formData.tratamiento_tipo ? [{ 
          tipo: formData.tratamiento_tipo, 
          descripcion: formData.tratamiento_desc,
          costo_referencial: Number(formData.costo_referencial || 0),
          estado: formData.estado
        }] : []
      };

      await api.post('/api/consultas', payload);
      setIsCreateModalOpen(false);
      setFormData({ id_cita: '', id_mascota: '', id_veterinario: '', fecha_atencion: '', sintomas: '', diagnostico: '', tratamiento_tipo: '', tratamiento_desc: '', costo_referencial: '', estado: 'Completado' });
      fetchData();
    } catch (err) {
      alert('Error al registrar la consulta');
    }
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '-';
    const date = new Date(fechaStr);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultas Clínicas</h1>
          <p className="text-gray-500 text-sm mt-1">Historial unificado de consultas y procedimientos médicos</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nueva Consulta
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Buscar por mascota o síntoma..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          </div>
        </div>

        {loading ? <div className="p-12"><Spinner /></div> : (
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Fecha</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Mascota</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Veterinario</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Diagnóstico</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {consultas.length > 0 ? consultas.map((consulta, idx) => (
                    <tr key={consulta._id || idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">{formatFecha(consulta.fecha_atencion)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{consulta.nombre_mascota}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{consulta.nombre_veterinario}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-[200px]">{consulta.diagnostico}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => { setSelectedConsulta(consulta); setIsViewModalOpen(true); }} className="p-2 text-primary hover:bg-primary/10 rounded-lg" title="Ver Detalles">
                          <Eye className="w-5 h-5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  )) : <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No se encontraron consultas.</td></tr>}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-700">Página <span className="font-medium">{page}</span> de <span className="font-medium">{totalPages}</span></p>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"><ChevronLeft className="h-5 w-5" /></button>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"><ChevronRight className="h-5 w-5" /></button>
                  </nav>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: CREAR CONSULTA */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Registrar Consulta">
        <form onSubmit={handleSubmit} className="space-y-4 mt-2 overflow-y-auto max-h-[70vh] pr-2">
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mascota *</label>
              <select required name="id_mascota" value={formData.id_mascota} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg">
                <option value="">Seleccionar...</option>
                {mascotas.map(m => <option key={m.id_mascota} value={m.id_mascota}>{m.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Veterinario *</label>
              <select required name="id_veterinario" value={formData.id_veterinario} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg">
                <option value="">Seleccionar...</option>
                {veterinarios.map(v => <option key={v.id_veterinario} value={v.id_veterinario}>{v.nombres}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cita Previa</label>
              <select name="id_cita" value={formData.id_cita} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg">
                <option value="">Opcional...</option>
                {citas.map(c => <option key={c.id_cita} value={c.id_cita}>{formatFecha(c.fecha_hora)} - {c.nombre_mascota}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
              <input required type="datetime-local" name="fecha_atencion" value={formData.fecha_atencion} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Síntomas y Diagnóstico *</label>
            <input required type="text" name="sintomas" placeholder="Describa los síntomas..." value={formData.sintomas} onChange={handleInputChange} className="w-full p-2 border mb-2 rounded-lg border-gray-300 outline-none" />
            <input required type="text" name="diagnostico" placeholder="Diagnóstico final..." value={formData.diagnostico} onChange={handleInputChange} className="w-full p-2 border rounded-lg border-gray-300 outline-none" />
          </div>

          <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
            <h4 className="text-sm font-bold text-gray-800 mb-3">Procedimiento / Tratamiento Realizado (Opcional)</h4>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <select name="tratamiento_tipo" value={formData.tratamiento_tipo} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none">
                <option value="">Seleccionar tipo...</option>
                <option value="Vacunación">Vacunación</option>
                <option value="Cirugía">Cirugía</option>
                <option value="Medicación">Medicación Gral.</option>
                <option value="Laboratorio">Laboratorio</option>
              </select>
              <input type="text" name="tratamiento_desc" value={formData.tratamiento_desc} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Descripción detallada..." />
              <div className="relative">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">S/</span>
                 <input type="number" name="costo_referencial" value={formData.costo_referencial} onChange={handleInputChange} className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Costo" />
              </div>
              <select name="estado" value={formData.estado} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none">
                <option value="Completado">Completado</option>
                <option value="Programado">Programado</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
             <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
             <Button type="submit">Guardar Consulta</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: VER DETALLES (Pop-up con todo incluido) */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Detalles Clínicos de la Consulta">
        {selectedConsulta && (
          <div className="space-y-4 mt-2 overflow-y-auto max-h-[70vh] pr-2">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Mascota</p>
                <p className="text-sm font-semibold text-gray-900">{selectedConsulta.nombre_mascota}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Veterinario</p>
                <p className="text-sm font-semibold text-gray-900">{selectedConsulta.nombre_veterinario}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Síntomas</p>
                <p className="text-sm text-gray-700">{selectedConsulta.sintomas}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Diagnóstico</p>
                <p className="text-sm text-gray-900 font-medium">{selectedConsulta.diagnostico}</p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">Procedimientos y Tratamientos</h4>
              {selectedConsulta.tratamientos && selectedConsulta.tratamientos.length > 0 ? (
                <div className="space-y-3">
                  {selectedConsulta.tratamientos.map((t, i) => (
                    <div key={i} className="flex justify-between items-center p-3 border border-blue-100 rounded-lg bg-blue-50/30 shadow-sm">
                      <div>
                        <p className="font-semibold text-sm text-blue-900">{t.tipo}</p>
                        <p className="text-xs text-gray-600 mt-1">{t.descripcion}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="font-bold text-sm text-emerald-600">
                          S/ {Number(t.costo_referencial || 0).toFixed(2)}
                        </span>
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${
                          t.estado === 'Completado' ? 'bg-green-100 text-green-700' :
                          t.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {t.estado || 'Completado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg border border-gray-200 border-dashed text-center">
                  Sin procedimientos facturables o recetas registradas.
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end sticky bottom-0 bg-white pt-2">
              <Button type="button" onClick={() => setIsViewModalOpen(false)}>Cerrar Historial</Button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}