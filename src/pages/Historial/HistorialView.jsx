import React, { useState } from 'react';
import { Search, Dog, Calendar, FileText, Stethoscope } from 'lucide-react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import { useMountEffect } from '../../hooks/useMountEffect';

export default function HistorialView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [historiales, setHistoriales] = useState([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const MOCK_HISTORIALES = [
    {
      mascota: {
        id_mascota: 1, nombre: 'Luna', especie: 'Perro', raza: 'Golden Retriever',
        sexo: 'Hembra', fecha_nacimiento: '2020-05-15', estado_reproductivo: 'Castrada',
        dueno: { nombre: 'Juan', apellido: 'Pérez', telefono: '555-0001', correo: 'juan.perez@email.com' }
      },
      citas: [
        { id_cita: 1, fecha_hora_inicio: '2026-04-21T09:00', nombre_veterinario: 'Ana García', motivo_consulta: 'Vacunación anual', tipo_cita: 'Preventiva', estado: 'Confirmada' },
        { id_cita: 4, fecha_hora_inicio: '2026-04-20T14:00', nombre_veterinario: 'Ana García', motivo_consulta: 'Revisión post-cirugía', tipo_cita: 'Seguimiento', estado: 'Completada' },
        { id_cita: 6, fecha_hora_inicio: '2026-03-15T10:00', nombre_veterinario: 'Laura Rodríguez', motivo_consulta: 'Control de peso', tipo_cita: 'Seguimiento', estado: 'Completada' },
      ],
      tratamientos: [
        { id_tratamiento: 1, tipo_procedimiento: 'Vacunación', fecha_procedimiento: '2026-04-15', descripcion: 'Vacuna triple felina + rabia', costo_referencial: 120.00, estado: 'Completado' },
        { id_tratamiento: 7, tipo_procedimiento: 'Cirugía', fecha_procedimiento: '2026-03-01', descripcion: 'Esterilización', costo_referencial: 400.00, estado: 'Completado' },
      ]
    },
    {
      mascota: {
        id_mascota: 2, nombre: 'Max', especie: 'Perro', raza: 'Labrador',
        sexo: 'Macho', fecha_nacimiento: '2019-08-22', estado_reproductivo: 'Entero',
        dueno: { nombre: 'María', apellido: 'González', telefono: '555-0002', correo: 'maria.gonzalez@email.com' }
      },
      citas: [
        { id_cita: 2, fecha_hora_inicio: '2026-04-21T10:00', nombre_veterinario: 'Carlos Martínez', motivo_consulta: 'Dolor de oreja', tipo_cita: 'Urgencia', estado: 'En curso' },
      ],
      tratamientos: [
        { id_tratamiento: 2, tipo_procedimiento: 'Cirugía', fecha_procedimiento: '2026-04-10', descripcion: 'Esterilización laparoscópica', costo_referencial: 450.00, estado: 'Completado' },
      ]
    },
    {
      mascota: {
        id_mascota: 3, nombre: 'Mimi', especie: 'Gato', raza: 'Siamés',
        sexo: 'Hembra', fecha_nacimiento: '2021-02-10', estado_reproductivo: 'Castrada',
        dueno: { nombre: 'Pedro', apellido: 'López', telefono: '555-0003', correo: 'pedro.lopez@email.com' }
      },
      citas: [
        { id_cita: 3, fecha_hora_inicio: '2026-04-22T11:00', nombre_veterinario: 'Laura Rodríguez', motivo_consulta: 'Control peso', tipo_cita: 'Seguimiento', estado: 'Pendiente' },
      ],
      tratamientos: [
        { id_tratamiento: 3, tipo_procedimiento: 'Desparasitación', fecha_procedimiento: '2026-04-20', descripcion: 'Dosis interna + externa', costo_referencial: 85.00, estado: 'Pendiente' },
      ]
    },
    {
      mascota: {
        id_mascota: 4, nombre: 'Rocky', especie: 'Perro', raza: 'Bulldog',
        sexo: 'Macho', fecha_nacimiento: '2018-11-05', estado_reproductivo: 'Entero',
        dueno: { nombre: 'Ana', apellido: 'Martínez', telefono: '555-0004', correo: 'ana.martinez@email.com' }
      },
      citas: [
        { id_cita: 5, fecha_hora_inicio: '2026-04-22T16:00', nombre_veterinario: 'Carlos Martínez', motivo_consulta: 'Cojera persistente', tipo_cita: 'Consulta general', estado: 'Cancelada' },
      ],
      tratamientos: [
        { id_tratamiento: 5, tipo_procedimiento: 'Limpieza dental', fecha_procedimiento: '2026-04-18', descripcion: 'Profilaxis con ultrasonido', costo_referencial: 150.00, estado: 'Completado' },
      ]
    },
    {
      mascota: {
        id_mascota: 5, nombre: 'Coco', especie: 'Ave', raza: 'Cacatúa',
        sexo: 'Macho', fecha_nacimiento: '2022-01-15', estado_reproductivo: 'Entero',
        dueno: { nombre: 'Luis', apellido: 'Hernández', telefono: '555-0005', correo: 'luis.hernandez@email.com' }
      },
      citas: [],
      tratamientos: []
    }
  ];

  const fetchHistoriales = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/historial').catch(() => ({ data: MOCK_HISTORIALES }));
      const data = Array.isArray(res.data) ? res.data : [];
      setHistoriales(data);
      setSelectedHistoryId((current) => current || data[0]?.mascota?.id_mascota || null);
    } catch (err) {
      setError('Error al cargar los historiales clínicos. Por favor, intente nuevamente.');
      setHistoriales([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useMountEffect(() => {
    fetchHistoriales();
  });

  const filteredHistoriales = historiales.filter((historial) => {
    const petName = historial.mascota?.nombre?.toLowerCase() || '';
    const ownerName = `${historial.mascota?.dueno?.nombre || ''} ${historial.mascota?.dueno?.apellido || ''}`.toLowerCase();
    return petName.includes(searchTerm.toLowerCase()) || ownerName.includes(searchTerm.toLowerCase());
  });

  const historialSeleccionado = filteredHistoriales.find(
    (historial) => historial.mascota?.id_mascota === selectedHistoryId
  ) || filteredHistoriales[0] || null;

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '-';
    const date = new Date(fechaStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatFechaHora = (fechaStr) => {
    if (!fechaStr) return '-';
    const date = new Date(fechaStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'Completada': case 'Completado': return 'bg-green-100 text-green-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmada': case 'Programado': return 'bg-blue-100 text-blue-800';
      case 'En curso': return 'bg-purple-100 text-purple-800';
      case 'Cancelada': case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Historial Clínico
        </h1>
        <p className="text-gray-500 text-sm mt-1">Explora los historiales clínicos registrados sin exponer identificadores internos</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Pacientes con historial</h2>
            <p className="text-sm text-gray-500 mt-1">Selecciona una mascota para ver el detalle completo de sus citas y registros clínicos.</p>
          </div>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por mascota o dueño..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64"><Spinner /></div>
      )}

      {error && !loading && (
        <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl border border-red-200">{error}</div>
      )}

      {!loading && !error && filteredHistoriales.length > 0 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">Listado de historiales</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredHistoriales.map((historial) => {
                const isSelected = historial.mascota?.id_mascota === historialSeleccionado?.mascota?.id_mascota;
                return (
                  <button
                    key={historial.mascota?.id_mascota || historial.mascota?.nombre}
                    type="button"
                    onClick={() => setSelectedHistoryId(historial.mascota?.id_mascota || null)}
                    className={`w-full px-6 py-4 text-left transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{historial.mascota?.nombre}</p>
                        <p className="text-sm text-gray-500">
                          {historial.mascota?.especie} · {historial.mascota?.raza} · Propietario: {historial.mascota?.dueno?.nombre} {historial.mascota?.dueno?.apellido}
                        </p>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>{historial.citas?.length || 0} citas</span>
                        <span>{historial.tratamientos?.length || 0} registros clínicos</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {historialSeleccionado && (
            <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
              <Dog className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-800">Datos de la Mascota</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{historialSeleccionado.mascota.nombre}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Especie</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{historialSeleccionado.mascota.especie}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Raza</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{historialSeleccionado.mascota.raza}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sexo</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{historialSeleccionado.mascota.sexo}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Nacimiento</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{formatFecha(historialSeleccionado.mascota.fecha_nacimiento)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Reproductivo</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{historialSeleccionado.mascota.estado_reproductivo}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dueño</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {historialSeleccionado.mascota.dueno?.nombre} {historialSeleccionado.mascota.dueno?.apellido}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{historialSeleccionado.mascota.dueno?.telefono}</p>
                  <p className="text-sm text-gray-500">{historialSeleccionado.mascota.dueno?.correo}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Citas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-gray-800">Citas</h2>
              </div>
              <div className="overflow-x-auto">
                {historialSeleccionado.citas && historialSeleccionado.citas.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Veterinario</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Motivo</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {historialSeleccionado.citas.map((cita, idx) => (
                        <tr key={cita.id_cita || idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-600">{formatFechaHora(cita.fecha_hora_inicio)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{cita.nombre_veterinario || cita.id_veterinario}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{cita.motivo_consulta}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoBadgeClass(cita.estado)}`}>
                              {cita.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-gray-500 text-sm">No hay citas registradas.</div>
                )}
              </div>
            </div>

            {/* Tratamientos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-gray-800">Tratamientos</h2>
              </div>
              <div className="overflow-x-auto">
                {historialSeleccionado.tratamientos && historialSeleccionado.tratamientos.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Tipo</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Descripción</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {historialSeleccionado.tratamientos.map((trat, idx) => (
                        <tr key={trat.id_tratamiento || idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-600">{formatFecha(trat.fecha_procedimiento)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{trat.tipo_procedimiento}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{trat.descripcion}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoBadgeClass(trat.estado)}`}>
                              {trat.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-gray-500 text-sm">No hay tratamientos registrados.</div>
                )}
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      )}

      {!loading && !error && filteredHistoriales.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-gray-200 shadow-sm">
          <Search className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-500">No se encontraron historiales para la búsqueda actual</h3>
        </div>
      )}
    </Layout>
  );
}
