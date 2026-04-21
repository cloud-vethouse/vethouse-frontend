import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
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
  const [formData, setFormData] = useState({
    nombre: '',
    especie: '',
    raza: '',
    fecha_nacimiento: '',
    sexo: '',
    estado_reproductivo: '',
    id_dueno: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mascotasRes, duenosRes] = await Promise.all([
        api.get('/api/mascotas').catch(() => ({ data: [] })),
        api.get('/api/duenos').catch(() => ({ data: [] }))
      ]);
      setMascotas(Array.isArray(mascotasRes.data) ? mascotasRes.data : []);
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
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/mascotas', formData);
      setIsModalOpen(false);
      setFormData({
        nombre: '', especie: '', raza: '', fecha_nacimiento: '',
        sexo: '', estado_reproductivo: '', id_dueno: ''
      });
      fetchData();
      alert('Mascota registrada exitosamente');
    } catch (err) {
      alert('Error al registrar la mascota');
      console.error(err);
    }
  };

  const filteredMascotas = mascotas.filter(m => 
    m.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mascotas</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona los pacientes de la clínica</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
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
              placeholder="Buscar por nombre..."
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
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nombre</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Especie</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Raza</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Sexo</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Dueño</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Est. Reproductivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMascotas.length > 0 ? (
                  filteredMascotas.map((mascota, idx) => (
                    <tr key={mascota.id_mascota || idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{mascota.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{mascota.especie}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{mascota.raza}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{mascota.sexo}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{mascota.dueno_nombre || mascota.id_dueno}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          mascota.estado_reproductivo === 'Castrado' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {mascota.estado_reproductivo}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No se encontraron mascotas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Mascota">
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input required type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
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
                  <option key={d.id_dueno} value={d.id_dueno}>
                    {d.nombre} {d.apellido}
                  </option>
                ))}
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
