import React, { useState, useEffect } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';

export default function CitasList() {
  const [citas, setCitas] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  
  // --- PAGINACIÓN FRONTEND ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- ESTADOS DE BÚSQUEDA Y FILTROS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id_mascota: '', id_veterinario: '', fecha_hora: '',
    motivo_consulta: '', tipo_cita: '', notas_cliente: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      // Pedimos todas las citas (limit=1000)
      const [citasRes, mascotasRes, vetsRes] = await Promise.all([
        api.get('/api/citas?limit=1000').catch(() => ({ data: [] })),
        api.get('/api/mascotas').catch(() => ({ data: [] })),
        api.get('/api/veterinarios').catch(() => ({ data: [] }))
      ]);

      setMascotas(Array.isArray(mascotasRes.data) ? mascotasRes.data : []);
      setVeterinarios(Array.isArray(vetsRes.data) ? vetsRes.data : []);

      const citasData = citasRes.data?.data || citasRes.data;
      setCitas(Array.isArray(citasData) ? citasData : []);
      
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Reiniciar a la página 1 cuando se busca algo o se cambia una fecha
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      setSearchTerm(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, fechaDesde, fechaHasta]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/citas', formData);
      setIsModalOpen(false);
      setFormData({
        id_mascota: '', id_veterinario: '', fecha_hora: '',
        motivo_consulta: '', tipo_cita: '', notas_cliente: ''
      });
      fetchData();
    } catch (err) {
      alert('Error al registrar la cita');
    }
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '-';
    const date = new Date(fechaStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'Confirmada': return 'bg-blue-100 text-blue-800';
      case 'En curso': return 'bg-yellow-100 text-yellow-800';
      case 'Pendiente': return 'bg-gray-100 text-gray-800';
      case 'Completada': return 'bg-green-100 text-green-800';
      case 'Cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNombreMascota = (id, nombreBackend) => {
    if (nombreBackend) return nombreBackend;
    const m = mascotas.find(x => x.id_mascota === id || x.id === id);
    return m ? m.nombre : 'Desconocido';
  };

  const getNombreVet = (id, nombreBackend) => {
    if (nombreBackend) return nombreBackend;
    const v = veterinarios.find(x => x.id_veterinario === id || x.id === id);
    return v ? v.nombres : 'Desconocido';
  };

  // --- LÓGICA DE FILTRADO FRONTEND (Búsqueda + Fechas) ---
  const filteredCitas = citas.filter(cita => {
    // 1. Filtro por Búsqueda de Texto
    let textMatch = true;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const nombreMascota = getNombreMascota(cita.id_mascota, cita.nombre_mascota).toLowerCase();
      const nombreVet = getNombreVet(cita.id_veterinario, cita.nombre_veterinario).toLowerCase();
      const motivo = (cita.motivo_consulta || '').toLowerCase();
      
      textMatch = nombreMascota.includes(searchLower) || 
                  nombreVet.includes(searchLower) || 
                  motivo.includes(searchLower);
    }

    // 2. Filtro por Rango de Fechas
    let dateMatch = true;
    if (cita.fecha_hora) {
      // Solo nos interesa la fecha (YYYY-MM-DD), ignoramos la hora para comparar
      const citaDate = new Date(cita.fecha_hora).toISOString().split('T')[0];
      
      if (fechaDesde && citaDate < fechaDesde) {
        dateMatch = false;
      }
      if (fechaHasta && citaDate > fechaHasta) {
        dateMatch = false;
      }
    }

    return textMatch && dateMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCitas.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCitas = filteredCitas.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Citas</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de citas y consultas</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nueva Cita
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Buscador de texto */}
            <div className="flex-1 relative w-full">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 tracking-wider">Buscar</label>
              <Search className="absolute left-3 top-9 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Mascota, veterinario o motivo..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            
            {/* Filtro Desde */}
            <div className="w-full md:w-48 relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 tracking-wider">Desde</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-gray-700"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                />
              </div>
            </div>

            {/* Filtro Hasta */}
            <div className="w-full md:w-48 relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 tracking-wider">Hasta</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-gray-700"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  min={fechaDesde} // No permite seleccionar una fecha final anterior a la inicial
                />
              </div>
            </div>

            {/* Botón Limpiar */}
            {(searchInput || fechaDesde || fechaHasta) && (
              <div className="pb-1">
                <button 
                  onClick={() => { setSearchInput(''); setFechaDesde(''); setFechaHasta(''); }}
                  className="text-sm text-red-600 hover:text-red-800 font-medium px-2 py-1"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
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
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Mascota</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Veterinario</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Motivo</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Tipo</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentCitas.length > 0 ? currentCitas.map((cita, idx) => (
                    <tr key={cita.id_cita || cita.id || idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">{formatFecha(cita.fecha_hora)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <span>{getNombreMascota(cita.id_mascota, cita.nombre_mascota)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getNombreVet(cita.id_veterinario, cita.nombre_veterinario)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{cita.motivo_consulta}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{cita.tipo_cita}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoBadgeClass(cita.estado)}`}>
                          {cita.estado}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                           <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                           <p className="text-lg font-medium text-gray-900">No hay citas en este rango</p>
                           <p className="text-sm mt-1">Intenta ajustando las fechas o el término de búsqueda.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/30">
                <p className="text-sm text-gray-500">Página {currentPage} de {totalPages}</p>
                <nav className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Nueva Cita */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Cita">
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mascota *</label>
              <select required name="id_mascota" value={formData.id_mascota} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">
                <option value="">Seleccionar mascota...</option>
                {mascotas.map(m => (
                  <option key={m.id_mascota || m.id} value={m.id_mascota || m.id}>
                    {m.nombre} ({m.especie})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Veterinario *</label>
              <select required name="id_veterinario" value={formData.id_veterinario} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">
                <option value="">Seleccionar veterinario...</option>
                {veterinarios.map(v => (
                  <option key={v.id_veterinario || v.id} value={v.id_veterinario || v.id}>
                    {v.nombres}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y Hora *</label>
            <input required type="datetime-local" name="fecha_hora" value={formData.fecha_hora} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
              <input required type="text" name="motivo_consulta" value={formData.motivo_consulta} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cita *</label>
              <select required name="tipo_cita" value={formData.tipo_cita} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">
                <option value="">Seleccionar...</option>
                <option value="Consulta general">Consulta general</option>
                <option value="Urgencia">Urgencia</option>
                <option value="Preventiva">Preventiva</option>
                <option value="Seguimiento">Seguimiento</option>
                <option value="Cirugía">Cirugía</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas del Cliente</label>
            <textarea name="notas_cliente" value={formData.notas_cliente} onChange={handleInputChange} rows="3" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none" />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}