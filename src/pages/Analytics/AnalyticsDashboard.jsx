import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Activity, AlertCircle, Database, TrendingUp, Calendar, Stethoscope, PawPrint } from 'lucide-react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';

/* ─── Paleta verde coherente ─────────────────────────── */
const GREEN = {
  900: '#14532d',
  800: '#166534',
  700: '#15803d',
  600: '#16a34a',
  500: '#22c55e',
  400: '#4ade80',
  300: '#86efac',
  200: '#bbf7d0',
  100: '#dcfce7',
  50:  '#f0fdf4',
};
const PIE_COLORS = [GREEN[800], GREEN[600], GREEN[400], GREEN[300], GREEN[200]];

/* ─── Meses ───────────────────────────────────────────── */
const MONTHS = {
  '01':'Ene','02':'Feb','03':'Mar','04':'Abr','05':'May','06':'Jun',
  '07':'Jul','08':'Ago','09':'Sep','10':'Oct','11':'Nov','12':'Dic',
};

/* ─── Tooltip personalizado ──────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 10,
      padding: '8px 14px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      fontSize: 13,
    }}>
      <p style={{ color: '#6b7280', marginBottom: 2, fontWeight: 500 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: GREEN[700], fontWeight: 600 }}>
          {p.name}: <span style={{ fontFamily: 'monospace' }}>{p.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

/* ─── KPI Card ───────────────────────────────────────── */
const KpiCard = ({ icon: Icon, label, value, delta, color = GREEN[600] }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 14,
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    position: 'relative',
    overflow: 'hidden',
  }}>
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      height: 3, background: color, borderRadius: '14px 14px 0 0',
    }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        background: GREEN[50], borderRadius: 8, padding: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={16} color={color} />
      </div>
      <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
    <div style={{ fontSize: 26, fontWeight: 700, color: '#111827', letterSpacing: '-0.03em', fontFamily: 'monospace' }}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
    {delta && (
      <div style={{ fontSize: 12, color: GREEN[700], fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
        <TrendingUp size={12} />
        {delta}
      </div>
    )}
  </div>
);

/* ─── Chart Card wrapper ─────────────────────────────── */
const ChartCard = ({ title, children, style }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 14,
    padding: '20px 22px 16px',
    ...style,
  }}>
    <p style={{
      fontSize: 12,
      fontWeight: 600,
      color: '#9ca3af',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      marginBottom: 16,
    }}>
      {title}
    </p>
    {children}
  </div>
);

/* ─── Barra horizontal custom ────────────────────────── */
const HBar = ({ label, value, max }) => {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <span style={{
        fontSize: 12, color: '#6b7280', width: 130,
        flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 7, background: GREEN[100], borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: `linear-gradient(90deg, ${GREEN[700]}, ${GREEN[500]})`,
          borderRadius: 4,
          transition: 'width 0.8s cubic-bezier(.4,0,.2,1)',
        }} />
      </div>
      <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace', minWidth: 38, textAlign: 'right' }}>
        {value.toLocaleString()}
      </span>
    </div>
  );
};

/* ─── Leyenda donut ──────────────────────────────────── */
const DonutLegend = ({ data }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, justifyContent: 'center' }}>
    {data.map((entry, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#4b5563' }}>
        <span style={{
          width: 10, height: 10, borderRadius: '50%',
          background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0,
        }} />
        <span style={{ fontWeight: 500 }}>{entry.especie}</span>
        <span style={{ color: '#9ca3af', marginLeft: 'auto', fontFamily: 'monospace' }}>
          {entry.value?.toLocaleString()}
        </span>
      </div>
    ))}
  </div>
);

/* ─── Tabla de tratamientos ──────────────────────────── */
const TreatTable = ({ data }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
        <th style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', paddingBottom: 10, textAlign: 'left' }}>Tratamiento</th>
        <th style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', paddingBottom: 10, textAlign: 'right' }}>Frecuencia</th>
      </tr>
    </thead>
    <tbody>
      {data.length === 0 && (
        <tr><td colSpan={2} style={{ padding: '16px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Sin datos disponibles</td></tr>
      )}
      {data.map((t, i) => (
        <tr key={i} style={{ borderBottom: i < data.length - 1 ? '1px solid #f9fafb' : 'none' }}>
          <td style={{ padding: '10px 0', fontSize: 13, color: '#374151', fontWeight: 500 }}>{t.tratamiento}</td>
          <td style={{ padding: '10px 0', textAlign: 'right' }}>
            <span style={{
              display: 'inline-block',
              background: GREEN[50],
              color: GREEN[800],
              fontSize: 11,
              fontWeight: 700,
              fontFamily: 'monospace',
              padding: '3px 10px',
              borderRadius: 20,
              border: `1px solid ${GREEN[200]}`,
            }}>
              {t.frecuencia?.toLocaleString()}
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

/* ══════════════════════════════════════════════════════
   CUSTOM HOOK PARA MANEJAR CONSULTAS ASÍNCRONAS A ATHENA
══════════════════════════════════════════════════════ */
const useAthenaQuery = (queryStr, expectedKeys) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let intervalId = null;
    let isMounted = true;

    const executeAndPoll = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Despachar la consulta asíncrona al API Gateway
        const execRes = await api.post('/api/athena/queries', {
          query: queryStr,
          database: 'vethouse_db'
        });

        const payload = execRes.data || execRes;
        const queryId = payload.query_execution_id;

        if (!queryId) {
          throw new Error('No se pudo obtener el identificador de ejecución (Query ID).');
        }

        // 2. Iniciar el ciclo de polling controlado cada 2 segundos
        intervalId = setInterval(async () => {
          try {
            const statusRes = await api.get(`/api/athena/queries/${queryId}/status`);
            const statusData = statusRes.data || statusRes;

            if (statusData.status === 'SUCCEEDED') {
              clearInterval(intervalId);

              // 3. Descargar los resultados estructurados
              const resultsRes = await api.get(`/api/athena/queries/${queryId}/results`);
              const resultsData = resultsRes.data || resultsRes;
              const rows = resultsData.rows || [];

              if (rows.length === 0) {
                if (isMounted) {
                  setData([]);
                  setLoading(false);
                }
                return;
              }

              // Normalizar y formatear registros según las cabeceras esperadas
              const hasHeaders = typeof rows[0][0] === 'string' && rows[0][0].toLowerCase() === expectedKeys[0].toLowerCase();
              const dataRows = hasHeaders ? rows.slice(1) : rows;

              const formatted = dataRows.map(row => {
                const obj = {};
                expectedKeys.forEach((key, idx) => {
                  const val = row[idx];
                  obj[key] = isNaN(Number(val)) ? val : Number(val);
                });
                return obj;
              });

              if (isMounted) {
                setData(formatted);
                setLoading(false);
              }
            } else if (statusData.status === 'FAILED' || statusData.status === 'CANCELLED') {
              clearInterval(intervalId);
              if (isMounted) {
                setError(`La consulta analítica falló en AWS Athena [${statusData.status}].`);
                setLoading(false);
              }
            }
          } catch (pollError) {
            clearInterval(intervalId);
            if (isMounted) {
              setError('Error al validar estado de ejecución.');
              setLoading(false);
            }
          }
        }, 2000);

      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'Error general de conexión.');
          setLoading(false);
        }
      }
    };

    executeAndPoll();

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [queryStr]);

  return { data, loading, error };
};

/* ══════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL (DASHBOARD)
══════════════════════════════════════════════════════ */
export default function AnalyticsDashboard() {
  // Queries SQL
  const sqlEspecies = `SELECT especie, COUNT(*) as value FROM mascotas_final GROUP BY especie ORDER BY value DESC`;
  const sqlEnfermedades = `SELECT motivo as enfermedad, COUNT(*) as casos FROM citas_final WHERE motivo IS NOT NULL AND motivo != '' GROUP BY motivo ORDER BY casos DESC LIMIT 5`;
  const sqlTratamientos = `SELECT tipocita as tratamiento, COUNT(*) as frecuencia FROM citas_final WHERE tipocita IS NOT NULL AND tipocita != '' GROUP BY tipocita ORDER BY frecuencia DESC LIMIT 5`;
  const sqlCitasMes = `SELECT substr(fechahora, 6, 2) as mes_num, COUNT(*) as citas FROM citas_final WHERE fechahora IS NOT NULL GROUP BY substr(fechahora, 6, 2) ORDER BY mes_num`;

  // Consumo de datos progresivo e independiente por cada recurso
  const { data: especies, loading: loadEsp, error: errEsp } = useAthenaQuery(sqlEspecies, ['especie', 'value']);
  const { data: enfermedades, loading: loadEnf, error: errEnf } = useAthenaQuery(sqlEnfermedades, ['enfermedad', 'casos']);
  const { data: tratamientos, loading: loadTrat, error: errTrat } = useAthenaQuery(sqlTratamientos, ['tratamiento', 'frecuencia']);
  const { data: citasRaw, loading: loadCitas, error: errCitas } = useAthenaQuery(sqlCitasMes, ['mes_num', 'citas']);

  // Post-procesamiento local para mapear claves numéricas a meses de texto
  const citasMes = citasRaw.map(item => ({
    mes: MONTHS[item.mes_num] || String(item.mes_num),
    citas: item.citas,
  }));

  /* ── KPIs derivados (Calculados dinámicamente) ── */
  const totalMascotas = especies.reduce((s, e) => s + (e.value || 0), 0);
  const totalCitas = citasMes.reduce((s, e) => s + (e.citas || 0), 0);
  const totalTratam = tratamientos.reduce((s, e) => s + (e.frecuencia || 0), 0);
  const maxEnf = enfermedades[0]?.casos || 1;

  return (
    <Layout>
      {/* ── Header ── */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{
            fontSize: 22, fontWeight: 700, color: '#111827',
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
          }}>
            <Database size={20} color={GREEN[700]} />
            Panel de Estadísticas Athena
          </h1>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>
            Big Data procesado en tiempo real desde Amazon S3
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: GREEN[50], border: `1px solid ${GREEN[200]}`,
          borderRadius: 8, padding: '6px 12px', fontSize: 12,
          color: GREEN[700], fontWeight: 500,
        }}>
          <Activity size={13} />
          En vivo · AWS Athena
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Fila KPIs ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <KpiCard icon={PawPrint} label="Mascotas" value={loadEsp ? '...' : totalMascotas} delta="Registradas en S3" />
          <KpiCard icon={Calendar} label="Citas totales" value={loadCitas ? '...' : totalCitas} delta="Acumuladas en el año" color={GREEN[500]} />
          <KpiCard icon={Stethoscope} label="Tratamientos" value={loadTrat ? '...' : totalTratam} delta="Top 5 tipos" color={GREEN[400]} />
          <KpiCard icon={Activity} label="Fuente" value="Athena" delta="vethouse_db · S3" color={GREEN[300]} />
        </div>

        {/* ── Fila charts principales ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

          {/* Línea de citas */}
          <ChartCard title="Volumen de citas por mes">
            {loadCitas ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 210 }}><Spinner /></div>
            ) : errCitas ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626', fontSize: 13, height: 210 }}><AlertCircle size={16} />{errCitas}</div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={citasMes} margin={{ top: 4, right: 12, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="citasGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={GREEN[600]} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={GREEN[600]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone" dataKey="citas" name="Citas"
                    stroke={GREEN[700]} strokeWidth={2.5}
                    fill="url(#citasGrad)"
                    dot={{ r: 3, fill: GREEN[700], strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: GREEN[600] }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Donut especies */}
          <ChartCard title="Especies más atendidas">
            {loadEsp ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 210 }}><Spinner /></div>
            ) : errEsp ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626', fontSize: 13, height: 210 }}><AlertCircle size={16} />{errEsp}</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 210 }}>
                <div style={{ flex: '0 0 170px', height: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={especies}
                        cx="50%" cy="50%"
                        innerRadius={52} outerRadius={76}
                        paddingAngle={3}
                        dataKey="value" nameKey="especie"
                        strokeWidth={0}
                      >
                        {especies.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ flex: 1 }}>
                  <DonutLegend data={especies} />
                </div>
              </div>
            )}
          </ChartCard>
        </div>

        {/* ── Fila inferior ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

          {/* Barras motivos */}
          <ChartCard title="Motivos de consulta más frecuentes">
            {loadEnf ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 130 }}><Spinner /></div>
            ) : errEnf ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626', fontSize: 13, height: 130 }}><AlertCircle size={16} />{errEnf}</div>
            ) : (
              <div style={{ paddingTop: 4 }}>
                {enfermedades.length === 0 && (
                  <p style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Sin datos</p>
                )}
                {enfermedades.map((e, i) => (
                  <HBar key={i} label={e.enfermedad} value={e.casos} max={maxEnf} />
                ))}
              </div>
            )}
          </ChartCard>

          {/* Tabla tratamientos */}
          <ChartCard title="Tipos de citas / tratamientos">
            {loadTrat ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 130 }}><Spinner /></div>
            ) : errTrat ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626', fontSize: 13, height: 130 }}><AlertCircle size={16} />{errTrat}</div>
            ) : (
              <TreatTable data={tratamientos} />
            )}
          </ChartCard>

        </div>
      </div>
    </Layout>
  );
}