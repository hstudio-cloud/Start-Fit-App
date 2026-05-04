import { Eye, TimerReset } from 'lucide-react'
import ExerciseAnimation from './ExerciseAnimation'
import { buildExercisePresentation } from '../data/exerciseAnimations'

export default function AnimatedExerciseCard({ exercise, onOpen, compact = false, active = false }) {
  const item = buildExercisePresentation(exercise)

  return (
    <button
      type="button"
      onClick={() => onOpen?.(item)}
      className={`w-full rounded-3xl border text-left transition-all ${
        active
          ? 'border-brand-400/40 bg-brand-500/10 shadow-[0_20px_50px_rgba(0,150,199,0.16)]'
          : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
      }`}
    >
      <div className={`grid gap-4 ${compact ? 'p-3 sm:grid-cols-[140px_1fr]' : 'p-4 sm:grid-cols-[180px_1fr]'}`}>
        <ExerciseAnimation exercise={item} size={compact ? 'sm' : 'md'} highlighted={active} />
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/30">{item.muscleGroup}</p>
              <h3 className="mt-2 text-lg font-bold text-white">{item.exerciseName || item.name}</h3>
            </div>
            <span className="badge-info whitespace-nowrap">{item.animation.source === 'muscleGroup' ? 'fallback' : 'animado'}</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/55">
            <span className="rounded-full border border-white/10 px-3 py-1">{item.plannedSets || item.sets} series</span>
            <span className="rounded-full border border-white/10 px-3 py-1">{item.plannedReps || item.reps}</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1">
              <TimerReset size={12} />
              {item.restSeconds}s descanso
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="exercise-copy-snippet text-white/45">{item.instructions}</p>
            <span className="ml-4 inline-flex items-center gap-2 text-brand-300">
              <Eye size={15} />
              Ver execucao
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}
