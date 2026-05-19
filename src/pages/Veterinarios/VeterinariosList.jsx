import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';

export default function VeterinariosList() {
  const [veterinarios, setVeterinarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado para saber si creamos o editamos
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    dni: '',
    nombres: '',
    especialidad: '',
    colegiatura: '',
    telefono: '',
    correo: '',
    estado: 'ACTIVO'
  });

  const fetchVeterinarios = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/veterinarios');
      setVeterinarios(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      setError('Error al cargar los veterinarios. Por favor, intente nuevamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVeterinarios();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({
      dni: '', nombres: '', especialidad: '',
      colegiatura: '', telefono: '', correo: '',
      estado: 'ACTIVO'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (vet) => {
    setEditingId(vet.id_veterinario || vet.id);
    setFormData({
      dni: vet.dni || '',
      nombres: vet.nombres || '',
      especialidad: vet.especialidad || '',
      colegiatura: vet.colegiatura || '',
      telefono: vet.telefono || '',
      correo: vet.correo || '',
      estado: vet.estado?.toUpperCase() === 'INACTIVO' ? 'INACTIVO' : 'ACTIVO'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar a este veterinario? Esta acción no se puede deshacer.')) {
      try {
        await api.delete(`/api/veterinarios/${id}`);
        fetchVeterinarios();
        alert('Veterinario eliminado exitosamente');
      } catch (err) {
        const errorMessage = err.response?.data?.detail || 'Error al eliminar el veterinario';
        alert(errorMessage);
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/veterinarios/${editingId}`, formData);
        alert('Veterinario actualizado exitosamente');
      } else {
        await api.post('/api/veterinarios', formData);
        alert('Veterinario registrado exitosamente');
      }
      
      setIsModalOpen(false);
      fetchVeterinarios();
    } catch (err) {
      alert('Error al guardar los datos del veterinario');
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Veterinarios</h1>
          <p className="text-gray-500 text-sm mt-1">Equipo médico de la clínica</p>
        </div>
        <Button onClick={handleOpenNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Veterinario
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12"><Spinner /></div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 bg-red-50">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">DNI</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nombres</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Especialidad</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Colegiatura</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Teléfono</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {veterinarios.length > 0 ? (
                  veterinarios.map((vet, idx) => (
                    <tr key={vet.id_veterinario || idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">{vet.dni}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{vet.nombres}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{vet.especialidad}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{vet.colegiatura}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{vet.telefono}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          vet.estado?.toUpperCase() === 'ACTIVO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {vet.estado || 'Activo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm flex justify-center gap-3">
                        <button 
                          onClick={() => handleEdit(vet)} 
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(vet.id_veterinario || vet.id)} 
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
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No se encontraron veterinarios.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Veterinario" : "Nuevo Veterinario"}>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DNI *</label>
              <input required type="text" name="dni" value={formData.dni} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombres Completos *</label>
              <input required type="text" name="nombres" value={formData.nombres} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">N° Colegiatura (CMVP-XXXX) *</label>
              <input required type="text" name="colegiatura" value={formData.colegiatura} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad *</label>
              <input required type="text" name="especialidad" value={formData.especialidad} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
              <input required type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
              <input type="email" name="correo" value={formData.correo} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
              <select required name="estado" value={formData.estado} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </div>
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