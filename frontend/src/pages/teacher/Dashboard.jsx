import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  Activity, AlertCircle, ArrowRight, Award, Bell, CalendarDays, Dumbbell, Target, TrendingUp, Users,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import api from '../../services/api'
import { buildTeacherNotifications } from '../../data/demoNotifications'

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudents()
  }, [])

  async function fetchStudents() {
    try {
      const res = await api.get('/teacher/students')
      setStudents(res.data.students || [])
    } catch {
      toast.error('Erro ao carregar alunos.')
    } finally {
      setLoading(false)
    }
  }

  const activeStudents = students.filter((student) => {
    if (!student.lastWorkout) return false
    return Date.now() - new Date(student.lastWorkout).getTime() <= 7 * 24 * 60 * 60 * 1000
  })

  const inactiveStudents = students.filter((student) => {
    if (!student.lastWorkout) return true
    return Date.now() - new Date(student.lastWorkout).getTime() > 14 * 24 * 60 * 60 * 1000
  })

  const notifications = buildTeacherNotifications({ students })

  const spotlightStudent = useMemo(() => {
    if (!students.length) return null
    return [...students].sort((a, b) => (b.totalWorkouts || 0) - (a.totalWorkouts || 0))[0]
  }, [students])

  if (loading) {
    return (
      <Layout title="Dashboard Professor">
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Dashboard Professor">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-brand-400/20 bg-[radial-gradient(circle_at_top_left,_rgba(0,180,216,0.20),_transparent_28%),linear-gradient(135deg,_rgba(7,11,16,0.98),_rgba(13,31,45,0.98))] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.28)] sm:p-7">
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand-300">
                <Award size={13} />
                Painel do professor
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">Sua carteira de alunos</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/65">
                Um painel mais forte para apresentacao comercial: status de frequencia, alunos em risco, alunos em destaque e atalhos para acompanhar treinos, dieta e feedbacks.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/30">Alunos</p>
                  <p className="mt-2 text-3xl font-black text-white">{students.length}</p>
                  <p className="mt-1 text-xs text-white/45">vinculados a voce</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/30">Ativos</p>
                  <p className="mt-2 text-3xl font-black text-white">{activeStudents.length}</p>
                  <p className="mt-1 text-xs text-white/45">nos ultimos 7 dias</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/30">Em risco</p>
                  <p className="mt-2 text-3xl font-black text-white">{inactiveStudents.length}</p>
                  <p className="mt-1 text-xs text-white/45">mais de 14 dias</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/30">Aluno em destaque</p>
                  <h3 className="mt-2 text-2xl font-black text-white">{spotlightStudent?.user?.name || 'Sem dados'}</h3>
                  <p className="mt-1 text-sm text-white/50">
                    {spotlightStudent?.questionnaire?.objective?.replace('_', ' ') || 'Sem objetivo'}
                  </p>
                </div>
                <button type="button" onClick={() => navigate('/teacher/students')} className="btn-secondary px-4 py-2 text-sm">
                  Abrir alunos
                </button>
              </div>

              {spotlightStudent ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-3xl border border-white/10 bg-dark-900/35 p-4">
                    <p className="text-sm text-white/45">Treinos concluidos</p>
                    <p className="mt-1 text-3xl font-black text-white">{spotlightStudent.totalWorkouts || 0}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-dark-900/35 p-3">
                      <p className="text-xs text-white/35">Ultimo treino</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {spotlightStudent.lastWorkout ? format(new Date(spotlightStudent.lastWorkout), 'dd/MM/yyyy') : 'Sem registro'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-dark-900/35 p-3">
                      <p className="text-xs text-white/35">Nivel</p>
                      <p className="mt-1 text-sm font-semibold capitalize text-white">{spotlightStudent.questionnaire?.level || 'iniciante'}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                    {spotlightStudent.notes?.[0]?.text || 'Aluno com boa aderencia na demonstracao.'}
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-white/45">Nenhum aluno disponivel.</p>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Carteira ativa', value: activeStudents.length, icon: Activity, accent: 'text-emerald-400', note: 'engajados nesta semana' },
            { label: 'Baixa frequencia', value: inactiveStudents.length, icon: AlertCircle, accent: 'text-amber-400', note: 'pedem contato rapido' },
            { label: 'Treinos acompanhados', value: students.reduce((acc, item) => acc + (item.totalWorkouts || 0), 0), icon: Dumbbell, accent: 'text-brand-300', note: 'historico demo somado' },
            { label: 'Agenda do dia', value: students.length ? students.length : 0, icon: CalendarDays, accent: 'text-sky-300', note: 'alunos para follow-up' },
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

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="card rounded-[1.75rem]">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold text-white">
                  <Bell size={16} className="text-brand-300" /> Lembretes do professor
                </h3>
              </div>
              <div className="mt-4 space-y-3">
                {notifications.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-white/50">{item.message}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card rounded-[1.75rem]">
              <h3 className="flex items-center gap-2 font-bold text-white">
                <Target size={16} className="text-brand-300" /> Alunos que precisam de atencao
              </h3>
              {inactiveStudents.length ? (
                <div className="mt-4 space-y-3">
                  {inactiveStudents.slice(0, 4).map((student) => {
                    const daysInactive = student.lastWorkout
                      ? Math.floor((Date.now() - new Date(student.lastWorkout).getTime()) / 86400000)
                      : null
                    return (
                      <div key={student._id} className="rounded-3xl border border-amber-400/20 bg-amber-500/10 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">{student.user?.name}</p>
                            <p className="mt-1 text-sm text-amber-200/80">
                              {daysInactive === null ? 'Sem treino registrado' : `${daysInactive} dias sem treinar`}
                            </p>
                          </div>
                          <button type="button" onClick={() => navigate('/teacher/students')} className="text-amber-300 transition-colors hover:text-amber-200">
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="mt-4 text-sm text-white/45">Nenhum aluno em estado de risco no momento.</p>
              )}
            </div>
          </div>

          <div className="card rounded-[1.75rem]">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-bold text-white">
                <Users size={16} className="text-brand-300" /> Visao geral dos alunos
              </h3>
              <button type="button" onClick={() => navigate('/teacher/students')} className="text-xs text-brand-300 transition-colors hover:text-brand-200">
                Gerenciar tudo
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {students.slice(0, 6).map((student) => {
                const daysSince = student.lastWorkout
                  ? Math.floor((Date.now() - new Date(student.lastWorkout).getTime()) / 86400000)
                  : null
                const statusClass = !student.lastWorkout || daysSince > 14
                  ? 'badge-warning'
                  : daysSince <= 2
                    ? 'badge-success'
                    : 'badge-info'

                return (
                  <div key={student._id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{student.user?.name}</p>
                        <p className="mt-1 truncate text-xs text-white/40">{student.user?.email}</p>
                      </div>
                      <span className={statusClass}>
                        {daysSince === null ? 'Sem treino' : daysSince <= 2 ? 'Em dia' : daysSince > 14 ? 'Risco' : 'Acompanhar'}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-dark-900/35 p-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/30">Objetivo</p>
                        <p className="mt-1 text-sm font-semibold capitalize text-white">{student.questionnaire?.objective?.replace('_', ' ') || 'Nao definido'}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-dark-900/35 p-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/30">Treinos</p>
                        <p className="mt-1 text-sm font-semibold text-white">{student.totalWorkouts || 0}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-dark-900/35 p-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/30">Ultimo treino</p>
                        <p className="mt-1 text-sm font-semibold text-white">{daysSince === null ? 'Nunca' : `${daysSince}d`}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <button type="button" onClick={() => navigate('/teacher/students')} className="btn-primary mt-5 w-full">
              <TrendingUp size={16} />
              Abrir painel detalhado de alunos
            </button>
          </div>
        </section>
      </div>
    </Layout>
  )
}
