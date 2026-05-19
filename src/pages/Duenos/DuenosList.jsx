import React, { useState, useEffect } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';

export default function DuenosList() {
  const [duenos, setDuenos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado para saber si estamos editando (guarda el ID) o creando (null)
  const [editingId, setEditingId] = useState(null);
  
  // --- ESTADOS DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    dni: '',
    nombres: '',   
    telefono: '',
    correo: '',
  });

  const fetchDuenos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/duenos');
      setDuenos(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      setError('Error al cargar los dueños. Por favor, intente nuevamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuenos();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Abrir modal para Crear
  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({ dni: '', nombres: '', telefono: '', correo: '' });
    setIsModalOpen(true);
  };

  // Abrir modal para Editar
  const handleEdit = (dueno) => {
    setEditingId(dueno.id_dueno);
    setFormData({
      dni: dueno.dni,
      nombres: dueno.nombres,
      telefono: dueno.telefono,
      correo: dueno.correo
    });
    setIsModalOpen(true);
  };

  // Acción Eliminar
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar a este dueño? Esta acción no se puede deshacer.')) {
      try {
        await api.delete(`/api/duenos/${id}`);
        fetchDuenos();
        alert('Dueño eliminado exitosamente');
      } catch (err) {
        const errorMessage = err.response?.data?.detail || 'Error al eliminar al dueño';
        alert(errorMessage);
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Actualizar dueño existente
        await api.put(`/api/duenos/${editingId}`, formData);
        alert('Dueño actualizado exitosamente');
      } else {
        // Crear nuevo dueño
        await api.post('/api/duenos', formData);
        alert('Dueño registrado exitosamente');
      }
      
      setIsModalOpen(false);
      setFormData({ dni: '', nombres: '', telefono: '', correo: '' });
      fetchDuenos();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Error al guardar los datos del dueño';
      alert(errorMessage);
      console.error(err);
    }
  };

  // --- LÓGICA DE FILTRADO Y PAGINACIÓN ---
  const filteredDuenos = duenos.filter(d => 
    d.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.dni?.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredDuenos.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDuenos = filteredDuenos.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dueños</h1>
          <p className="text-gray-500 text-sm mt-1">Directorio de clientes de la clínica</p>
        </div>
        <Button onClick={handleOpenNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Dueño
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Barra de búsqueda */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre o DNI..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nombres</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">DNI</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Teléfono</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Correo</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentDuenos.length > 0 ? (
                    currentDuenos.map((dueno, idx) => (
                      <tr key={dueno.id_dueno || idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{dueno.nombres}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{dueno.dni}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{dueno.telefono}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{dueno.correo}</td>
                        <td className="px-6 py-4 text-sm flex justify-center gap-3">
                          <button 
                            onClick={() => handleEdit(dueno)} 
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(dueno.id_dueno)} 
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
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No se encontraron dueños.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* --- CONTROLES DE PAGINACIÓN --- */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredDuenos.length)} de {filteredDuenos.length} dueños
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

      {/* Modal que cambia su título dependiendo de la acción */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Dueño" : "Nuevo Dueño"}>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre y Apellidos *</label>
              <input required type="text" name="nombres" value={formData.nombres} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DNI *</label>
              <input required type="text" name="dni" maxLength={8} value={formData.dni} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
              <input required type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input type="email" name="correo" value={formData.correo} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingId ? "Actualizar" : "Guardar"}</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}