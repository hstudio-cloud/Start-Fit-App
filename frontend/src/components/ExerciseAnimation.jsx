import { resolveExerciseAnimation } from '../data/exerciseAnimations'

function Limb({ className }) {
  return <div className={`exercise-limb ${className}`} />
}

export default function ExerciseAnimation({ exercise, size = 'md', highlighted = false }) {
  const animation = resolveExerciseAnimation(exercise)

  return (
    <div
      className={`exercise-animation-shell ${size} ${highlighted ? 'highlighted' : ''}`}
      data-family={animation.family}
      data-muscle={animation.muscleGroup}
    >
      <div className="exercise-animation-stage">
        <div className="exercise-figure">
          <div className="exercise-head" />
          <div className="exercise-body" />
          <Limb className="arm left" />
          <Limb className="arm right" />
          <Limb className="leg left" />
          <Limb className="leg right" />
          <div className="exercise-prop bar" />
          <div className="exercise-prop bench" />
          <div className="exercise-prop cable" />
          <div className="exercise-prop pedal left" />
          <div className="exercise-prop pedal right" />
          <div className="exercise-floor" />
        </div>
      </div>

      <div className="exercise-animation-caption">
        <span>{animation.label}</span>
        <small>Animacao demo local</small>
      </div>
    </div>
  )
}
