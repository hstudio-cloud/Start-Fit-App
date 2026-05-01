import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import api from '../../services/api'
import {
  Users, TrendingUp, Activity, ChevronRight,
  Dumbbell, Clock, Award, AlertCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStudents() }, [])

  const fetchStudents = async () => {
    try {
      const res = await api.get('/teacher/students')
      setStudents(res.data.students || [])
    } catch { toast.error('Erro ao carregar alunos.') }
    finally { setLoading(false) }
  }

  const activeStudents = students.filter(s => {
    if (!s.lastWorkout) return false
    return (Date.now() - new Date(s.lastWorkout)) < 7 * 24 * 60 * 60 * 1000
  })

  const inactiveStudents = students.filter(s => {
    if (!s.lastWorkout) return true
    return (Date.now() - new Date(s.lastWorkout)) > 14 * 24 * 60 * 60 * 1000
  })

  return (
    <Layout title="Dashboard Professor">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Meu Painel 👨‍🏫</h2>
          <p className="text-white/40 text-sm">{format(new Date(), "dd 'de' MMMM 'de' yyyy")}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Meus Alunos', value: students.length, icon: Users, color: 'brand' },
            { label: 'Ativos (7d)', value: activeStudents.length, icon: Activity, color: 'emerald' },
            { label: 'Parados (+14d)', value: inactiveStudents.length, icon: AlertCircle, color: 'amber' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                s.color === 'brand' ? 'bg-brand-500/20 text-brand-300' :
                s.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                'bg-amber-500/20 text-amber-400'
              }`}><s.icon size={16} /></div>
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Inactive Alert */}
        {inactiveStudents.length > 0 && (
          <div className="card border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle size={18} className="text-amber-400" />
              <h3 className="font-bold text-amber-400">Alunos que precisam de atenção</h3>
            </div>
            <div className="space-y-2">
              {inactiveStudents.slice(0, 3).map(s => {
                const daysSince = s.lastWorkout
                  ? Math.floor((Date.now() - new Date(s.lastWorkout)) / 86400000)
                  : null
                return (
                  <div key={s._id} className="flex items-center gap-3 p-3 rounded-lg bg-white/3 border border-amber-500/10">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400">
                      {s.user?.name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{s.user?.name}</p>
                      <p className="text-amber-400/70 text-xs">
                        {daysSince ? `${daysSince} dias sem treinar` : 'Nunca treinou'}
                      </p>
                    </div>
                    <button onClick={() => navigate('/teacher/students')}
                      className="text-amber-400 hover:text-amber-300 transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Students list */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Users size={16} className="text-brand-300" /> Meus Alunos
            </h3>
            <button onClick={() => navigate('/teacher/students')}
              className="text-brand-400 text-xs flex items-center gap-1 hover:text-brand-300 transition-colors">
              Ver todos <ChevronRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-10 text-white/30">
              <Users size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum aluno vinculado a você ainda.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {students.slice(0, 6).map(s => {
                const daysSince = s.lastWorkout ? Math.floor((Date.now() - new Date(s.lastWorkout)) / 86400000) : null
                const isInactive = !s.lastWorkout || daysSince > 14

                return (
                  <div key={s._id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
                    onClick={() => navigate('/teacher/students')}>
                    <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-sm font-bold text-brand-300 flex-shrink-0">
                      {s.user?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm">{s.user?.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-white/40 text-xs">
                          <Dumbbell size={10} /> {s.totalWorkouts || 0} treinos
                        </span>
                        {s.questionnaire?.objective && (
                          <span className="text-white/30 text-xs capitalize">{s.questionnaire.objective.replace('_', ' ')}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {daysSince !== null ? (
                        <span className={`text-xs font-medium ${isInactive ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {daysSince === 0 ? 'Hoje' : `${daysSince}d`}
                        </span>
                      ) : (
                        <span className="text-white/30 text-xs">Nunca</span>
                      )}
                      <p className="text-white/20 text-xs">último treino</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
