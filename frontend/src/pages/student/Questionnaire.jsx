import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { Activity, ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const steps = ['Objetivo', 'Perfil Físico', 'Disponibilidade', 'Músculo e Limitações']

const objectives = [
  { id: 'emagrecer', label: 'Emagrecer', emoji: '🔥', desc: 'Queimar gordura e perder peso' },
  { id: 'ganhar_massa', label: 'Ganhar Massa', emoji: '💪', desc: 'Aumentar músculo e força' },
  { id: 'condicionamento', label: 'Condicionamento', emoji: '⚡', desc: 'Melhorar resistência física' },
  { id: 'saude', label: 'Saúde Geral', emoji: '❤️', desc: 'Manter qualidade de vida' },
  { id: 'força', label: 'Força', emoji: '🏋️', desc: 'Aumentar força máxima' },
]

const levels = [
  { id: 'iniciante', label: 'Iniciante', desc: 'Menos de 6 meses de treino' },
  { id: 'intermediario', label: 'Intermediário', desc: '6 meses a 2 anos de treino' },
  { id: 'avancado', label: 'Avançado', desc: 'Mais de 2 anos de treino' },
]

const weekDays = [
  { id: 0, label: 'Dom' }, { id: 1, label: 'Seg' }, { id: 2, label: 'Ter' },
  { id: 3, label: 'Qua' }, { id: 4, label: 'Qui' }, { id: 5, label: 'Sex' }, { id: 6, label: 'Sáb' },
]

const muscleGroups = [
  { id: 'peito', label: 'Peito', emoji: '💪' }, { id: 'costas', label: 'Costas', emoji: '🏋️' },
  { id: 'pernas', label: 'Pernas', emoji: '🦵' }, { id: 'ombros', label: 'Ombros', emoji: '⚡' },
  { id: 'biceps', label: 'Bíceps', emoji: '💪' }, { id: 'triceps', label: 'Tríceps', emoji: '🦾' },
  { id: 'abdomen', label: 'Abdômen', emoji: '🎯' }, { id: 'cardio', label: 'Cardio', emoji: '🏃' },
]

export default function Questionnaire() {
  const { refreshStudent } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    objective: '', level: '', availableDays: [], timePerWorkout: 60,
    focusMuscles: [], routine: '', physicalLimitations: '',
    weight: '', height: '', age: '', gender: 'masculino',
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const toggle = (k, v) => set(k, form[k].includes(v) ? form[k].filter(x => x !== v) : [...form[k], v])

  const validate = () => {
    if (step === 0 && !form.objective) { toast.error('Selecione um objetivo.'); return false }
    if (step === 1) {
      if (!form.level) { toast.error('Selecione seu nível.'); return false }
      if (!form.weight || !form.height || !form.age) { toast.error('Preencha peso, altura e idade.'); return false }
    }
    if (step === 2 && form.availableDays.length === 0) { toast.error('Selecione pelo menos 1 dia disponível.'); return false }
    return true
  }

  const handleNext = () => {
    if (!validate()) return
    if (step < steps.length - 1) setStep(s => s + 1)
    else handleSubmit()
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await api.post('/student/questionnaire', form)
      await refreshStudent()
      toast.success('Questionário salvo! Seus treinos foram gerados 🎉')
      navigate('/student')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao salvar questionário.')
    } finally {
      setLoading(false)
    }
  }

  const imc = form.weight && form.height
    ? (form.weight / ((form.height / 100) ** 2)).toFixed(1)
    : null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #070b10 0%, #0d1f2d 100%)' }}>
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-300 flex items-center justify-center">
            <Activity size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">StartFit</h1>
            <p className="text-xs text-brand-300">Questionário Fitness Inicial</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={`h-1.5 w-full rounded-full transition-all duration-300 ${i <= step ? 'bg-brand-400' : 'bg-white/10'}`} />
              <span className={`text-xs hidden sm:block ${i === step ? 'text-brand-300' : 'text-white/30'}`}>{s}</span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="card animate-slide-in">
          <h2 className="text-xl font-bold text-white mb-1">{steps[step]}</h2>
          <p className="text-white/40 text-sm mb-6">Passo {step + 1} de {steps.length}</p>

          {/* Step 0: Objective */}
          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {objectives.map((o) => (
                <button key={o.id} onClick={() => set('objective', o.id)}
                  className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                    form.objective === o.id
                      ? 'bg-brand-500/20 border-brand-400 shadow-lg'
                      : 'bg-white/3 border-white/10 hover:border-white/20'
                  }`}>
                  <span className="text-2xl mb-2 block">{o.emoji}</span>
                  <p className="text-white font-semibold text-sm">{o.label}</p>
                  <p className="text-white/40 text-xs mt-0.5">{o.desc}</p>
                </button>
              ))}
            </div>
          )}

          {/* Step 1: Physical Profile */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="label">Nível de Experiência</label>
                <div className="grid grid-cols-3 gap-2">
                  {levels.map((l) => (
                    <button key={l.id} onClick={() => set('level', l.id)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        form.level === l.id ? 'bg-brand-500/20 border-brand-400' : 'bg-white/3 border-white/10 hover:border-white/20'
                      }`}>
                      <p className="text-white font-semibold text-sm">{l.label}</p>
                      <p className="text-white/40 text-xs mt-0.5">{l.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Gênero</label>
                <div className="grid grid-cols-3 gap-2">
                  {[['masculino','Masculino'],['feminino','Feminino'],['outro','Outro']].map(([v,l]) => (
                    <button key={v} onClick={() => set('gender', v)}
                      className={`p-2.5 rounded-lg border text-sm transition-all ${
                        form.gender === v ? 'bg-brand-500/20 border-brand-400 text-white' : 'bg-white/3 border-white/10 text-white/60 hover:border-white/20'
                      }`}>{l}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[['weight','Peso (kg)','75'],['height','Altura (cm)','175'],['age','Idade','25']].map(([k,l,p]) => (
                  <div key={k}>
                    <label className="label">{l}</label>
                    <input className="input" type="number" placeholder={p} value={form[k]} onChange={e => set(k, e.target.value)} />
                  </div>
                ))}
              </div>

              {imc && (
                <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
                  <p className="text-brand-300 text-sm font-semibold">Seu IMC: <span className="text-white">{imc}</span></p>
                  <p className="text-white/40 text-xs mt-0.5">Calculado automaticamente com base no peso e altura informados.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Availability */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="label">Dias disponíveis para treinar</label>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((d) => (
                    <button key={d.id} onClick={() => toggle('availableDays', d.id)}
                      className={`p-2 rounded-lg border text-center text-sm font-semibold transition-all ${
                        form.availableDays.includes(d.id)
                          ? 'bg-brand-500/20 border-brand-400 text-brand-300'
                          : 'bg-white/3 border-white/10 text-white/50 hover:border-white/20'
                      }`}>
                      {d.label}
                    </button>
                  ))}
                </div>
                <p className="text-white/30 text-xs mt-2">{form.availableDays.length} dia(s) selecionado(s)</p>
              </div>

              <div>
                <label className="label">Tempo disponível por treino: <span className="text-brand-300">{form.timePerWorkout} min</span></label>
                <input type="range" min={30} max={120} step={15} value={form.timePerWorkout}
                  onChange={e => set('timePerWorkout', Number(e.target.value))}
                  className="w-full accent-brand-500" />
                <div className="flex justify-between text-xs text-white/30 mt-1">
                  <span>30 min</span><span>75 min</span><span>120 min</span>
                </div>
              </div>

              <div>
                <label className="label">Rotina diária</label>
                <textarea className="input resize-none" rows={3} placeholder="Ex: Trabalho das 8h às 17h, estudo à noite..."
                  value={form.routine} onChange={e => set('routine', e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 3: Muscles & Limitations */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="label">Grupos musculares de foco (opcional)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {muscleGroups.map((m) => (
                    <button key={m.id} onClick={() => toggle('focusMuscles', m.id)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        form.focusMuscles.includes(m.id)
                          ? 'bg-brand-500/20 border-brand-400'
                          : 'bg-white/3 border-white/10 hover:border-white/20'
                      }`}>
                      <span className="text-lg block mb-1">{m.emoji}</span>
                      <p className="text-white text-xs font-medium">{m.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Limitações físicas ou lesões</label>
                <textarea className="input resize-none" rows={3}
                  placeholder="Ex: Dor no joelho esquerdo, hérnia de disco, cirurgia recente..."
                  value={form.physicalLimitations} onChange={e => set('physicalLimitations', e.target.value)} />
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-emerald-400 text-sm font-semibold mb-1">✅ Tudo pronto!</p>
                <p className="text-white/50 text-xs">
                  Com base nas suas respostas, vamos gerar um plano de treino personalizado
                  com {form.availableDays.length || 3} treino(s) por semana focado em <strong className="text-white">
                  {objectives.find(o => o.id === form.objective)?.label || 'saúde'}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex-1">
                <ChevronLeft size={18} /> Voltar
              </button>
            )}
            <button onClick={handleNext} className="btn-primary flex-1" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {step === steps.length - 1
                ? (loading ? 'Gerando treinos...' : 'Concluir e Gerar Treinos')
                : (<>Próximo <ChevronRight size={18} /></>)
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
