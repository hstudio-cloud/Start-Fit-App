import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api from '../../services/api'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Area, AreaChart,
} from 'recharts'
import { TrendingUp, Scale, Dumbbell, Flame, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div className="bg-dark-700 border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-white/50 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
  return null
}

export default function Evolution() {
  const [progress, setProgress] = useState([])
  const [sessions, setSessions] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ weight: '', height: '', notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [progRes, sessRes] = await Promise.all([
        api.get('/student/progress'),
        api.get('/student/sessions'),
      ])
      setProgress(progRes.data.progress || [])
      setSessions(sessRes.data.sessions || [])
    } catch { toast.error('Erro ao carregar dados.') }
    finally { setLoading(false) }
  }

  const saveProgress = async () => {
    if (!form.weight) { toast.error('Informe o peso.'); return }
    setSaving(true)
    try {
      await api.post('/student/progress', { weight: Number(form.weight), height: form.height ? Number(form.height) : undefined, notes: form.notes })
      toast.success('Evolução registrada!')
      setShowForm(false)
      setForm({ weight: '', height: '', notes: '' })
      fetchData()
    } catch { toast.error('Erro ao salvar.') }
    finally { setSaving(false) }
  }

  // Chart data
  const weightData = progress.map(p => ({
    date: format(new Date(p.date), 'dd/MM', { locale: ptBR }),
    Peso: p.weight,
    IMC: p.imc,
  }))

  // Frequency: count sessions per week
  const last8Weeks = Array.from({ length: 8 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i * 7)
    return { week: `S${8 - i}`, count: 0, label: format(d, 'dd/MM') }
  }).reverse()

  sessions.filter(s => s.completed).forEach(s => {
    const sessionDate = new Date(s.date)
    const weeksAgo = Math.floor((Date.now() - sessionDate) / (7 * 24 * 60 * 60 * 1000))
    if (weeksAgo < 8) {
      const idx = 7 - weeksAgo
      if (last8Weeks[idx]) last8Weeks[idx].count++
    }
  })

  const latestProgress = progress[progress.length - 1]
  const firstProgress = progress[0]
  const weightDiff = latestProgress && firstProgress ? (latestProgress.weight - firstProgress.weight).toFixed(1) : null
  const totalSessions = sessions.filter(s => s.completed).length

  if (loading) return (
    <Layout title="Minha Evolução">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  )

  return (
    <Layout title="Minha Evolução">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Minha Evolução</h2>
            <p className="text-white/40 text-sm">Acompanhe seu progresso ao longo do tempo</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm py-2 px-4">
            <Plus size={16} /> Registrar Medidas
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Peso Atual', value: latestProgress?.weight ? `${latestProgress.weight}kg` : '--', icon: Scale, color: 'brand' },
            { label: 'IMC Atual', value: latestProgress?.imc || '--', icon: TrendingUp, color: 'emerald' },
            { label: 'Variação Peso', value: weightDiff ? `${weightDiff > 0 ? '+' : ''}${weightDiff}kg` : '--', icon: TrendingUp, color: weightDiff < 0 ? 'emerald' : 'amber' },
            { label: 'Total Treinos', value: totalSessions, icon: Dumbbell, color: 'purple' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                s.color === 'brand' ? 'bg-brand-500/20 text-brand-300' :
                s.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                s.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                'bg-purple-500/20 text-purple-400'
              }`}><s.icon size={16} /></div>
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Weight Chart */}
        {weightData.length > 1 ? (
          <div className="card">
            <h3 className="font-bold text-white mb-5 flex items-center gap-2">
              <Scale size={18} className="text-brand-300" /> Evolução de Peso e IMC
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={weightData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0096c7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0096c7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorIMC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }} />
                <Area type="monotone" dataKey="Peso" stroke="#0096c7" strokeWidth={2.5} fill="url(#colorPeso)" dot={{ fill: '#0096c7', r: 4 }} activeDot={{ r: 6 }} />
                <Area type="monotone" dataKey="IMC" stroke="#34d399" strokeWidth={2.5} fill="url(#colorIMC)" dot={{ fill: '#34d399', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="card text-center py-10">
            <Scale size={36} className="mx-auto mb-3 text-white/20" />
            <p className="text-white/40">Registre pelo menos 2 medições para ver o gráfico de evolução.</p>
          </div>
        )}

        {/* Frequency Chart */}
        <div className="card">
          <h3 className="font-bold text-white mb-5 flex items-center gap-2">
            <Flame size={18} className="text-brand-300" /> Frequência por Semana
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={last8Weeks} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Treinos" fill="#0077b6" radius={[6, 6, 0, 0]}
                style={{ filter: 'drop-shadow(0 0 6px rgba(0,119,182,0.5))' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* History Table */}
        {progress.length > 0 && (
          <div className="card">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-brand-300" /> Histórico de Medições
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Data','Peso','Altura','IMC','Obs.'].map(h => (
                      <th key={h} className="text-left text-white/40 text-xs pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...progress].reverse().slice(0, 10).map((p, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="py-3 pr-4 text-white/70">{format(new Date(p.date), 'dd/MM/yy')}</td>
                      <td className="py-3 pr-4 text-white font-medium">{p.weight}kg</td>
                      <td className="py-3 pr-4 text-white/60">{p.height}cm</td>
                      <td className="py-3 pr-4">
                        <span className={`font-semibold ${
                          p.imc < 18.5 ? 'text-blue-400' : p.imc < 25 ? 'text-emerald-400' : p.imc < 30 ? 'text-amber-400' : 'text-red-400'
                        }`}>{p.imc}</span>
                      </td>
                      <td className="py-3 text-white/40 text-xs max-w-xs truncate">{p.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Progress Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-sm animate-slide-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white">Registrar Medidas</h3>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Peso (kg) *</label>
                  <input className="input" type="number" placeholder="75.5"
                    value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Altura (cm)</label>
                  <input className="input" type="number" placeholder="175"
                    value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Observações</label>
                <textarea className="input resize-none" rows={2}
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Como está se sentindo?" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
                <button onClick={saveProgress} disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
