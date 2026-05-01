import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import Timer from '../../components/Timer'
import ExerciseVisualizer from '../../components/ExerciseVisualizer'
import api from '../../services/api'
import {
  ChevronLeft, Play, Pause, CheckCircle2, Clock, Dumbbell,
  RotateCcw, Save, Star, ChevronDown, ChevronUp, Timer as TimerIcon,
  Flame, Target, Info
} from 'lucide-react'
import toast from 'react-hot-toast'

const WorkoutTimer = ({ onTick }) => {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(true)
  const ref = useRef(null)

  useEffect(() => {
    ref.current = setInterval(() => {
      setElapsed(e => { onTick?.(e + 1); return e + 1 })
    }, 1000)
    return () => clearInterval(ref.current)
  }, [])

  const fmt = s => `${String(Math.floor(s / 3600)).padStart(2,'0')}:${String(Math.floor((s % 3600) / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`

  const toggle = () => {
    if (running) clearInterval(ref.current)
    else ref.current = setInterval(() => setElapsed(e => e + 1), 1000)
    setRunning(r => !r)
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-dark-700 border border-white/10">
      <Clock size={15} className="text-brand-300" />
      <span className="text-white font-mono text-sm font-bold">{fmt(elapsed)}</span>
      <button onClick={toggle} className="text-white/40 hover:text-white/70 transition-colors ml-1">
        {running ? <Pause size={14} /> : <Play size={14} />}
      </button>
    </div>
  )
}

export default function WorkoutSession() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [workout, setWorkout] = useState(null)
  const [session, setSession] = useState(null)
  const [exercises, setExercises] = useState([])
  const [expanded, setExpanded] = useState(0)
  const [showTimer, setShowTimer] = useState(null)
  const [rating, setRating] = useState(0)
  const [notes, setNotes] = useState('')
  const [finishing, setFinishing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showFinish, setShowFinish] = useState(false)
  const totalTime = useRef(0)

  useEffect(() => { fetchWorkout() }, [id])

  const fetchWorkout = async () => {
    try {
      const res = await api.get('/student/workouts')
      const found = res.data.workouts?.find(w => w._id === id)
      if (!found) { toast.error('Treino não encontrado'); navigate('/student'); return }
      setWorkout(found)

      const exList = found.exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        animationKey: ex.animationKey,
        videoUrl: ex.videoUrl,
        videoSourceUrl: ex.videoSourceUrl,
        videoAttribution: ex.videoAttribution,
        videoLabel: ex.videoLabel,
        exerciseName: ex.name, muscleGroup: ex.muscleGroup,
        plannedSets: ex.sets, plannedReps: ex.reps,
        completedSets: 0, load: '', reps: ex.reps,
        observations: '', completed: false, duration: 0,
        restTime: ex.restTime, instructions: ex.instructions,
      }))
      setExercises(exList)

      const sessRes = await api.post('/student/session', {
        workoutId: found._id, workoutName: found.name,
        exercises: exList.map(e => ({ ...e, load: 0 })),
      })
      setSession(sessRes.data.session)
    } catch (err) {
      toast.error('Erro ao carregar treino.')
    }
  }

  const updateEx = (i, field, value) => {
    setExercises(prev => prev.map((ex, idx) => idx === i ? { ...ex, [field]: value } : ex))
  }

  const toggleComplete = (i) => {
    const ex = exercises[i]
    if (!ex.completed && !ex.load) {
      toast('Informe a carga utilizada!', { icon: '⚖️' })
    }
    updateEx(i, 'completed', !ex.completed)
    if (!ex.completed) {
      setShowTimer(i)
      setTimeout(() => setExpanded(i + 1 < exercises.length ? i + 1 : i), 300)
    }
  }

  const saveProgress = async () => {
    if (!session) return
    setSaving(true)
    try {
      await api.put(`/student/session/${session._id}`, {
        exercises: exercises.map(e => ({ ...e, load: Number(e.load) || 0 })),
        generalNotes: notes,
      })
      toast.success('Progresso salvo!')
    } catch { toast.error('Erro ao salvar.') }
    finally { setSaving(false) }
  }

  const finishWorkout = async () => {
    if (!session) return
    setFinishing(true)
    try {
      await api.put(`/student/session/${session._id}`, {
        exercises: exercises.map(e => ({ ...e, load: Number(e.load) || 0 })),
        generalNotes: notes, rating, completed: true,
      })
      toast.success('Treino concluído! 🎉')
      navigate('/student')
    } catch { toast.error('Erro ao finalizar treino.') }
    finally { setFinishing(false) }
  }

  const completedCount = exercises.filter(e => e.completed).length
  const progress = exercises.length > 0 ? (completedCount / exercises.length) * 100 : 0

  if (!workout) return (
    <Layout title="Treino">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  )

  return (
    <Layout title={workout.name}>
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button onClick={() => navigate('/student')} className="flex items-center gap-1 text-white/40 hover:text-white transition-colors text-sm">
            <ChevronLeft size={16} /> Voltar
          </button>
          <WorkoutTimer onTick={t => { totalTime.current = t }} />
          <button onClick={saveProgress} disabled={saving}
            className="btn-secondary text-sm py-2 px-3">
            <Save size={14} />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

        {/* Progress */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-white">{workout.name}</h2>
              <p className="text-white/40 text-sm">{workout.objective}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-brand-300">{completedCount}<span className="text-white/30 text-lg">/{exercises.length}</span></p>
              <p className="text-white/40 text-xs">exercícios</p>
            </div>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-500 to-brand-300 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-white/40">
            <span className="flex items-center gap-1"><Flame size={12} className="text-amber-400" /> {completedCount} concluídos</span>
            <span className="flex items-center gap-1"><Target size={12} className="text-brand-400" /> {exercises.length - completedCount} restantes</span>
            <span className="flex items-center gap-1"><Clock size={12} className="text-emerald-400" /> ~{workout.estimatedDuration} min</span>
          </div>
        </div>

        {/* Exercise List */}
        <div className="space-y-3">
          {exercises.map((ex, i) => (
            <div key={i} className={`card p-0 overflow-hidden transition-all duration-300 ${
              ex.completed ? 'border-emerald-500/30' : expanded === i ? 'border-brand-500/30' : 'border-white/5'
            }`}>
              {/* Exercise header */}
              <button className="w-full flex items-center gap-3 p-4 text-left"
                onClick={() => setExpanded(expanded === i ? -1 : i)}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm transition-all ${
                  ex.completed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-dark-600 text-brand-400 border border-white/10'
                }`}>
                  {ex.completed ? <CheckCircle2 size={18} /> : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${ex.completed ? 'text-white/50 line-through' : 'text-white'}`}>{ex.exerciseName}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-white/40 text-xs">{ex.plannedSets}x {ex.plannedReps}</span>
                    <span className="text-white/30 text-xs capitalize">{ex.muscleGroup}</span>
                  </div>
                </div>
                {expanded === i ? <ChevronUp size={16} className="text-white/40 flex-shrink-0" /> : <ChevronDown size={16} className="text-white/40 flex-shrink-0" />}
              </button>

              {/* Expanded details */}
              {expanded === i && (
                <div className="px-4 pb-4 border-t border-white/5 pt-4 space-y-4">
                  <ExerciseVisualizer exercise={ex} />

                  {ex.instructions && (
                    <div className="flex gap-2 p-3 rounded-lg bg-brand-500/10 border border-brand-500/20">
                      <Info size={14} className="text-brand-300 flex-shrink-0 mt-0.5" />
                      <p className="text-white/60 text-xs leading-relaxed">{ex.instructions}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label text-xs">Carga (kg)</label>
                      <input className="input py-2 text-sm" type="number" min="0" placeholder="0"
                        value={ex.load} onChange={e => updateEx(i, 'load', e.target.value)} />
                    </div>
                    <div>
                      <label className="label text-xs">Repetições</label>
                      <input className="input py-2 text-sm" type="text" placeholder={ex.plannedReps}
                        value={ex.reps} onChange={e => updateEx(i, 'reps', e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="label text-xs">Observações</label>
                    <textarea className="input text-sm resize-none py-2" rows={2}
                      placeholder="Ex: Aumentar peso na próxima, sentiu dor..."
                      value={ex.observations} onChange={e => updateEx(i, 'observations', e.target.value)} />
                  </div>

                  {/* Rest timer */}
                  {showTimer === i && (
                    <div className="rounded-xl bg-dark-700 border border-brand-500/20 p-2">
                      <p className="text-center text-xs text-brand-300 mb-2 font-semibold flex items-center justify-center gap-1">
                        <TimerIcon size={12} /> Tempo de Descanso
                      </p>
                      <Timer defaultSeconds={ex.restTime || 60} onComplete={() => toast('Descansou! Próximo exercício 💪', { icon: '⏰' })} />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => setShowTimer(showTimer === i ? null : i)}
                      className="btn-secondary text-xs py-2 px-3 flex-1">
                      <TimerIcon size={14} />
                      {showTimer === i ? 'Fechar Timer' : 'Timer Descanso'}
                    </button>
                    <button onClick={() => toggleComplete(i)}
                      className={`text-xs py-2 px-3 flex-1 flex items-center gap-1 justify-center rounded-xl font-semibold transition-all ${
                        ex.completed
                          ? 'bg-white/10 border border-white/20 text-white/60 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30'
                          : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30'
                      }`}>
                      <CheckCircle2 size={14} />
                      {ex.completed ? 'Desfazer' : 'Concluir'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="card">
          <label className="label">Observações gerais do treino</label>
          <textarea className="input resize-none" rows={3}
            placeholder="Como foi o treino? Algum exercício que ficou difícil?"
            value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        {/* Finish */}
        {!showFinish ? (
          <button onClick={() => setShowFinish(true)} className="btn-primary w-full">
            <CheckCircle2 size={18} /> Finalizar Treino
          </button>
        ) : (
          <div className="card border-emerald-500/30">
            <h3 className="font-bold text-white mb-4 text-center">Avalie seu treino</h3>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setRating(n)}
                  className={`w-12 h-12 rounded-xl text-2xl transition-all hover:scale-110 ${rating >= n ? 'bg-amber-500/20 border border-amber-500/40' : 'bg-white/5 border border-white/10'}`}>
                  <Star size={22} className={`mx-auto ${rating >= n ? 'text-amber-400 fill-amber-400' : 'text-white/30'}`} />
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowFinish(false)} className="btn-secondary flex-1">
                <RotateCcw size={16} /> Continuar
              </button>
              <button onClick={finishWorkout} disabled={finishing} className="btn-primary flex-1" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                <CheckCircle2 size={16} />
                {finishing ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
