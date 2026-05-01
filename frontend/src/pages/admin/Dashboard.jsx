import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import api from '../../services/api'
import {
  Users, CreditCard, AlertTriangle, TrendingUp, Activity,
  UserX, ChevronRight, Dumbbell, CheckCircle2, Clock,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'

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

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentSessions, setRecentSessions] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [dashRes, studentsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/students'),
      ])
      setStats(dashRes.data.stats)
      setRecentSessions(dashRes.data.recentSessions || [])
      setStudents(studentsRes.data.students || [])
    } catch { toast.error('Erro ao carregar dashboard.') }
    finally { setLoading(false) }
  }

  const chartData = [
    { name: 'Ativos', value: stats?.activeStudents || 0, fill: '#0096c7' },
    { name: 'Inativos', value: stats?.inactiveStudents || 0, fill: '#f59e0b' },
    { name: 'Total', value: stats?.totalStudents || 0, fill: '#6366f1' },
  ]

  if (loading) return (
    <Layout title="Dashboard Admin">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  )

  return (
    <Layout title="Dashboard">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Greeting */}
        <div>
          <h2 className="text-2xl font-bold text-white">Painel da Academia 🏋️</h2>
          <p className="text-white/40 text-sm mt-1">
            {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total de Alunos', value: stats?.totalStudents || 0,
              icon: Users, color: 'brand',
              sub: `${stats?.activeStudents || 0} ativos esta semana`,
            },
            {
              label: 'Mensalidades Vencidas', value: stats?.overduePayments || 0,
              icon: AlertTriangle, color: 'red',
              sub: 'Requerem atenção',
              action: () => navigate('/admin/payments'),
            },
            {
              label: 'Vcto. em 7 dias', value: stats?.upcomingPayments || 0,
              icon: CreditCard, color: 'amber',
              sub: 'Próximos vencimentos',
              action: () => navigate('/admin/payments'),
            },
            {
              label: 'Alunos Parados', value: stats?.inactiveStudents || 0,
              icon: UserX, color: 'orange',
              sub: 'Sem treinar há +14 dias',
            },
          ].map((s) => (
            <div key={s.label}
              className={`stat-card cursor-pointer hover:border-white/10 transition-all ${s.action ? 'hover:scale-[1.02]' : ''}`}
              onClick={s.action}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                s.color === 'brand'  ? 'bg-brand-500/20 text-brand-300' :
                s.color === 'red'    ? 'bg-red-500/20 text-red-400' :
                s.color === 'amber'  ? 'bg-amber-500/20 text-amber-400' :
                                       'bg-orange-500/20 text-orange-400'
              }`}>
                <s.icon size={18} />
              </div>
              <p className="text-3xl font-black text-white">{s.value}</p>
              <div>
                <p className="text-white/70 text-sm font-medium">{s.label}</p>
                <p className="text-white/30 text-xs">{s.sub}</p>
              </div>
              {s.action && <ChevronRight size={14} className="text-white/20 absolute top-4 right-4" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="card">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Activity size={16} className="text-brand-300" /> Visão Geral
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Alunos" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <rect key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {[
                { label: 'Ativos (7 dias)', val: stats?.activeStudents, color: 'bg-brand-400' },
                { label: 'Inativos (+14 dias)', val: stats?.inactiveStudents, color: 'bg-amber-400' },
                { label: 'Total matriculados', val: stats?.totalStudents, color: 'bg-indigo-400' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-white/50">{item.label}</span>
                  </div>
                  <span className="text-white font-semibold">{item.val || 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Dumbbell size={16} className="text-brand-300" /> Treinos Recentes
              </h3>
              <button onClick={() => navigate('/admin/students')}
                className="text-brand-400 text-xs flex items-center gap-1 hover:text-brand-300 transition-colors">
                Ver alunos <ChevronRight size={14} />
              </button>
            </div>
            {recentSessions.length > 0 ? (
              <div className="space-y-2">
                {recentSessions.slice(0, 6).map((s) => (
                  <div key={s._id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center text-sm font-bold text-brand-300 flex-shrink-0">
                      {s.student?.user?.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{s.student?.user?.name || 'Aluno'}</p>
                      <p className="text-white/40 text-xs truncate">{s.workoutName}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white/60 text-xs">{format(new Date(s.date), 'dd/MM HH:mm')}</p>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <CheckCircle2 size={11} className="text-emerald-400" />
                        <span className="text-emerald-400 text-xs">{s.totalDuration || 0} min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-white/30">
                <Activity size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhum treino registrado ainda.</p>
              </div>
            )}
          </div>
        </div>

        {/* Students Overview */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Users size={16} className="text-brand-300" /> Alunos Cadastrados
            </h3>
            <button onClick={() => navigate('/admin/students')}
              className="btn-secondary text-xs py-2 px-3">
              Gerenciar <ChevronRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Aluno', 'Status', 'Treinos', 'Último Treino', 'Mensalidade'].map(h => (
                    <th key={h} className="text-left text-white/40 text-xs pb-3 pr-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 6).map((s) => {
                  const daysSince = s.lastWorkout
                    ? Math.floor((Date.now() - new Date(s.lastWorkout)) / 86400000)
                    : null
                  const isInactive = !s.lastWorkout || daysSince > 14

                  return (
                    <tr key={s._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-300 flex-shrink-0">
                            {s.user?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{s.user?.name}</p>
                            <p className="text-white/30 text-xs">{s.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={s.user?.active ? 'badge-success' : 'badge-danger'}>
                          {s.user?.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-white/70">{s.totalWorkouts || 0}</td>
                      <td className="py-3 pr-4">
                        {s.lastWorkout ? (
                          <span className={isInactive ? 'text-amber-400 text-xs' : 'text-white/60 text-xs'}>
                            {daysSince === 0 ? 'Hoje' : `${daysSince}d atrás`}
                          </span>
                        ) : (
                          <span className="text-white/30 text-xs">Nunca</span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className="text-white/60 text-xs">R$ {s.monthlyFee?.toFixed(2)}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
