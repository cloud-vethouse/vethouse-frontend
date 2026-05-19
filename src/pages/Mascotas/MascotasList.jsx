import React, { useState, useEffect } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';

export default function MascotasList() {
  const [mascotas, setMascotas] = useState([]);
  const [duenos, setDuenos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado para saber si editamos o creamos
  const [editingId, setEditingId] = useState(null);
  
  // --- ESTADOS DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMascotas, setTotalMascotas] = useState(0);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    nombre: '',
    especie: '',
    raza: '',
    fecha_nacimiento: '',
    sexo: '',
    estado_reproductivo: '',
    id_dueno: '',
    peso: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mascotasRes, duenosRes] = await Promise.all([
        api.get(`/api/mascotas?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`).catch(() => ({ data: { data: [], pagination: {} } })),
        api.get('/api/duenos').catch(() => ({ data: [] }))
      ]);
      
      setMascotas(Array.isArray(mascotasRes.data?.data) ? mascotasRes.data.data : []);
      setTotalPages(mascotasRes.data?.pagination?.totalPages || 1);
      setTotalMascotas(mascotasRes.data?.pagination?.total || 0);
      
      setDuenos(Array.isArray(duenosRes.data) ? duenosRes.data : []);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({
      nombre: '', especie: '', raza: '', fecha_nacimiento: '',
      sexo: '', estado_reproductivo: '', id_dueno: '', peso: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (mascota) => {
    setEditingId(mascota.id_mascota);
    setFormData({
      nombre: mascota.nombre,
      especie: mascota.especie,
      raza: mascota.raza || '',
      // Formatear la fecha si es necesario para el input type="date"
      fecha_nacimiento: mascota.fecha_nacimiento ? mascota.fecha_nacimiento.split('T')[0] : '',
      sexo: mascota.sexo,
      estado_reproductivo: mascota.estado_reproductivo,
      id_dueno: mascota.id_dueno,
      peso: mascota.peso || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar a esta mascota? Esta acción no se puede deshacer.')) {
      try {
        await api.delete(`/api/mascotas/${id}`);
        fetchData();
        alert('Mascota eliminada exitosamente');
      } catch (err) {
        const errorMessage = err.response?.data?.detail || 'Error al eliminar la mascota';
        alert(errorMessage);
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/mascotas/${editingId}`, formData);
        alert('Mascota actualizada exitosamente');
      } else {
        await api.post('/api/mascotas', formData);
        alert('Mascota registrada exitosamente');
        setCurrentPage(1); // Solo volver a la pag 1 si es nuevo registro
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Error al procesar la solicitud';
      alert(errorMessage);
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mascotas</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona los pacientes de la clínica</p>
        </div>
        <Button onClick={handleOpenNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nueva Mascota
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre o dueño..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
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
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nombre</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Especie</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Raza</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Sexo</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Peso</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Dueño</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Est. Reproductivo</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mascotas.length > 0 ? (
                    mascotas.map((mascota, idx) => (
                      <tr key={mascota.id_mascota || idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{mascota.nombre}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{mascota.especie}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{mascota.raza || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{mascota.sexo}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{mascota.peso ? `${mascota.peso} kg` : '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{mascota.dueno_nombre || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            mascota.estado_reproductivo === 'Castrado' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {mascota.estado_reproductivo}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm flex justify-center gap-3">
                          <button 
                            onClick={() => handleEdit(mascota)} 
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(mascota.id_mascota)} 
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        No se encontraron mascotas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Mostrando página {currentPage} de {totalPages} ({totalMascotas} mascotas en total)
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Mascota" : "Nueva Mascota"}>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input required type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg) *</label>
              <input required type="number" step="0.01" name="peso" value={formData.peso} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="0.00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Especie *</label>
              <select required name="especie" value={formData.especie} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">
                <option value="">Seleccionar...</option>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Ave">Ave</option>
                <option value="Conejo">Conejo</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
              <input type="text" name="raza" value={formData.raza} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sexo *</label>
              <select required name="sexo" value={formData.sexo} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">
                <option value="">Seleccionar...</option>
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Nacimiento</label>
              <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Est. Reproductivo *</label>
              <select required name="estado_reproductivo" value={formData.estado_reproductivo} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">
                <option value="">Seleccionar...</option>
                <option value="Entero">Entero</option>
                <option value="Castrado">Castrado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dueño *</label>
              <select required name="id_dueno" value={formData.id_dueno} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">
                <option value="">Seleccionar dueño...</option>
                {duenos.map(d => (
                  <option key={d.id_dueno || d.id} value={d.id_dueno || d.id}>
                    {d.nombre || d.nombres || ''} {d.apellido || d.apellidos || ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingId ? 'Actualizar' : 'Guardar'}</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}