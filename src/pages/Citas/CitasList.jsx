import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';

export default function CitasList() {
  const [citas, setCitas] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id_mascota: '',
    id_veterinario: '',
    fecha_hora: '',
    motivo_consulta: '',
    tipo_cita: '',
    notas_cliente: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [citasRes, mascotasRes, vetsRes] = await Promise.all([
        api.get('/api/citas'),
        api.get('/api/mascotas'),
        api.get('/api/veterinarios')
      ]);
      setCitas(Array.isArray(citasRes.data) ? citasRes.data : []);
      setMascotas(Array.isArray(mascotasRes.data) ? mascotasRes.data : []);
      setVeterinarios(Array.isArray(vetsRes.data) ? vetsRes.data : []);
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
  }, []);

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
      alert('Cita registrada exitosamente');
    } catch (err) {
      alert('Error al registrar la cita');
      console.error(err);
    }
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '-';
    const date = new Date(fechaStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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

  const filteredCitas = citas.filter(c => 
    c.motivo_consulta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nombre_mascota?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nombre_veterinario?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Citas</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de citas y consultas</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nueva Cita
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por mascota, veterinario o motivo..."
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
                {filteredCitas.length > 0 ? (
                  filteredCitas.map((cita, idx) => (
                    <tr key={cita.id_cita || idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">{formatFecha(cita.fecha_hora)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{cita.nombre_mascota || cita.id_mascota}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{cita.nombre_veterinario || cita.id_veterinario}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{cita.motivo_consulta}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{cita.tipo_cita}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoBadgeClass(cita.estado)}`}>
                          {cita.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No se encontraron citas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Cita">
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mascota *</label>
              <select required name="id_mascota" value={formData.id_mascota} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">
                <option value="">Seleccionar mascota...</option>
                {mascotas.map(m => (
                  <option key={m.id_mascota} value={m.id_mascota}>
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
                  <option key={v.id_veterinario} value={v.id_veterinario}>
                    {v.nombres}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y Hora *</label>
              <input required type="datetime-local" name="fecha_hora" value={formData.fecha_hora} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
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
