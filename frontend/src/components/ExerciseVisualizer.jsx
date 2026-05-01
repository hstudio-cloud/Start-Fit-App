import { PlayCircle } from 'lucide-react'

const animationLabels = {
  push: 'Empurrar',
  pull: 'Puxar',
  squat: 'Agachamento',
  lunge: 'Avanco',
  curl: 'Rosca',
  press: 'Press',
  plank: 'Prancha',
  crunch: 'Abdominal',
  calf: 'Panturrilha',
  hinge: 'Levantamento',
  generic: 'Movimento guiado',
}

export default function ExerciseVisualizer({ exercise }) {
  const animationKey = exercise?.animationKey || 'generic'
  const videoUrl = exercise?.videoUrl
  const label = animationLabels[animationKey] || animationLabels.generic

  return (
    <div className="rounded-2xl border border-white/10 bg-dark-700/70 p-4">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/30">Visualizacao</p>
          <p className="text-sm font-semibold text-white">{label}</p>
        </div>
        {videoUrl ? (
          <a
            href={videoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-brand-400/30 bg-brand-500/10 px-3 py-2 text-xs font-semibold text-brand-300 transition-colors hover:bg-brand-500/20"
          >
            <PlayCircle size={14} />
            Video
          </a>
        ) : null}
      </div>

      <div className="exercise-visualizer">
        <div className={`exercise-figure animation-${animationKey}`}>
          <span className="figure-head" />
          <span className="figure-body" />
          <span className="figure-arm left" />
          <span className="figure-arm right" />
          <span className="figure-leg left" />
          <span className="figure-leg right" />
          <span className="figure-bar" />
          <span className="figure-floor" />
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-white/50">
        Use a animacao como referencia visual rapida. Se precisar, abra o video e confirme a execucao antes de iniciar a serie.
      </p>
    </div>
  )
}
