import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';

export default function TratamientosList() {
  const [tratamientos, setTratamientos] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id_mascota: '',
    tipo_procedimiento: '',
    fecha_procedimiento: '',
    descripcion: '',
    costo_referencial: ''
  });

  const MOCK_TRATAMIENTOS = [
    { id_tratamiento: 1, id_mascota: 1, nombre_mascota: 'Luna', tipo_procedimiento: 'Vacunación', fecha_procedimiento: '2026-04-15', descripcion: 'Vacuna triple felina + rabia', costo_referencial: 120.00, estado: 'Completado' },
    { id_tratamiento: 2, id_mascota: 2, nombre_mascota: 'Max', tipo_procedimiento: 'Cirugía', fecha_procedimiento: '2026-04-10', descripcion: 'Esterilización laparoscópica', costo_referencial: 450.00, estado: 'Completado' },
    { id_tratamiento: 3, id_mascota: 3, nombre_mascota: 'Mimi', tipo_procedimiento: 'Desparasitación', fecha_procedimiento: '2026-04-20', descripcion: 'Dosis interna + externa', costo_referencial: 85.00, estado: 'Pendiente' },
    { id_tratamiento: 4, id_mascota: 1, nombre_mascota: 'Luna', tipo_procedimiento: 'Radiografía', fecha_procedimiento: '2026-04-22', descripcion: 'Estudio de cadera displasia', costo_referencial: 200.00, estado: 'Programado' },
    { id_tratamiento: 5, id_mascota: 4, nombre_mascota: 'Rocky', tipo_procedimiento: 'Limpieza dental', fecha_procedimiento: '2026-04-18', descripcion: 'Profilaxis con ultrasonido', costo_referencial: 150.00, estado: 'Completado' },
  ];

  const MOCK_MASCOTAS = [
    { id_mascota: 1, nombre: 'Luna', especie: 'Perro', raza: 'Golden Retriever' },
    { id_mascota: 2, nombre: 'Max', especie: 'Perro', raza: 'Labrador' },
    { id_mascota: 3, nombre: 'Mimi', especie: 'Gato', raza: 'Siamés' },
    { id_mascota: 4, nombre: 'Rocky', especie: 'Perro', raza: 'Bulldog' },
    { id_mascota: 5, nombre: 'Coco', especie: 'Ave', raza: 'Cacatúa' },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tratRes, mascotasRes] = await Promise.all([
        api.get('/api/tratamientos').catch(() => ({ data: MOCK_TRATAMIENTOS })),
        api.get('/api/mascotas').catch(() => ({ data: MOCK_MASCOTAS }))
      ]);
      setTratamientos(Array.isArray(tratRes.data) ? tratRes.data : []);
      setMascotas(Array.isArray(mascotasRes.data) ? mascotasRes.data : []);
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
      await api.post('/api/tratamientos', formData);
      setIsModalOpen(false);
      setFormData({
        id_mascota: '', tipo_procedimiento: '', fecha_procedimiento: '',
        descripcion: '', costo_referencial: ''
      });
      fetchData();
      alert('Tratamiento registrado exitosamente');
    } catch (err) {
      alert('Error al registrar el tratamiento');
      console.error(err);
    }
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '-';
    const rawDate = String(fechaStr).trim();
    const datePart = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
    const [year, month, day] = datePart.split('-').map(Number);

    if (!year || !month || !day) return '-';

    const date = new Date(Date.UTC(year, month - 1, day));
    if (Number.isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(date);
  };

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'Completado': return 'bg-green-100 text-green-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Programado': return 'bg-blue-100 text-blue-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTratamientos = tratamientos.filter(t => 
    t.tipo_procedimiento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.nombre_mascota?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tratamientos</h1>
          <p className="text-gray-500 text-sm mt-1">Registro de procedimientos médicos</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Tratamiento
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por mascota, tipo o descripción..."
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
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Tipo</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Descripción</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Fecha</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Costo</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTratamientos.length > 0 ? (
                  filteredTratamientos.map((trat, idx) => (
                    <tr key={trat.id_tratamiento || idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{trat.tipo_procedimiento}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{trat.descripcion}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatFecha(trat.fecha_procedimiento)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">${parseFloat(trat.costo_referencial).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoBadgeClass(trat.estado)}`}>
                          {trat.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No se encontraron tratamientos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Tratamiento">
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Procedimiento *</label>
              <select required name="tipo_procedimiento" value={formData.tipo_procedimiento} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">
                <option value="">Seleccionar...</option>
                <option value="Vacunación">Vacunación</option>
                <option value="Desparasitación">Desparasitación</option>
                <option value="Cirugía">Cirugía</option>
                <option value="Radiografía">Radiografía</option>
                <option value="Limpieza dental">Limpieza dental</option>
                <option value="Consulta">Consulta</option>
                <option value="Laboratorio">Laboratorio</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
              <input required type="date" name="fecha_procedimiento" value={formData.fecha_procedimiento} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} rows="3" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Costo Referencial</label>
            <input type="number" step="0.01" min="0" name="costo_referencial" value={formData.costo_referencial} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
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
