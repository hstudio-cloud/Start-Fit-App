import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CheckCircle2, ChevronLeft, Clock3, Pause, Play, Save, Sparkles, TimerReset, Trophy,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout'
import Timer from '../../components/Timer'
import ExerciseVisualizer from '../../components/ExerciseVisualizer'
import api from '../../services/api'
import { buildExercisePresentation } from '../../data/exerciseAnimations'

function formatClock(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function formatShort(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function WorkoutSession() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [workout, setWorkout] = useState(null)
  const [session, setSession] = useState(null)
  const [exercises, setExercises] = useState([])
  const [notes, setNotes] = useState('')
  const [feeling, setFeeling] = useState(4)
  const [saving, setSaving] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [exerciseStartedAt, setExerciseStartedAt] = useState(null)
  const [exerciseElapsed, setExerciseElapsed] = useState(0)
  const [sessionRunning, setSessionRunning] = useState(true)
  const [showRestTimer, setShowRestTimer] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const totalElapsedRef = useRef(0)

  useEffect(() => {
    fetchWorkout()
  }, [id])

  useEffect(() => {
    if (!exerciseStartedAt) return undefined
    const timerId = window.setInterval(() => {
      setExerciseElapsed(Math.floor((Date.now() - exerciseStartedAt) / 1000))
    }, 1000)
    return () => window.clearInterval(timerId)
  }, [exerciseStartedAt])

  useEffect(() => {
    if (!sessionRunning) return undefined
    const timerId = window.setInterval(() => {
      totalElapsedRef.current += 1
    }, 1000)
    return () => window.clearInterval(timerId)
  }, [sessionRunning])

  async function fetchWorkout() {
    try {
      const res = await api.get('/student/workouts')
      const found = res.data.workouts?.find((item) => item._id === id)
      if (!found) {
        toast.error('Treino nao encontrado.')
        navigate('/student')
        return
      }

      const preparedExercises = (found.exercises || []).map((exercise) => {
        const item = buildExercisePresentation(exercise)
        return {
          ...item,
          exerciseName: item.name,
          plannedSets: Number(item.sets || 3),
          plannedReps: item.reps || '8-12',
          completedSets: 0,
          currentSet: 1,
          actualReps: item.reps || '8-12',
          load: '',
          completed: false,
          started: false,
          seriesLog: [],
          observations: '',
        }
      })

      setWorkout(found)
      setExercises(preparedExercises)

      const sessionResponse = await api.post('/student/session', {
        workoutId: found._id,
        workoutName: found.name,
        exercises: preparedExercises,
      })
      setSession(sessionResponse.data.session)
    } catch (error) {
      toast.error('Erro ao carregar treino.')
    }
  }

  const activeIndex = exercises.findIndex((exercise) => !exercise.completed)
  const currentExercise = activeIndex >= 0 ? exercises[activeIndex] : null
  const completedExercises = exercises.filter((exercise) => exercise.completed).length
  const progress = exercises.length ? Math.round((completedExercises / exercises.length) * 100) : 0
  const totalSeries = exercises.reduce((acc, exercise) => acc + Number(exercise.plannedSets || 0), 0)
  const completedSeries = exercises.reduce((acc, exercise) => acc + Number(exercise.completedSets || 0), 0)
  const estimatedVolume = exercises.reduce((acc, exercise) => {
    return acc + exercise.seriesLog.reduce((seriesAcc, setEntry) => (
      seriesAcc + (Number(setEntry.load) || 0) * (Number.parseInt(setEntry.reps, 10) || 0)
    ), 0)
  }, 0)

  const summary = useMemo(() => ({
    totalTime: totalElapsedRef.current,
    completedExercises,
    volume: estimatedVolume,
  }), [completedExercises, estimatedVolume, showSummary])

  function updateExercise(index, patch) {
    setExercises((current) => current.map((exercise, exerciseIndex) => (
      exerciseIndex === index ? { ...exercise, ...patch } : exercise
    )))
  }

  function startCurrentExercise() {
    if (activeIndex < 0) return
    updateExercise(activeIndex, { started: true })
    setExerciseStartedAt(Date.now())
    setExerciseElapsed(0)
    toast.success('Exercicio iniciado.')
  }

  function toggleSessionRunning() {
    setSessionRunning((current) => !current)
  }

  function registerSet() {
    if (activeIndex < 0) return
    const exercise = exercises[activeIndex]
    if (!exercise.load && exercise.muscleGroup !== 'cardio') {
      toast.error('Informe a carga antes de concluir a serie.')
      return
    }

    const setEntry = {
      setNumber: exercise.currentSet,
      load: Number(exercise.load) || 0,
      reps: exercise.actualReps || exercise.plannedReps,
      completedAt: new Date().toISOString(),
    }

    const nextCompletedSets = exercise.completedSets + 1
    const finishedExercise = nextCompletedSets >= exercise.plannedSets

    updateExercise(activeIndex, {
      completedSets: nextCompletedSets,
      currentSet: finishedExercise ? exercise.currentSet : exercise.currentSet + 1,
      completed: finishedExercise,
      seriesLog: [...exercise.seriesLog, setEntry],
    })

    setExerciseStartedAt(null)
    setExerciseElapsed(0)

    if (finishedExercise) {
      toast.success('Exercicio concluido.')
      setShowRestTimer(false)
      if (completedExercises + 1 >= exercises.length) {
        setShowSummary(true)
      }
      return
    }

    setShowRestTimer(true)
    toast.success('Serie concluida. Hora do descanso.')
  }

  async function saveProgress() {
    if (!session) return
    setSaving(true)
    try {
      await api.put(`/student/session/${session._id}`, {
        exercises,
        generalNotes: notes,
        feeling,
      })
      toast.success('Progresso salvo.')
    } catch {
      toast.error('Erro ao salvar progresso.')
    } finally {
      setSaving(false)
    }
  }

  async function finishWorkout() {
    if (!session) return
    setFinishing(true)
    try {
      await api.put(`/student/session/${session._id}`, {
        exercises,
        generalNotes: `${notes}\nSensacao do treino: ${feeling}/5`,
        rating: feeling,
        completed: true,
      })
      toast.success('Treino concluido.')
      navigate('/student')
    } catch {
      toast.error('Erro ao finalizar treino.')
    } finally {
      setFinishing(false)
    }
  }

  if (!workout) {
    return (
      <Layout title="Treino">
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={workout.name}>
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={() => navigate('/student')} className="inline-flex items-center gap-2 text-sm text-white/45 transition-colors hover:text-white">
            <ChevronLeft size={16} />
            Voltar
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">
              Sessao: <span className="font-mono text-brand-300">{formatClock(totalElapsedRef.current)}</span>
            </div>
            <button type="button" onClick={toggleSessionRunning} className="btn-secondary px-4 py-2 text-sm">
              {sessionRunning ? <Pause size={15} /> : <Play size={15} />}
              {sessionRunning ? 'Pausar sessao' : 'Retomar sessao'}
            </button>
            <button type="button" onClick={saveProgress} disabled={saving} className="btn-secondary px-4 py-2 text-sm">
              <Save size={15} />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-5">
            <div className="card overflow-hidden">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-white/30">Exercicio atual</p>
                  <h2 className="mt-2 text-2xl font-black text-white">
                    {currentExercise ? currentExercise.exerciseName : 'Treino concluido'}
                  </h2>
                  <p className="mt-2 text-sm text-white/45">
                    {currentExercise
                      ? `${currentExercise.completedSets}/${currentExercise.plannedSets} series concluidas • ${currentExercise.plannedReps}`
                      : 'Voce concluiu todos os exercicios desta sessao.'}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-white/35">Progresso</p>
                    <p className="mt-1 font-bold text-white">{progress}%</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-white/35">Series</p>
                    <p className="mt-1 font-bold text-white">{completedSeries}/{totalSeries}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-white/35">Timer</p>
                    <p className="mt-1 font-bold text-white">{formatShort(exerciseElapsed)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-500 via-brand-300 to-emerald-400 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {currentExercise ? (
              <div className="card">
                <ExerciseVisualizer exercise={currentExercise} active />

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="label">Carga (kg)</label>
                    <input
                      type="number"
                      min="0"
                      className="input"
                      value={currentExercise.load}
                      onChange={(event) => updateExercise(activeIndex, { load: event.target.value })}
                      placeholder="Ex: 20"
                    />
                  </div>
                  <div>
                    <label className="label">Repeticoes feitas</label>
                    <input
                      type="text"
                      className="input"
                      value={currentExercise.actualReps}
                      onChange={(event) => updateExercise(activeIndex, { actualReps: event.target.value })}
                      placeholder={currentExercise.plannedReps}
                    />
                  </div>
                  <div>
                    <label className="label">Observacoes</label>
                    <input
                      type="text"
                      className="input"
                      value={currentExercise.observations}
                      onChange={(event) => updateExercise(activeIndex, { observations: event.target.value })}
                      placeholder="Tecnica, dor, facilidade..."
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={startCurrentExercise} className="btn-primary flex-1">
                    <Play size={16} />
                    Iniciar exercicio
                  </button>
                  <button type="button" onClick={registerSet} className="btn-secondary flex-1">
                    <CheckCircle2 size={16} />
                    Concluir serie {currentExercise.currentSet}/{currentExercise.plannedSets}
                  </button>
                </div>

                {showRestTimer ? (
                  <div className="mt-5 rounded-3xl border border-brand-400/20 bg-brand-500/10">
                    <div className="border-b border-brand-400/15 px-4 py-3">
                      <p className="text-sm font-semibold text-brand-300">Cronometro de descanso</p>
                    </div>
                    <Timer defaultSeconds={currentExercise.restSeconds || 60} onComplete={() => setShowRestTimer(false)} />
                  </div>
                ) : null}

                {currentExercise.seriesLog.length ? (
                  <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 flex items-center gap-2 text-white">
                      <Sparkles size={15} className="text-brand-300" />
                      <p className="font-semibold">Historico do exercicio</p>
                    </div>
                    <div className="space-y-2 text-sm text-white/65">
                      {currentExercise.seriesLog.map((entry) => (
                        <div key={`${entry.setNumber}-${entry.completedAt}`} className="flex items-center justify-between rounded-2xl border border-white/10 px-3 py-2">
                          <span>Serie {entry.setNumber}</span>
                          <span>{entry.load} kg • {entry.reps}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="card">
              <div className="mb-4 flex items-center gap-2 text-white">
                <Clock3 size={16} className="text-brand-300" />
                <h3 className="font-bold">Fila do treino</h3>
              </div>
              <div className="space-y-3">
                {exercises.map((exercise, index) => (
                  <div
                    key={`${exercise.exerciseId}-${index}`}
                    className={`rounded-3xl border p-4 transition-all ${
                      index === activeIndex
                        ? 'border-brand-400/30 bg-brand-500/10'
                        : exercise.completed
                          ? 'border-emerald-400/25 bg-emerald-500/10'
                          : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{exercise.exerciseName}</p>
                        <p className="text-xs text-white/40">{exercise.plannedSets} series • {exercise.plannedReps}</p>
                      </div>
                      <span className={exercise.completed ? 'badge-success' : index === activeIndex ? 'badge-info' : 'badge-gray'}>
                        {exercise.completed ? 'Concluido' : index === activeIndex ? 'Atual' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="card">
              <div className="mb-3 flex items-center gap-2 text-white">
                <TimerReset size={16} className="text-brand-300" />
                <h3 className="font-bold">Resumo ao vivo</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-white/55">
                  <span>Exercicios concluidos</span>
                  <strong className="text-white">{completedExercises}/{exercises.length}</strong>
                </div>
                <div className="flex items-center justify-between text-white/55">
                  <span>Volume estimado</span>
                  <strong className="text-white">{estimatedVolume} kg</strong>
                </div>
                <div className="flex items-center justify-between text-white/55">
                  <span>Duracao planejada</span>
                  <strong className="text-white">{workout.estimatedDuration} min</strong>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold text-white">Observacoes do treino</h3>
              <textarea
                rows={5}
                className="input mt-4 resize-none"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Registre percepcao de esforco, dores, evolucao tecnica ou ajustes para a proxima sessao."
              />
            </div>

            <div className="card">
              <h3 className="font-bold text-white">Sensacao do treino</h3>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFeeling(value)}
                    className={`rounded-2xl border px-3 py-3 text-lg font-bold transition-all ${
                      value <= feeling ? 'border-amber-400/30 bg-amber-500/15 text-amber-300' : 'border-white/10 bg-white/5 text-white/45'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" onClick={() => setShowSummary(true)} className="btn-primary w-full">
              <Trophy size={16} />
              Finalizar e revisar
            </button>
          </div>
        </div>

        {showSummary ? (
          <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-0 sm:items-center sm:justify-center sm:p-6">
            <div className="w-full rounded-t-[2rem] border border-white/10 bg-dark-800 p-5 shadow-2xl sm:max-w-2xl sm:rounded-[2rem]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-white/30">Resumo final</p>
                  <h3 className="mt-2 text-2xl font-black text-white">{workout.name}</h3>
                </div>
                <button type="button" onClick={() => setShowSummary(false)} className="btn-secondary px-4 py-2 text-sm">Voltar</button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-white/35">Tempo total</p>
                  <p className="mt-1 font-bold text-white">{formatClock(summary.totalTime)}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-white/35">Exercicios</p>
                  <p className="mt-1 font-bold text-white">{summary.completedExercises}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-white/35">Volume</p>
                  <p className="mt-1 font-bold text-white">{summary.volume} kg</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-white/35">Sensacao</p>
                  <p className="mt-1 font-bold text-white">{feeling}/5</p>
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                <p className="font-semibold text-white">Observacoes</p>
                <p className="mt-2 whitespace-pre-line">{notes || 'Sem observacoes registradas nesta sessao.'}</p>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={saveProgress} disabled={saving} className="btn-secondary flex-1">
                  <Save size={16} />
                  {saving ? 'Salvando...' : 'Salvar rascunho'}
                </button>
                <button type="button" onClick={finishWorkout} disabled={finishing} className="btn-primary flex-1">
                  <CheckCircle2 size={16} />
                  {finishing ? 'Concluindo...' : 'Concluir treino'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  )
}
