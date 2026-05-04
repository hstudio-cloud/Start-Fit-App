import { AlertTriangle, PlayCircle, ShieldCheck, X } from 'lucide-react'
import ExerciseAnimation from './ExerciseAnimation'
import { buildExercisePresentation } from '../data/exerciseAnimations'

export default function ExerciseDemoModal({ exercise, open, onClose }) {
  if (!open || !exercise) return null

  const item = buildExercisePresentation(exercise)

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-0 backdrop-blur-md sm:items-center sm:justify-center sm:p-6">
      <div className="w-full rounded-t-[2rem] border border-white/10 bg-dark-800 shadow-2xl sm:max-w-3xl sm:rounded-[2rem]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/30">{item.muscleGroup}</p>
            <h3 className="text-xl font-bold text-white">{item.exerciseName || item.name}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-white/10 p-2 text-white/60 transition-colors hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-[1.15fr_0.85fr]">
          <ExerciseAnimation exercise={item} size="lg" highlighted />

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-white/35">Series</p>
                <p className="mt-1 font-bold text-white">{item.plannedSets || item.sets}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-white/35">Reps</p>
                <p className="mt-1 font-bold text-white">{item.plannedReps || item.reps}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-white/35">Descanso</p>
                <p className="mt-1 font-bold text-white">{item.restSeconds}s</p>
              </div>
            </div>

            <div className="rounded-3xl border border-brand-500/20 bg-brand-500/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-brand-300">
                <PlayCircle size={16} />
                <p className="font-semibold">Execucao</p>
              </div>
              <p className="text-sm leading-relaxed text-white/70">{item.instructions}</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-white">
                <AlertTriangle size={16} className="text-amber-400" />
                <p className="font-semibold">Erros comuns</p>
              </div>
              <ul className="space-y-2 text-sm text-white/65">
                {item.commonMistakes.map((mistake) => <li key={mistake}>• {mistake}</li>)}
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-white">
                <ShieldCheck size={16} className="text-emerald-400" />
                <p className="font-semibold">Cuidados e dicas</p>
              </div>
              <ul className="space-y-2 text-sm text-white/65">
                {item.tips.map((tip) => <li key={tip}>• {tip}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
