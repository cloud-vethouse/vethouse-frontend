import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';

export default function DuenosList() {
  const [duenos, setDuenos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    documento_identidad: '',
    telefono: '',
    correo: '',
    direccion: ''
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/duenos', formData);
      setIsModalOpen(false);
      setFormData({
        nombre: '', apellido: '', documento_identidad: '',
        telefono: '', correo: '', direccion: ''
      });
      fetchDuenos();
      alert('Dueño registrado exitosamente');
    } catch (err) {
      alert('Error al registrar al dueño');
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dueños</h1>
          <p className="text-gray-500 text-sm mt-1">Directorio de clientes de la clínica</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Dueño
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
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nombre</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Apellido</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Documento</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Teléfono</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Correo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {duenos.length > 0 ? (
                  duenos.map((dueno, idx) => (
                    <tr key={dueno.id_dueno || idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{dueno.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{dueno.apellido}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{dueno.documento_identidad || dueno.documento}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{dueno.telefono}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{dueno.correo}</td>
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
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Dueño">
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input required type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
              <input required type="text" name="apellido" value={formData.apellido} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Documento *</label>
              <input required type="text" name="documento_identidad" value={formData.documento_identidad} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
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
