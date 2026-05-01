import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../services/api'
import {
  ChevronDown, ChevronUp, Dumbbell, Loader2, MessageSquare, Plus, Save, Search, Soup, TrendingUp,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

const dayLabels = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-dark-700 p-3 text-xs shadow-xl">
        <p className="mb-1 text-white/50">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="font-semibold">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const createMeal = () => ({ title: '', time: '', foods: [''], notes: '' })

const buildDietDraft = (diet) => ({
  title: diet?.title || 'Plano alimentar personalizado',
  goal: diet?.goal || '',
  hydrationLiters: String(diet?.hydrationLiters || 2),
  caloriesTarget: String(diet?.caloriesTarget || ''),
  meals: diet?.meals?.length
    ? diet.meals.map((meal) => ({
        title: meal.title || '',
        time: meal.time || '',
        foods: meal.foods?.length ? [...meal.foods] : [''],
        notes: meal.notes || '',
      }))
    : [createMeal(), createMeal()],
  tipsText: diet?.tips?.join('\n') || '',
  notes: diet?.notes || '',
})

const buildWorkoutDraft = (workout) => ({
  name: workout.name || '',
  weekDay: String(workout.weekDay ?? 0),
  objective: workout.objective || '',
  estimatedDuration: String(workout.estimatedDuration || 60),
  exercises: (workout.exercises || []).map((exercise) => ({
    exerciseId: exercise.exerciseId || '',
    name: exercise.name || '',
    sets: String(exercise.sets || 4),
    reps: exercise.reps || '8-12',
  })),
})

export default function TeacherStudents() {
  const [students, setStudents] = useState([])
  const [exerciseLibrary, setExerciseLibrary] = useState([])
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [detail, setDetail] = useState({})
  const [loading, setLoading] = useState(true)
  const [noteTextByStudent, setNoteTextByStudent] = useState({})
  const [savingNoteFor, setSavingNoteFor] = useState(null)
  const [workoutDrafts, setWorkoutDrafts] = useState({})
  const [savingWorkoutId, setSavingWorkoutId] = useState(null)
  const [dietDrafts, setDietDrafts] = useState({})
  const [savingDietFor, setSavingDietFor] = useState(null)

  useEffect(() => {
    fetchStudents()
    fetchExerciseLibrary()
  }, [])

  const fetchStudents = async () => {
    try {
      const res = await api.get('/teacher/students')
      setStudents(res.data.students || [])
    } catch {
      toast.error('Erro ao carregar alunos.')
    } finally {
      setLoading(false)
    }
  }

  const fetchExerciseLibrary = async () => {
    try {
      const res = await api.get('/teacher/exercises/library')
      setExerciseLibrary(res.data.exercises || [])
    } catch {
      toast.error('Erro ao carregar biblioteca de exercicios.')
    }
  }

  const fetchDetail = async (studentId) => {
    try {
      const res = await api.get(`/teacher/students/${studentId}`)
      const payload = res.data
      setDetail((current) => ({ ...current, [studentId]: payload }))
      setWorkoutDrafts((current) => {
        const next = { ...current }
        ;(payload.workouts || []).forEach((workout) => {
          if (!next[workout._id]) next[workout._id] = buildWorkoutDraft(workout)
        })
        return next
      })
      setDietDrafts((current) => ({
        ...current,
        [studentId]: current[studentId] || buildDietDraft(payload.diets?.[0]),
      }))
    } catch {
      toast.error('Erro ao carregar detalhes.')
    }
  }

  const toggleExpand = async (studentId) => {
    if (expanded === studentId) {
      setExpanded(null)
      return
    }
    setExpanded(studentId)
    await fetchDetail(studentId)
  }

  const addNote = async (studentId) => {
    const text = noteTextByStudent[studentId]?.trim()
    if (!text) {
      toast.error('Escreva um feedback para o aluno.')
      return
    }

    setSavingNoteFor(studentId)
    try {
      await api.post(`/teacher/students/${studentId}/notes`, { text })
      setNoteTextByStudent((current) => ({ ...current, [studentId]: '' }))
      await fetchDetail(studentId)
      toast.success('Feedback salvo.')
    } catch {
      toast.error('Erro ao salvar feedback.')
    } finally {
      setSavingNoteFor(null)
    }
  }

  const updateWorkoutDraft = (workoutId, field, value) => {
    setWorkoutDrafts((current) => ({
      ...current,
      [workoutId]: { ...current[workoutId], [field]: value },
    }))
  }

  const updateWorkoutExercise = (workoutId, index, field, value) => {
    setWorkoutDrafts((current) => {
      const exercises = [...(current[workoutId]?.exercises || [])]
      const currentExercise = exercises[index] || { exerciseId: '', name: '', sets: '4', reps: '8-12' }
      exercises[index] = { ...currentExercise, [field]: value }

      if (field === 'exerciseId') {
        const selected = exerciseLibrary.find((exercise) => exercise.id === value)
        exercises[index] = {
          ...exercises[index],
          name: selected?.name || '',
        }
      }

      return {
        ...current,
        [workoutId]: { ...current[workoutId], exercises },
      }
    })
  }

  const addWorkoutExercise = (workoutId) => {
    setWorkoutDrafts((current) => ({
      ...current,
      [workoutId]: {
        ...current[workoutId],
        exercises: [...(current[workoutId]?.exercises || []), { exerciseId: '', name: '', sets: '4', reps: '8-12' }],
      },
    }))
  }

  const saveWorkout = async (studentId, workoutId) => {
    const draft = workoutDrafts[workoutId]
    if (!draft?.name || !(draft.exercises || []).length) {
      toast.error('Treino precisa de nome e exercicios.')
      return
    }

    setSavingWorkoutId(workoutId)
    try {
      await api.put(`/teacher/students/${studentId}/workouts/${workoutId}`, {
        name: draft.name,
        weekDay: Number(draft.weekDay || 0),
        objective: draft.objective,
        estimatedDuration: Number(draft.estimatedDuration || 60),
        exercises: draft.exercises
          .filter((exercise) => exercise.exerciseId || exercise.name)
          .map((exercise) => ({
            exerciseId: exercise.exerciseId,
            name: exercise.name,
            sets: Number(exercise.sets || 4),
            reps: exercise.reps || '8-12',
          })),
      })
      await fetchDetail(studentId)
      toast.success('Treino atualizado.')
    } catch {
      toast.error('Erro ao atualizar treino.')
    } finally {
      setSavingWorkoutId(null)
    }
  }

  const updateDietDraft = (studentId, field, value) => {
    setDietDrafts((current) => ({
      ...current,
      [studentId]: { ...current[studentId], [field]: value },
    }))
  }

  const updateMeal = (studentId, mealIndex, field, value) => {
    setDietDrafts((current) => {
      const draft = current[studentId]
      const meals = [...draft.meals]
      meals[mealIndex] = { ...meals[mealIndex], [field]: value }
      return { ...current, [studentId]: { ...draft, meals } }
    })
  }

  const updateMealFood = (studentId, mealIndex, foodIndex, value) => {
    setDietDrafts((current) => {
      const draft = current[studentId]
      const meals = [...draft.meals]
      const foods = [...meals[mealIndex].foods]
      foods[foodIndex] = value
      meals[mealIndex] = { ...meals[mealIndex], foods }
      return { ...current, [studentId]: { ...draft, meals } }
    })
  }

  const addMeal = (studentId) => {
    setDietDrafts((current) => ({
      ...current,
      [studentId]: {
        ...current[studentId],
        meals: [...current[studentId].meals, createMeal()],
      },
    }))
  }

  const addMealFood = (studentId, mealIndex) => {
    setDietDrafts((current) => {
      const draft = current[studentId]
      const meals = [...draft.meals]
      meals[mealIndex] = { ...meals[mealIndex], foods: [...meals[mealIndex].foods, ''] }
      return { ...current, [studentId]: { ...draft, meals } }
    })
  }

  const saveDiet = async (studentId) => {
    const studentDetail = detail[studentId]
    const currentDiet = studentDetail?.diets?.[0]
    const draft = dietDrafts[studentId]
    if (!draft?.title) {
      toast.error('Informe o titulo da dieta.')
      return
    }

    const payload = {
      title: draft.title,
      goal: draft.goal,
      hydrationLiters: Number(draft.hydrationLiters || 0),
      caloriesTarget: Number(draft.caloriesTarget || 0),
      meals: draft.meals
        .map((meal) => ({
          title: meal.title,
          time: meal.time,
          foods: meal.foods.filter(Boolean),
          notes: meal.notes,
        }))
        .filter((meal) => meal.title || meal.foods.length),
      tips: draft.tipsText.split('\n').map((tip) => tip.trim()).filter(Boolean),
      notes: draft.notes,
    }

    setSavingDietFor(studentId)
    try {
      if (currentDiet?._id) {
        await api.put(`/teacher/students/${studentId}/diets/${currentDiet._id}`, payload)
      } else {
        await api.post(`/teacher/students/${studentId}/diets`, payload)
      }
      await fetchDetail(studentId)
      toast.success('Plano alimentar salvo.')
    } catch {
      toast.error('Erro ao salvar dieta.')
    } finally {
      setSavingDietFor(null)
    }
  }

  const filteredStudents = students.filter((student) => (
    student.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    student.user?.email?.toLowerCase().includes(search.toLowerCase())
  ))

  const objectiveLabel = {
    emagrecer: 'Emagrecer',
    ganhar_massa: 'Ganhar Massa',
    condicionamento: 'Condicionamento',
    saude: 'Saude',
    forca: 'Forca',
  }

  return (
    <Layout title="Meus Alunos">
      <div className="mx-auto max-w-6xl space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-white">Meus Alunos</h2>
          <p className="text-sm text-white/40">{students.length} alunos vinculados</p>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            className="input pl-10"
            placeholder="Buscar aluno..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="card py-12 text-center text-white/30">Nenhum aluno encontrado.</div>
        ) : (
          <div className="space-y-3">
            {filteredStudents.map((student) => {
              const isExpanded = expanded === student._id
              const studentDetail = detail[student._id]
              const progressData = studentDetail?.progress?.map((entry) => ({
                date: format(new Date(entry.date), 'dd/MM'),
                Peso: entry.weight,
                IMC: entry.imc,
              })) || []
              const activeDiet = studentDetail?.diets?.[0]
              const dietDraft = dietDrafts[student._id]

              return (
                <div key={student._id} className={`card overflow-hidden p-0 transition-all ${isExpanded ? 'border-brand-500/30' : 'border-white/5'}`}>
                  <button type="button" className="flex w-full items-center gap-3 p-4 text-left" onClick={() => toggleExpand(student._id)}>
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-base font-bold text-brand-300">
                      {student.user?.name?.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white">{student.user?.name}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-3">
                        {student.questionnaire?.objective ? (
                          <span className="text-xs text-white/40">{objectiveLabel[student.questionnaire.objective]}</span>
                        ) : null}
                        {student.questionnaire?.level ? (
                          <span className="text-xs capitalize text-white/30">{student.questionnaire.level}</span>
                        ) : null}
                        <span className="text-xs text-white/30">
                          {student.totalWorkouts || 0} treinos concluidos
                        </span>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="flex-shrink-0 text-white/40" /> : <ChevronDown size={16} className="flex-shrink-0 text-white/40" />}
                  </button>

                  {isExpanded ? (
                    <div className="space-y-5 border-t border-white/5 p-4">
                      {!studentDetail ? (
                        <div className="flex justify-center py-8">
                          <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                        </div>
                      ) : (
                        <>
                          {studentDetail.student?.questionnaireCompleted ? (
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                              {[
                                { label: 'Peso', value: `${studentDetail.student.questionnaire?.weight || '--'}kg` },
                                { label: 'IMC', value: studentDetail.student.imc || '--' },
                                { label: 'Altura', value: `${studentDetail.student.questionnaire?.height || '--'}cm` },
                                { label: 'Limitacoes', value: studentDetail.student.questionnaire?.physicalLimitations || 'Nenhuma' },
                              ].map((item) => (
                                <div key={item.label} className="rounded-xl border border-white/5 bg-white/5 p-3">
                                  <p className="text-xs text-white/40">{item.label}</p>
                                  <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
                                </div>
                              ))}
                            </div>
                          ) : null}

                          {progressData.length > 1 ? (
                            <div className="card-sm">
                              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                                <TrendingUp size={14} className="text-brand-300" /> Evolucao de peso
                              </h4>
                              <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={progressData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Line type="monotone" dataKey="Peso" stroke="#0096c7" strokeWidth={2} dot={{ r: 3, fill: '#0096c7' }} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          ) : null}

                          <div className="space-y-4">
                            <div className="flex items-center justify-between gap-3">
                              <h4 className="flex items-center gap-2 text-sm font-semibold text-white">
                                <Dumbbell size={14} className="text-brand-300" /> Treinos ajustaveis
                              </h4>
                              <span className="text-xs text-white/35">Use a biblioteca da plataforma</span>
                            </div>

                            {(studentDetail.workouts || []).map((workout) => {
                              const draft = workoutDrafts[workout._id]
                              if (!draft) return null
                              return (
                                <div key={workout._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                  <div className="grid gap-3 md:grid-cols-4">
                                    <input className="input md:col-span-2" value={draft.name} onChange={(event) => updateWorkoutDraft(workout._id, 'name', event.target.value)} placeholder="Nome do treino" />
                                    <select className="input" value={draft.weekDay} onChange={(event) => updateWorkoutDraft(workout._id, 'weekDay', event.target.value)}>
                                      {dayLabels.map((label, index) => (
                                        <option key={label} value={index}>{label}</option>
                                      ))}
                                    </select>
                                    <input className="input" value={draft.estimatedDuration} onChange={(event) => updateWorkoutDraft(workout._id, 'estimatedDuration', event.target.value)} placeholder="Duracao" />
                                  </div>

                                  <input className="input mt-3" value={draft.objective} onChange={(event) => updateWorkoutDraft(workout._id, 'objective', event.target.value)} placeholder="Objetivo do treino" />

                                  <div className="mt-4 space-y-3">
                                    {draft.exercises.map((exercise, index) => (
                                      <div key={`${workout._id}-${index}`} className="grid gap-3 rounded-xl border border-white/10 bg-dark-900/40 p-3 md:grid-cols-[2fr_0.8fr_0.8fr]">
                                        <select className="input" value={exercise.exerciseId} onChange={(event) => updateWorkoutExercise(workout._id, index, 'exerciseId', event.target.value)}>
                                          <option value="">Selecione um exercicio</option>
                                          {exerciseLibrary.map((libraryExercise) => (
                                            <option key={libraryExercise.id} value={libraryExercise.id}>{libraryExercise.name}</option>
                                          ))}
                                        </select>
                                        <input className="input" value={exercise.sets} onChange={(event) => updateWorkoutExercise(workout._id, index, 'sets', event.target.value)} placeholder="Series" />
                                        <input className="input" value={exercise.reps} onChange={(event) => updateWorkoutExercise(workout._id, index, 'reps', event.target.value)} placeholder="Reps" />
                                      </div>
                                    ))}
                                  </div>

                                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                    <button type="button" onClick={() => addWorkoutExercise(workout._id)} className="btn-secondary">
                                      <Plus size={14} /> Adicionar exercicio
                                    </button>
                                    <button type="button" onClick={() => saveWorkout(student._id, workout._id)} disabled={savingWorkoutId === workout._id} className="btn-primary sm:ml-auto">
                                      {savingWorkoutId === workout._id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                      Salvar treino
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between gap-3">
                              <h4 className="flex items-center gap-2 text-sm font-semibold text-white">
                                <Soup size={14} className="text-brand-300" /> Dieta personalizada
                              </h4>
                              <span className="text-xs text-white/35">{activeDiet ? 'Editando plano atual' : 'Criando plano novo'}</span>
                            </div>

                            {dietDraft ? (
                              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="grid gap-3 md:grid-cols-2">
                                  <input className="input" value={dietDraft.title} onChange={(event) => updateDietDraft(student._id, 'title', event.target.value)} placeholder="Titulo da dieta" />
                                  <input className="input" value={dietDraft.goal} onChange={(event) => updateDietDraft(student._id, 'goal', event.target.value)} placeholder="Objetivo alimentar" />
                                  <input className="input" value={dietDraft.hydrationLiters} onChange={(event) => updateDietDraft(student._id, 'hydrationLiters', event.target.value)} placeholder="Litros de agua" />
                                  <input className="input" value={dietDraft.caloriesTarget} onChange={(event) => updateDietDraft(student._id, 'caloriesTarget', event.target.value)} placeholder="Calorias alvo" />
                                </div>

                                <div className="mt-4 space-y-3">
                                  {dietDraft.meals.map((meal, mealIndex) => (
                                    <div key={`${student._id}-meal-${mealIndex}`} className="rounded-xl border border-white/10 bg-dark-900/40 p-3">
                                      <div className="grid gap-3 md:grid-cols-2">
                                        <input className="input" value={meal.title} onChange={(event) => updateMeal(student._id, mealIndex, 'title', event.target.value)} placeholder="Refeicao" />
                                        <input className="input" value={meal.time} onChange={(event) => updateMeal(student._id, mealIndex, 'time', event.target.value)} placeholder="Horario" />
                                      </div>
                                      <div className="mt-3 space-y-2">
                                        {meal.foods.map((food, foodIndex) => (
                                          <input key={`${student._id}-meal-${mealIndex}-food-${foodIndex}`} className="input" value={food} onChange={(event) => updateMealFood(student._id, mealIndex, foodIndex, event.target.value)} placeholder="Alimento" />
                                        ))}
                                      </div>
                                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                                        <button type="button" onClick={() => addMealFood(student._id, mealIndex)} className="btn-secondary">
                                          <Plus size={14} /> Adicionar alimento
                                        </button>
                                      </div>
                                      <textarea className="input mt-3 resize-none" rows={2} value={meal.notes} onChange={(event) => updateMeal(student._id, mealIndex, 'notes', event.target.value)} placeholder="Observacoes da refeicao" />
                                    </div>
                                  ))}
                                </div>

                                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                  <button type="button" onClick={() => addMeal(student._id)} className="btn-secondary">
                                    <Plus size={14} /> Adicionar refeicao
                                  </button>
                                </div>

                                <textarea className="input mt-4 resize-none" rows={3} value={dietDraft.tipsText} onChange={(event) => updateDietDraft(student._id, 'tipsText', event.target.value)} placeholder="Dicas do personal, uma por linha" />
                                <textarea className="input mt-3 resize-none" rows={3} value={dietDraft.notes} onChange={(event) => updateDietDraft(student._id, 'notes', event.target.value)} placeholder="Observacoes gerais" />

                                <button type="button" onClick={() => saveDiet(student._id)} disabled={savingDietFor === student._id} className="btn-primary mt-4">
                                  {savingDietFor === student._id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                  Salvar dieta
                                </button>
                              </div>
                            ) : null}
                          </div>

                          <div>
                            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                              <MessageSquare size={14} className="text-brand-300" /> Feedbacks do personal
                            </h4>

                            {studentDetail.student?.notes?.length ? (
                              <div className="mb-3 space-y-2">
                                {studentDetail.student.notes.slice().reverse().slice(0, 4).map((note, index) => (
                                  <div key={`${note.createdAt}-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <p className="text-xs leading-relaxed text-white/70">{note.text}</p>
                                    <p className="mt-1 text-xs text-white/30">
                                      {note.author} · {format(new Date(note.createdAt), 'dd/MM/yy HH:mm')}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : null}

                            <div className="flex flex-col gap-2 sm:flex-row">
                              <textarea
                                className="input min-h-[90px] flex-1 resize-none text-sm"
                                value={noteTextByStudent[student._id] || ''}
                                onChange={(event) => setNoteTextByStudent((current) => ({ ...current, [student._id]: event.target.value }))}
                                placeholder="Adicionar feedback para o aluno..."
                              />
                              <button type="button" onClick={() => addNote(student._id)} disabled={savingNoteFor === student._id} className="btn-primary self-end sm:self-auto">
                                {savingNoteFor === student._id ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                Salvar feedback
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
