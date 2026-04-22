import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
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
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    numero_colegiatura: '',
    especialidad: '',
    telefono: '',
    correo: '',
    horario_turno: '',
    estado: 'Activo'
  });

  const MOCK_VETERINARIOS = [
    { id_veterinario: 1, nombre: 'Ana', apellido: 'García', numero_colegiatura: 'VET-2024-001', especialidad: 'Cirugía', telefono: '555-0101', correo: 'ana.garcia@vetsystem.com', horario_turno: 'Mañana', estado: 'Activo' },
    { id_veterinario: 2, nombre: 'Carlos', apellido: 'Martínez', numero_colegiatura: 'VET-2024-002', especialidad: 'Dermatología', telefono: '555-0102', correo: 'carlos.martinez@vetsystem.com', horario_turno: 'Tarde', estado: 'Activo' },
    { id_veterinario: 3, nombre: 'Laura', apellido: 'Rodríguez', numero_colegiatura: 'VET-2024-003', especialidad: 'Medicina Interna', telefono: '555-0103', correo: 'laura.rodriguez@vetsystem.com', horario_turno: 'Mañana', estado: 'Activo' },
    { id_veterinario: 4, nombre: 'Roberto', apellido: 'Fernández', numero_colegiatura: 'VET-2023-015', especialidad: 'Oftalmología', telefono: '555-0104', correo: 'roberto.fernandez@vetsystem.com', horario_turno: 'Noche', estado: 'Inactivo' },
    { id_veterinario: 5, nombre: 'María', apellido: 'López', numero_colegiatura: 'VET-2024-005', especialidad: 'Cardiología', telefono: '555-0105', correo: 'maria.lopez@vetsystem.com', horario_turno: 'Tarde', estado: 'Activo' },
  ];

  const fetchVeterinarios = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/veterinarios').catch(() => ({ data: MOCK_VETERINARIOS }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/veterinarios', formData);
      setIsModalOpen(false);
      setFormData({
        nombre: '', apellido: '', numero_colegiatura: '',
        especialidad: '', telefono: '', correo: '',
        horario_turno: '', estado: 'Activo'
      });
      fetchVeterinarios();
      alert('Veterinario registrado exitosamente');
    } catch (err) {
      alert('Error al registrar el veterinario');
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
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
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
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nombre</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Especialidad</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Colegiatura</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Teléfono</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {veterinarios.length > 0 ? (
                  veterinarios.map((vet, idx) => (
                    <tr key={vet.id_veterinario || idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {vet.nombre} {vet.apellido}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{vet.especialidad}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{vet.numero_colegiatura}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{vet.telefono}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          vet.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {vet.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No se encontraron veterinarios.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Veterinario">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">N° Colegiatura *</label>
              <input required type="text" name="numero_colegiatura" value={formData.numero_colegiatura} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horario de Turno *</label>
              <select required name="horario_turno" value={formData.horario_turno} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">
                <option value="">Seleccionar...</option>
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
                <option value="Noche">Noche</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
              <select required name="estado" value={formData.estado} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
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
