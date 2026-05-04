import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Apple, Award, Bell, CheckCircle2, ChevronRight, Clock, CreditCard, Droplets, Dumbbell,
  Flame, Play, Scale, Sparkles, Target, TrendingUp,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import ExerciseAnimation from '../../components/ExerciseAnimation'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { buildStudentNotifications } from '../../data/demoNotifications'

const toneClasses = {
  danger: 'border-red-400/20 bg-red-500/10 text-red-300',
  warning: 'border-amber-400/20 bg-amber-500/10 text-amber-300',
  success: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300',
  info: 'border-sky-400/20 bg-sky-500/10 text-sky-300',
  brand: 'border-brand-400/20 bg-brand-500/10 text-brand-300',
}

const IMCGauge = ({ imc, category }) => {
  if (!imc) return null

  const progress = Math.min((Number(imc) / 40) * 100, 100)
  const color = imc < 18.5 ? '#60a5fa' : imc < 25 ? '#34d399' : imc < 30 ? '#fbbf24' : '#f87171'

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20">
        <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
          <circle cx="32" cy="32" r="24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle
            cx="32"
            cy="32"
            r="24"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${progress * 1.5} 150`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black text-white">{imc}</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">IMC</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{category}</p>
        <p className="mt-1 text-xs text-white/45">Com base no peso e altura do cadastro demo.</p>
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
  const [diets, setDiets] = useState([])
  const [teachers, setTeachers] = useState({ list: [], selectedTeacherId: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (student && !student.questionnaireCompleted) {
      navigate('/student/questionnaire')
      return
    }
    fetchData()
  }, [student])

  async function fetchData() {
    try {
      const [workoutRes, paymentsRes, sessionsRes, dietsRes, teachersRes] = await Promise.all([
        api.get('/student/workout/today'),
        api.get('/student/payments'),
        api.get('/student/sessions'),
        api.get('/student/diets'),
        api.get('/student/teachers'),
      ])
      setTodayWorkout(workoutRes.data.workout)
      setPayments(paymentsRes.data.payments || [])
      setSessions(sessionsRes.data.sessions || [])
      setDiets(dietsRes.data.diets || [])
      setTeachers({
        list: teachersRes.data.teachers || [],
        selectedTeacherId: teachersRes.data.selectedTeacherId || '',
      })
    } catch {
      toast.error('Erro ao carregar dados do dashboard.')
    } finally {
      setLoading(false)
    }
  }

  const selectedTeacher = teachers.list.find((item) => item._id === teachers.selectedTeacherId)
  const activeDiet = diets[0]
  const latestPayment = payments[0]
  const currentWeekSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.date).getTime()
    return Date.now() - sessionDate <= 7 * 24 * 60 * 60 * 1000
  })
  const notifications = buildStudentNotifications({
    payments,
    workout: todayWorkout,
    student,
    diets,
  })

  const estimatedVolume = useMemo(() => (
    sessions.slice(0, 4).reduce((acc, session) => (
      acc + (session.exercises || []).reduce((exerciseAcc, exercise) => {
        if (Array.isArray(exercise.seriesLog)) {
          return exerciseAcc + exercise.seriesLog.reduce((setAcc, item) => setAcc + (Number(item.load) || 0) * (Number.parseInt(item.reps, 10) || 0), 0)
        }
        return exerciseAcc + ((Number(exercise.load) || 0) * (Number.parseInt(exercise.reps, 10) || 0))
      }, 0)
    ), 0)
  ), [sessions])

  if (loading) {
    return (
      <Layout title="Meu Dashboard">
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Meu Dashboard">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-brand-400/20 bg-[radial-gradient(circle_at_top_left,_rgba(0,180,216,0.22),_transparent_28%),linear-gradient(135deg,_rgba(7,11,16,0.98),_rgba(13,31,45,0.98))] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.28)] sm:p-7">
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand-300">
                <Sparkles size={13} />
                Demo premium mobile
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Ola, {user?.name?.split(' ')[0]}
              </h2>
              <p className="mt-2 text-sm text-white/55 sm:text-base">
                {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </p>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/65">
                Seu treino do dia, evolucao, dieta e pagamentos aparecem aqui com foco em uma experiencia de app real para apresentacao da StartFit.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/30">Treinos</p>
                  <p className="mt-2 text-3xl font-black text-white">{student?.totalWorkouts || 0}</p>
                  <p className="mt-1 text-xs text-white/45">historico acumulado</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/30">Semana</p>
                  <p className="mt-2 text-3xl font-black text-white">{currentWeekSessions.length}</p>
                  <p className="mt-1 text-xs text-white/45">sessoes registradas</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/30">Volume</p>
                  <p className="mt-2 text-3xl font-black text-white">{estimatedVolume || 0}</p>
                  <p className="mt-1 text-xs text-white/45">kg estimados recentes</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
              {todayWorkout ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-white/30">Treino de hoje</p>
                      <h3 className="mt-2 text-2xl font-black text-white">{todayWorkout.name}</h3>
                      <p className="mt-1 text-sm text-white/50">{todayWorkout.objective?.replace('_', ' ')}</p>
                    </div>
                    <span className="badge-info">{todayWorkout.exercises?.length || 0} exercicios</span>
                  </div>

                  <div className="mt-4">
                    <ExerciseAnimation exercise={todayWorkout.exercises?.[0]} size="lg" highlighted />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-white/10 bg-dark-900/40 p-3 text-white/70">
                      <div className="flex items-center gap-2"><Clock size={14} className="text-brand-300" /> {todayWorkout.estimatedDuration} min</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-dark-900/40 p-3 text-white/70">
                      <div className="flex items-center gap-2"><Target size={14} className="text-emerald-400" /> foco guiado</div>
                    </div>
                  </div>

                  <button type="button" onClick={() => navigate(`/student/workout/${todayWorkout._id}`)} className="btn-primary mt-4 w-full">
                    <Play size={16} />
                    Iniciar treino guiado
                  </button>
                </>
              ) : (
                <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center text-white/40">
                  <Dumbbell size={42} className="mb-3 text-brand-300/60" />
                  <p className="font-semibold text-white/70">Nenhum treino para hoje</p>
                  <p className="mt-1 text-sm">Aguarde o personal ou aproveite para recuperar.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'IMC atual', value: student?.imc || '--', icon: Scale, accent: 'text-emerald-400', note: student?.imcCategory || 'Sem dados' },
            { label: 'Peso base', value: student?.questionnaire?.weight ? `${student.questionnaire.weight}kg` : '--', icon: TrendingUp, accent: 'text-brand-300', note: 'questionario demo' },
            { label: 'Dieta ativa', value: activeDiet ? activeDiet.meals?.length || 0 : 0, icon: Apple, accent: 'text-emerald-400', note: activeDiet ? activeDiet.title : 'Sem dieta' },
            { label: 'Mensalidade', value: latestPayment ? `R$ ${latestPayment.amount?.toFixed(2)}` : '--', icon: CreditCard, accent: 'text-amber-400', note: latestPayment?.status || 'Sem cobranca' },
          ].map((item) => (
            <div key={item.label} className="card-sm rounded-[1.5rem] p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 ${item.accent}`}>
                <item.icon size={18} />
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/30">{item.label}</p>
              <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
              <p className="mt-1 text-xs text-white/45">{item.note}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="card rounded-[1.75rem]">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold text-white">
                  <Bell size={16} className="text-brand-300" /> Alertas e lembretes
                </h3>
                <span className="text-xs text-white/35">{notifications.length} ativos</span>
              </div>
              <div className="mt-4 grid gap-3">
                {notifications.map((item) => (
                  <div key={item.id} className={`rounded-3xl border p-4 ${toneClasses[item.tone] || toneClasses.brand}`}>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm opacity-90">{item.message}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card rounded-[1.75rem]">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold text-white">
                  <Dumbbell size={16} className="text-brand-300" /> Proximos exercicios
                </h3>
                <button type="button" onClick={() => todayWorkout && navigate(`/student/workout/${todayWorkout._id}`)} className="text-xs text-brand-300 transition-colors hover:text-brand-200">
                  Abrir sessao
                </button>
              </div>
              {todayWorkout?.exercises?.length ? (
                <div className="mt-4 space-y-3">
                  {todayWorkout.exercises.slice(0, 3).map((exercise, index) => (
                    <div key={`${exercise.exerciseId || exercise.name}-${index}`} className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-3 sm:grid-cols-[120px_1fr]">
                      <ExerciseAnimation exercise={exercise} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white">{exercise.name}</p>
                        <p className="mt-1 text-xs text-white/45">{exercise.sets} series • {exercise.reps}</p>
                        <p className="mt-2 text-xs text-white/35">{exercise.instructions}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-white/40">Sem exercicios programados para o dia.</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card rounded-[1.75rem]">
              <h3 className="flex items-center gap-2 font-bold text-white">
                <Award size={16} className="text-brand-300" /> Minha estrutura demo
              </h3>
              <div className="mt-4 space-y-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/30">Personal responsavel</p>
                  <p className="mt-2 text-lg font-bold text-white">{selectedTeacher?.name || 'Sem personal'}</p>
                  <p className="mt-1 text-sm text-white/45">{selectedTeacher?.email || 'Selecione um profissional'}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/30">Plano alimentar</p>
                  <p className="mt-2 text-lg font-bold text-white">{activeDiet?.title || 'Sem dieta ativa'}</p>
                  <p className="mt-1 text-sm text-white/45">{activeDiet?.goal || 'Aguardando configuracao do personal'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => navigate('/student/diets')} className="btn-secondary">
                    <Apple size={15} />
                    Dietas
                  </button>
                  <button type="button" onClick={() => navigate('/student/trainer')} className="btn-secondary">
                    <Award size={15} />
                    Personal
                  </button>
                </div>
              </div>
            </div>

            <div className="card rounded-[1.75rem]">
              <h3 className="flex items-center gap-2 font-bold text-white">
                <Scale size={16} className="text-brand-300" /> Composicao corporal
              </h3>
              {student?.imc ? (
                <div className="mt-4">
                  <IMCGauge imc={student.imc} category={student.imcCategory} />
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm">
                      <p className="text-white/35">Altura</p>
                      <p className="mt-1 font-bold text-white">{student.questionnaire?.height} cm</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm">
                      <p className="text-white/35">Hidratacao</p>
                      <p className="mt-1 font-bold text-white">{activeDiet?.hydrationLiters || 2.5} L</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-white/40">Complete o questionario para visualizar esse bloco.</p>
              )}
            </div>

            <div className="card rounded-[1.75rem]">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold text-white">
                  <Flame size={16} className="text-brand-300" /> Ultimas sessoes
                </h3>
                <button type="button" onClick={() => navigate('/student/evolution')} className="text-xs text-brand-300 transition-colors hover:text-brand-200">
                  Evolucao
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {sessions.slice(0, 4).map((session) => (
                  <div key={session._id} className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300">
                      <Dumbbell size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{session.workoutName}</p>
                      <p className="text-xs text-white/40">{format(new Date(session.date), 'dd/MM/yyyy')}</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="text-white/55">{session.totalDuration || 0} min</p>
                      <span className={session.completed ? 'badge-success' : 'badge-warning'}>
                        {session.completed ? 'Concluido' : 'Em aberto'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Droplets,
              title: 'Agua',
              text: `Meta do dia: ${activeDiet?.hydrationLiters || 2.5} litros`,
              accent: 'text-sky-300',
            },
            {
              icon: Apple,
              title: 'Alimentacao',
              text: activeDiet?.meals?.[0]?.title ? `Proxima refeicao: ${activeDiet.meals[0].title}` : 'Sem refeicao planejada',
              accent: 'text-emerald-300',
            },
            {
              icon: CheckCircle2,
              title: 'Frequencia',
              text: currentWeekSessions.length >= 3 ? 'Boa constancia nesta semana' : 'Ha espaco para treinar mais nesta semana',
              accent: 'text-brand-300',
            },
          ].map((item) => (
            <div key={item.title} className="card-sm rounded-[1.5rem] p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 ${item.accent}`}>
                <item.icon size={18} />
              </div>
              <p className="mt-4 text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-1 text-sm text-white/45">{item.text}</p>
            </div>
          ))}
        </section>
      </div>
    </Layout>
  )
}
