import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { CheckCircle2, MessageSquare, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function StudentTrainer() {
  const { refreshStudent } = useAuth()
  const [teachers, setTeachers] = useState([])
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [teachersRes, profileRes] = await Promise.all([
        api.get('/student/teachers'),
        api.get('/student/profile'),
      ])
      setTeachers(teachersRes.data.teachers || [])
      setSelectedTeacherId(teachersRes.data.selectedTeacherId || '')
      setProfile(profileRes.data.student || null)
    } catch {
      toast.error('Erro ao carregar personal.')
    } finally {
      setLoading(false)
    }
  }

  const saveTeacher = async () => {
    setSaving(true)
    try {
      await api.put('/student/teacher', { teacherId: selectedTeacherId || null })
      await refreshStudent()
      await fetchData()
      toast.success('Personal atualizado.')
    } catch {
      toast.error('Nao foi possivel atualizar o personal.')
    } finally {
      setSaving(false)
    }
  }

  const feedbacks = [...(profile?.trainerFeedbacks || []), ...(profile?.notes || [])]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <Layout title="Meu Personal">
      <div className="mx-auto max-w-5xl space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-white">Vinculo com personal</h2>
          <p className="text-sm text-white/40">Selecione um personal cadastrado para ajustar seu treino e acompanhar seus feedbacks.</p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="card space-y-4">
              <div className="flex items-center gap-2">
                <UserCheck size={18} className="text-brand-300" />
                <h3 className="text-lg font-bold text-white">Escolha seu personal</h3>
              </div>

              <div className="space-y-3">
                {teachers.map((teacher) => (
                  <button
                    key={teacher._id}
                    type="button"
                    onClick={() => setSelectedTeacherId(teacher._id)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      selectedTeacherId === teacher._id
                        ? 'border-brand-500/40 bg-brand-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{teacher.name}</p>
                        <p className="mt-1 text-sm text-white/45">{teacher.email}</p>
                        {teacher.phone ? <p className="mt-1 text-xs text-white/35">{teacher.phone}</p> : null}
                      </div>
                      {selectedTeacherId === teacher._id ? (
                        <CheckCircle2 size={18} className="text-brand-300" />
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>

              <button type="button" onClick={saveTeacher} disabled={saving} className="btn-primary w-full">
                {saving ? 'Salvando...' : 'Confirmar personal'}
              </button>
            </div>

            <div className="card space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-brand-300" />
                <h3 className="text-lg font-bold text-white">Feedbacks recebidos</h3>
              </div>

              {feedbacks.length ? (
                <div className="space-y-3">
                  {feedbacks.map((feedback, index) => (
                    <div key={`${feedback.createdAt}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm leading-relaxed text-white/70">{feedback.text}</p>
                      <p className="mt-3 text-xs text-white/35">
                        {feedback.author} · {format(new Date(feedback.createdAt), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/40">
                  Nenhum feedback do personal ainda.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
