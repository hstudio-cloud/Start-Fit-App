import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import {
  Activity, AlertTriangle, CheckCircle2, ChevronRight, CreditCard, Dumbbell, TrendingUp, UserX, Users,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import api from '../../services/api'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl border border-white/10 bg-dark-700 p-3 shadow-xl">
      <p className="mb-1 text-xs text-white/40">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm font-semibold" style={{ color: entry.color }}>{entry.name}: {entry.value}</p>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentSessions, setRecentSessions] = useState([])
  const [students, setStudents] = useState([])
  const [studentHighlights, setStudentHighlights] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [dashboardRes, studentsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/students'),
      ])
      setStats(dashboardRes.data.stats)
      setRecentSessions(dashboardRes.data.recentSessions || [])
      setStudentHighlights(dashboardRes.data.studentHighlights || [])
      setStudents(studentsRes.data.students || [])
    } catch {
      toast.error('Erro ao carregar dashboard.')
    } finally {
      setLoading(false)
    }
  }

  const chartData = [
    { name: 'Ativos', value: stats?.activeStudents || 0, fill: '#00b4d8' },
    { name: 'Inativos', value: stats?.inactiveStudents || 0, fill: '#f59e0b' },
    { name: 'Em evolucao', value: stats?.improvedStudents || 0, fill: '#10b981' },
  ]

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Dashboard">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Painel administrativo</h2>
          <p className="mt-1 text-sm text-white/40">{format(new Date(), "dd/MM/yyyy '•' HH:mm")}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: 'Total de alunos', value: stats?.totalStudents || 0, icon: Users, color: 'brand', sub: 'Base demo ativa' },
            { label: 'Ativos na semana', value: stats?.activeStudents || 0, icon: Activity, color: 'emerald', sub: 'Rotina em dia' },
            { label: 'Mensalidades vencidas', value: stats?.overduePayments || 0, icon: AlertTriangle, color: 'red', sub: 'Pedem acao comercial' },
            { label: 'Vencimentos proximos', value: stats?.upcomingPayments || 0, icon: CreditCard, color: 'amber', sub: 'Acompanhar no app' },
            { label: 'Baixa frequencia', value: stats?.inactiveStudents || 0, icon: UserX, color: 'orange', sub: 'Mais de 14 dias' },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => (item.label.includes('Mensalidades') || item.label.includes('Vencimentos')) && navigate('/admin/payments')}
              className="stat-card cursor-pointer text-left"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                item.color === 'brand' ? 'bg-brand-500/20 text-brand-300'
                  : item.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400'
                    : item.color === 'red' ? 'bg-red-500/20 text-red-400'
                      : item.color === 'amber' ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-orange-500/20 text-orange-300'
              }`}>
                <item.icon size={18} />
              </div>
              <p className="text-3xl font-black text-white">{item.value}</p>
              <div>
                <p className="text-sm font-medium text-white/80">{item.label}</p>
                <p className="text-xs text-white/30">{item.sub}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
              <TrendingUp size={16} className="text-brand-300" /> Visao consolidada
            </h3>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-bold text-white">
                <Dumbbell size={16} className="text-brand-300" /> Treinos recentes
              </h3>
              <button type="button" onClick={() => navigate('/admin/students')} className="text-xs text-brand-300 transition-colors hover:text-brand-200">
                Ver alunos
              </button>
            </div>
            <div className="space-y-2">
              {recentSessions.map((session) => (
                <div key={session._id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/20 text-brand-300">
                    {session.student?.user?.name?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{session.student?.user?.name}</p>
                    <p className="truncate text-xs text-white/40">{session.workoutName}</p>
                  </div>
                  <div className="text-right text-xs text-white/45">
                    <p>{format(new Date(session.date), 'dd/MM HH:mm')}</p>
                    <div className="mt-1 flex items-center justify-end gap-1 text-emerald-400">
                      <CheckCircle2 size={12} />
                      <span>{session.totalDuration || 0} min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold text-white">
              <Users size={16} className="text-brand-300" /> Lista de alunos com status visual
            </h3>
            <button type="button" onClick={() => navigate('/admin/students')} className="btn-secondary px-4 py-2 text-sm">
              Gerenciar <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {studentHighlights.map((item) => (
              <div key={item.studentId} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-white/35">{item.email}</p>
                  </div>
                  <span className={
                    item.status === 'engajado' ? 'badge-success'
                      : item.status === 'baixa_frequencia' ? 'badge-warning'
                        : 'badge-danger'
                  }>
                    {item.status === 'engajado' ? 'Engajado' : item.status === 'baixa_frequencia' ? 'Baixa freq.' : 'Atencao'}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-white/55">
                  <div className="flex items-center justify-between">
                    <span>Treinos concluidos</span>
                    <strong className="text-white">{item.totalWorkouts}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pagamento</span>
                    <strong className="text-white">{item.paymentStatus}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Ultimo treino</span>
                    <strong className="text-white">{item.daysInactive === null ? 'Sem registro' : `${item.daysInactive}d`}</strong>
                  </div>
                </div>

                <button type="button" onClick={() => setSelectedStudent(students.find((student) => student._id === item.studentId) || null)} className="mt-4 w-full rounded-2xl border border-brand-400/25 px-4 py-2 text-sm font-semibold text-brand-300 transition-colors hover:bg-brand-500/10">
                  Visualizar perfil do aluno
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedStudent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="card w-full max-w-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedStudent.user?.name}</h3>
                <p className="text-sm text-white/40">{selectedStudent.user?.email}</p>
              </div>
              <button type="button" onClick={() => setSelectedStudent(null)} className="btn-secondary px-4 py-2 text-sm">Fechar</button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-white/35">Status</p>
                <p className="mt-1 font-bold text-white">{selectedStudent.user?.active ? 'Ativo' : 'Inativo'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-white/35">Treinos concluidos</p>
                <p className="mt-1 font-bold text-white">{selectedStudent.totalWorkouts || 0}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-white/35">Mensalidade</p>
                <p className="mt-1 font-bold text-white">R$ {selectedStudent.monthlyFee?.toFixed(2)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-white/35">Professor</p>
                <p className="mt-1 font-bold text-white">{selectedStudent.teacher?.name || 'Sem professor'}</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">
              <p className="font-semibold text-white">Contexto demo</p>
              <p className="mt-2">Objetivo: {selectedStudent.questionnaire?.objective || 'Nao preenchido'}</p>
              <p className="mt-1">Ultimo treino: {selectedStudent.lastWorkout ? format(new Date(selectedStudent.lastWorkout), 'dd/MM/yyyy') : 'Sem registro'}</p>
              <p className="mt-1">IMC: {selectedStudent.imc || '--'}</p>
            </div>
          </div>
        </div>
      ) : null}
    </Layout>
  )
}
