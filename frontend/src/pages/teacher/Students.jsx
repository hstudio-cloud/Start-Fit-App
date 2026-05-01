import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api from '../../services/api'
import {
  Search, ChevronDown, ChevronUp, Dumbbell, TrendingUp,
  MessageSquare, Plus, X, Save, Loader2, Scale, Clock,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div className="bg-dark-700 border border-white/10 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>)}
    </div>
  )
  return null
}

export default function TeacherStudents() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [detail, setDetail] = useState({})
  const [noteText, setNoteText] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStudents() }, [])

  const fetchStudents = async () => {
    try {
      const res = await api.get('/teacher/students')
      setStudents(res.data.students || [])
    } catch { toast.error('Erro ao carregar alunos.') }
    finally { setLoading(false) }
  }

  const fetchDetail = async (id) => {
    if (detail[id]) return
    try {
      const res = await api.get(`/teacher/students/${id}`)
      setDetail(d => ({ ...d, [id]: res.data }))
    } catch { toast.error('Erro ao carregar detalhes.') }
  }

  const toggleExpand = async (id) => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    await fetchDetail(id)
  }

  const addNote = async (studentId) => {
    if (!noteText.trim()) { toast.error('Escreva uma observação.'); return }
    setAddingNote(true)
    try {
      await api.post(`/teacher/students/${studentId}/notes`, { text: noteText })
      toast.success('Observação adicionada!')
      setNoteText('')
      setDetail(d => ({ ...d, [studentId]: null }))
      await fetchDetail(studentId)
    } catch { toast.error('Erro ao adicionar observação.') }
    finally { setAddingNote(false) }
  }

  const filtered = students.filter(s =>
    s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.user?.email?.toLowerCase().includes(search.toLowerCase())
  )

  const objectiveLabel = {
    emagrecer: 'Emagrecer', ganhar_massa: 'Ganhar Massa',
    condicionamento: 'Condicionamento', saude: 'Saúde', força: 'Força',
  }

  return (
    <Layout title="Meus Alunos">
      <div className="max-w-4xl mx-auto space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-white">Meus Alunos</h2>
          <p className="text-white/40 text-sm">{students.length} alunos vinculados</p>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input className="input pl-10" placeholder="Buscar aluno..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-12 text-white/30">
            <p>Nenhum aluno encontrado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(s => {
              const isExp = expanded === s._id
              const d = detail[s._id]
              const daysSince = s.lastWorkout ? Math.floor((Date.now() - new Date(s.lastWorkout)) / 86400000) : null
              const weightData = d?.progress?.map(p => ({
                date: format(new Date(p.date), 'dd/MM'),
                Peso: p.weight, IMC: p.imc,
              })) || []

              return (
                <div key={s._id} className={`card p-0 overflow-hidden transition-all duration-300 ${isExp ? 'border-brand-500/30' : 'border-white/5'}`}>
                  {/* Header row */}
                  <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => toggleExpand(s._id)}>
                    <div className="w-11 h-11 rounded-full bg-brand-500/20 flex items-center justify-center text-base font-bold text-brand-300 flex-shrink-0">
                      {s.user?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold">{s.user?.name}</p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {s.questionnaire?.objective && (
                          <span className="text-white/40 text-xs">{objectiveLabel[s.questionnaire.objective]}</span>
                        )}
                        {s.questionnaire?.level && (
                          <span className="text-white/30 text-xs capitalize">{s.questionnaire.level}</span>
                        )}
                        <span className="flex items-center gap-1 text-white/30 text-xs">
                          <Dumbbell size={10} /> {s.totalWorkouts || 0} treinos
                        </span>
                      </div>
                    </div>
                    <div className="text-right mr-2 flex-shrink-0">
                      {daysSince !== null ? (
                        <span className={`text-xs font-medium ${daysSince > 14 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {daysSince === 0 ? 'Hoje' : `${daysSince}d atrás`}
                        </span>
                      ) : <span className="text-white/30 text-xs">Nunca treinou</span>}
                    </div>
                    {isExp ? <ChevronUp size={16} className="text-white/40 flex-shrink-0" /> : <ChevronDown size={16} className="text-white/40 flex-shrink-0" />}
                  </button>

                  {/* Detail */}
                  {isExp && (
                    <div className="border-t border-white/5 p-4 space-y-5">
                      {!d ? (
                        <div className="flex justify-center py-6"><div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
                      ) : (
                        <>
                          {/* Questionnaire summary */}
                          {d.student?.questionnaireCompleted && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {[
                                { label: 'Peso', value: `${d.student.questionnaire?.weight || '--'}kg` },
                                { label: 'IMC', value: d.student.imc || '--' },
                                { label: 'Altura', value: `${d.student.questionnaire?.height || '--'}cm` },
                                { label: 'Limitações', value: d.student.questionnaire?.physicalLimitations || 'Nenhuma' },
                              ].map(item => (
                                <div key={item.label} className="p-3 rounded-xl bg-white/5 border border-white/5">
                                  <p className="text-white/40 text-xs">{item.label}</p>
                                  <p className="text-white font-semibold text-sm mt-0.5 truncate">{item.value}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Progress chart */}
                          {weightData.length > 1 && (
                            <div>
                              <h4 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                                <TrendingUp size={14} className="text-brand-300" /> Evolução de Peso
                              </h4>
                              <ResponsiveContainer width="100%" height={160}>
                                <LineChart data={weightData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Line type="monotone" dataKey="Peso" stroke="#0096c7" strokeWidth={2} dot={{ r: 3, fill: '#0096c7' }} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          )}

                          {/* Workouts */}
                          {d.workouts?.length > 0 && (
                            <div>
                              <h4 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                                <Dumbbell size={14} className="text-brand-300" /> Treinos ({d.workouts.length})
                              </h4>
                              <div className="space-y-2">
                                {d.workouts.map(w => (
                                  <div key={w._id} className="flex items-center gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
                                    <div className="flex-1">
                                      <p className="text-white text-xs font-medium">{w.name}</p>
                                      <p className="text-white/40 text-xs">{w.exercises?.length} exercícios · {w.estimatedDuration} min</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full border ${
                                      w.generatedBy === 'ai' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                                      w.generatedBy === 'teacher' ? 'bg-brand-500/20 text-brand-300 border-brand-500/30' :
                                      'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                    }`}>{w.generatedBy === 'ai' ? 'IA' : w.generatedBy === 'teacher' ? 'Prof.' : 'Admin'}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          <div>
                            <h4 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                              <MessageSquare size={14} className="text-brand-300" /> Observações do Professor
                            </h4>
                            {d.student?.notes?.length > 0 && (
                              <div className="space-y-2 mb-3">
                                {d.student.notes.slice().reverse().slice(0, 3).map((n, i) => (
                                  <div key={i} className="p-3 rounded-lg bg-white/3 border border-white/5">
                                    <p className="text-white/70 text-xs leading-relaxed">{n.text}</p>
                                    <p className="text-white/30 text-xs mt-1">{n.author} · {format(new Date(n.createdAt), 'dd/MM/yy HH:mm')}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="flex gap-2">
                              <textarea className="input text-xs resize-none flex-1" rows={2}
                                placeholder="Adicionar observação sobre o aluno..."
                                value={noteText} onChange={e => setNoteText(e.target.value)} />
                              <button onClick={() => addNote(s._id)} disabled={addingNote}
                                className="btn-primary text-xs px-3 self-end">
                                {addingNote ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
