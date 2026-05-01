import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import api from '../../services/api'
import {
  Dumbbell, TrendingUp, CreditCard, Droplets, Apple,
  Bell, ChevronRight, Flame, Clock, Target, Award,
  AlertTriangle, CheckCircle2, Play, Scale,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const IMCGauge = ({ imc, category }) => {
  if (!imc) return null
  const getColor = () => {
    if (imc < 18.5) return '#60a5fa'
    if (imc < 25) return '#34d399'
    if (imc < 30) return '#fbbf24'
    if (imc < 35) return '#fb923c'
    return '#f87171'
  }
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 60 60" className="w-full h-full">
          <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <circle cx="30" cy="30" r="24" fill="none" stroke={getColor()} strokeWidth="6"
            strokeDasharray={`${Math.min((imc / 40) * 150, 150)} 150`}
            strokeLinecap="round" transform="rotate(-90 30 30)" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{imc}</span>
      </div>
      <div>
        <p className="text-white font-semibold text-sm">IMC: {imc}</p>
        <p className="text-xs" style={{ color: getColor() }}>{category}</p>
      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const { user, student } = useAuth()
  const navigate = useNavigate()
  const [todayWorkout, setTodayWorkout] = useState(null)
  const [payments, setPayments] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (student && !student.questionnaireCompleted) {
      navigate('/student/questionnaire')
      return
    }
    fetchData()
  }, [student])

  const fetchData = async () => {
    try {
      const [workoutRes, paymentsRes, sessionsRes] = await Promise.all([
        api.get('/student/workout/today'),
        api.get('/student/payments'),
        api.get('/student/sessions'),
      ])
      setTodayWorkout(workoutRes.data.workout)
      setPayments(paymentsRes.data.payments || [])
      setSessions(sessionsRes.data.sessions || [])
    } catch (err) {
      toast.error('Erro ao carregar dados.')
    } finally {
      setLoading(false)
    }
  }

  const latestPayment = payments[0]
  const paymentStatus = latestPayment?.status
  const weekSessions = sessions.filter(s => {
    const d = new Date(s.date)
    const now = new Date()
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
    return d >= weekAgo
  })

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const today = new Date().getDay()

  const reminders = [
    { icon: Droplets, text: 'Beba 2L de água hoje', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
    { icon: Apple, text: 'Não esqueça da refeição pré-treino', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
    { icon: Bell, text: paymentStatus === 'vencido' ? '⚠️ Mensalidade vencida!' : 'Mensalidade em dia', color: paymentStatus === 'vencido' ? 'text-red-400' : 'text-emerald-400', bg: paymentStatus === 'vencido' ? 'bg-red-400/10 border-red-400/20' : 'bg-emerald-400/10 border-emerald-400/20' },
  ]

  if (loading) return (
    <Layout title="Dashboard">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  )

  return (
    <Layout title="Meu Dashboard">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Olá, {user?.name?.split(' ')[0]}! 👋
            </h2>
            <p className="text-white/40 text-sm mt-1">
              {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500/10 border border-brand-500/20">
            <Flame size={16} className="text-brand-300" />
            <span className="text-brand-300 text-sm font-semibold">{student?.totalWorkouts || 0} treinos</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Treinos Realizados', value: student?.totalWorkouts || 0, icon: Dumbbell, color: 'brand' },
            { label: 'Esta Semana', value: weekSessions.length, icon: Flame, color: 'amber' },
            { label: 'IMC Atual', value: student?.imc || '--', icon: Scale, color: 'emerald' },
            { label: 'Peso', value: student?.questionnaire?.weight ? `${student.questionnaire.weight}kg` : '--', icon: TrendingUp, color: 'purple' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                s.color === 'brand' ? 'bg-brand-500/20 text-brand-300' :
                s.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                s.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                'bg-purple-500/20 text-purple-400'
              }`}>
                <s.icon size={18} />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Workout */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Dumbbell size={18} className="text-brand-300" />
                Treino de Hoje
              </h3>
              <span className="text-xs text-white/30">{dayNames[today]}</span>
            </div>

            {todayWorkout ? (
              <div>
                <div className="flex items-start justify-between mb-4 p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
                  <div>
                    <h4 className="font-bold text-white text-lg">{todayWorkout.name}</h4>
                    <div className="flex items-center gap-3 mt-2 text-sm text-white/50">
                      <span className="flex items-center gap-1"><Clock size={13} /> {todayWorkout.estimatedDuration} min</span>
                      <span className="flex items-center gap-1"><Target size={13} /> {todayWorkout.exercises?.length} exercícios</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/student/workout/${todayWorkout._id}`)}
                    className="btn-primary text-sm py-2 px-4">
                    <Play size={16} />
                    Iniciar
                  </button>
                </div>

                <div className="space-y-2">
                  {todayWorkout.exercises?.slice(0, 4).map((ex, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/3 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-dark-600 flex items-center justify-center text-xs font-bold text-brand-400">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{ex.name}</p>
                        <p className="text-white/40 text-xs">{ex.sets}x {ex.reps}</p>
                      </div>
                      <span className="text-xs text-white/30 capitalize hidden sm:block">{ex.muscleGroup}</span>
                    </div>
                  ))}
                  {todayWorkout.exercises?.length > 4 && (
                    <p className="text-center text-white/30 text-xs py-2">
                      + {todayWorkout.exercises.length - 4} exercícios
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-white/30">
                <Dumbbell size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nenhum treino para hoje</p>
                <p className="text-xs mt-1">Aproveite para descansar! 💪</p>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* IMC Card */}
            <div className="card">
              <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <Scale size={16} className="text-brand-300" /> IMC & Composição
              </h3>
              {student?.imc ? (
                <>
                  <IMCGauge imc={student.imc} category={student.imcCategory} />
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-white/5 text-center">
                      <p className="text-white/40">Peso</p>
                      <p className="text-white font-bold">{student.questionnaire?.weight}kg</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 text-center">
                      <p className="text-white/40">Altura</p>
                      <p className="text-white font-bold">{student.questionnaire?.height}cm</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-white/30 text-xs">Complete o questionário para ver seu IMC.</p>
              )}
            </div>

            {/* Payment Status */}
            <div className="card">
              <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <CreditCard size={16} className="text-brand-300" /> Mensalidade
              </h3>
              {latestPayment ? (
                <div>
                  <div className={`flex items-center gap-2 p-3 rounded-lg border ${
                    paymentStatus === 'pago' ? 'bg-emerald-500/10 border-emerald-500/20' :
                    paymentStatus === 'vencido' ? 'bg-red-500/10 border-red-500/20' :
                    'bg-amber-500/10 border-amber-500/20'
                  }`}>
                    {paymentStatus === 'pago' ? <CheckCircle2 size={16} className="text-emerald-400" /> :
                     <AlertTriangle size={16} className={paymentStatus === 'vencido' ? 'text-red-400' : 'text-amber-400'} />}
                    <div>
                      <p className="text-white text-sm font-semibold">
                        {paymentStatus === 'pago' ? 'Em dia' : paymentStatus === 'vencido' ? 'Vencida!' : 'Pendente'}
                      </p>
                      <p className="text-white/40 text-xs">
                        Venc.: {format(new Date(latestPayment.dueDate), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                  <p className="text-white/30 text-xs mt-2 text-center">R$ {latestPayment.amount?.toFixed(2)}/mês</p>
                </div>
              ) : (
                <p className="text-white/30 text-xs">Nenhum dado de mensalidade.</p>
              )}
            </div>

            {/* Reminders */}
            <div className="card">
              <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <Bell size={16} className="text-brand-300" /> Lembretes
              </h3>
              <div className="space-y-2">
                {reminders.map((r, i) => (
                  <div key={i} className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs ${r.bg}`}>
                    <r.icon size={13} className={r.color} />
                    <span className="text-white/70">{r.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent sessions */}
        {sessions.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Award size={18} className="text-brand-300" /> Últimos Treinos
              </h3>
              <button onClick={() => navigate('/student/evolution')} className="text-brand-400 text-xs flex items-center gap-1 hover:text-brand-300 transition-colors">
                Ver evolução <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {sessions.slice(0, 4).map((s) => (
                <div key={s._id} className="flex items-center gap-4 p-3 rounded-xl bg-white/3 border border-white/5">
                  <div className="w-9 h-9 rounded-lg bg-brand-500/20 flex items-center justify-center">
                    <Dumbbell size={16} className="text-brand-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{s.workoutName || 'Treino'}</p>
                    <p className="text-white/40 text-xs">{format(new Date(s.date), 'dd/MM/yyyy')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/60 text-xs">{s.totalDuration || 0} min</p>
                    <span className={s.completed ? 'badge-success' : 'badge-warning'}>
                      {s.completed ? 'Concluído' : 'Incompleto'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
