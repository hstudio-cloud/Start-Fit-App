import { resolveExerciseAnimation } from '../data/exerciseAnimations'

const sceneByFamily = {
  bench: 'bench',
  'incline-bench': 'bench',
  fly: 'bench',
  'shoulder-press': 'press',
  'lat-pulldown': 'pulldown',
  row: 'row',
  'bent-row': 'row',
  'pull-up': 'pullup',
  squat: 'squat',
  'leg-press': 'legpress',
  'leg-extension': 'machine-leg',
  'leg-curl': 'machine-leg',
  lunge: 'lunge',
  calf: 'calf',
  curl: 'curl',
  'alternating-curl': 'curl',
  'hammer-curl': 'curl',
  pushdown: 'pushdown',
  'skull-crusher': 'bench',
  dip: 'dip',
  'lateral-raise': 'raise',
  'front-raise': 'raise',
  'push-up': 'pushup',
  plank: 'floor-core',
  crunch: 'floor-core',
  'leg-raise': 'floor-core',
  treadmill: 'treadmill',
  bike: 'bike',
  elliptical: 'elliptical',
}

function DemoSvg({ family, label }) {
  const scene = sceneByFamily[family] || 'generic'

  return (
    <svg viewBox="0 0 220 156" className={`exercise-demo-svg scene-${scene} family-${family}`} aria-label={label} role="img">
      <defs>
        <linearGradient id="sfBodyStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e8fbff" />
          <stop offset="100%" stopColor="#58d8f2" />
        </linearGradient>
        <linearGradient id="sfAccentStroke" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0ea5cf" />
          <stop offset="100%" stopColor="#7de7ff" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="220" height="156" rx="20" className="demo-bg" />
      <rect x="10" y="10" width="200" height="136" rx="16" className="demo-stage" />
      <path d="M22 122 H198" className="demo-floor" />

      <g className="demo-rig bench-rig">
        <rect x="62" y="98" width="94" height="8" rx="4" className="demo-machine" />
        <rect x="142" y="46" width="8" height="60" rx="4" className="demo-machine-muted" />
        <rect x="48" y="40" width="124" height="6" rx="3" className="demo-barbell" />
      </g>

      <g className="demo-rig cable-rig">
        <path d="M122 26 V86" className="demo-cable" />
        <path d="M88 30 H156" className="demo-machine" />
      </g>

      <g className="demo-rig bike-rig">
        <circle cx="88" cy="112" r="16" className="demo-wheel" />
        <circle cx="144" cy="112" r="16" className="demo-wheel" />
        <path d="M88 112 L116 86 L140 112" className="demo-machine" />
        <path d="M116 86 L132 66" className="demo-machine" />
        <path d="M118 80 L98 68" className="demo-machine-muted" />
      </g>

      <g className="demo-rig treadmill-rig">
        <rect x="58" y="102" width="102" height="20" rx="8" className="demo-machine" />
        <path d="M66 102 L78 72" className="demo-machine" />
        <path d="M152 102 L164 70" className="demo-machine" />
        <path d="M78 72 H150" className="demo-machine-muted" />
      </g>

      <g className="demo-rig legpress-rig">
        <path d="M60 40 L156 40 L184 106 L96 106 Z" className="demo-machine-ghost" />
        <path d="M76 94 L146 58" className="demo-machine" />
      </g>

      <g className="demo-person demo-bench">
        <circle cx="68" cy="82" r="10" className="demo-head" />
        <path d="M80 84 H126" className="demo-limb body-line" />
        <path d="M102 84 L96 56" className="demo-limb arm-left" />
        <path d="M114 84 L118 56" className="demo-limb arm-right" />
        <path d="M126 84 L148 92" className="demo-limb leg-left" />
        <path d="M126 84 L148 76" className="demo-limb leg-right" />
      </g>

      <g className="demo-person demo-press">
        <circle cx="108" cy="46" r="10" className="demo-head" />
        <path d="M108 58 L108 96" className="demo-limb body-line" />
        <path d="M108 70 L90 48" className="demo-limb arm-left" />
        <path d="M108 70 L126 48" className="demo-limb arm-right" />
        <path d="M108 96 L94 126" className="demo-limb leg-left" />
        <path d="M108 96 L122 126" className="demo-limb leg-right" />
        <path d="M80 38 H136" className="demo-barbell short" />
      </g>

      <g className="demo-person demo-pulldown">
        <circle cx="108" cy="56" r="10" className="demo-head" />
        <path d="M108 68 L108 104" className="demo-limb body-line" />
        <path d="M108 78 L90 48" className="demo-limb arm-left" />
        <path d="M108 78 L126 48" className="demo-limb arm-right" />
        <path d="M108 104 L94 126" className="demo-limb leg-left" />
        <path d="M108 104 L122 126" className="demo-limb leg-right" />
        <rect x="90" y="108" width="36" height="6" rx="3" className="demo-machine-muted" />
      </g>

      <g className="demo-person demo-row">
        <circle cx="86" cy="50" r="10" className="demo-head" />
        <path d="M92 58 L112 86" className="demo-limb body-line" />
        <path d="M108 78 L132 72" className="demo-limb arm-left" />
        <path d="M108 78 L132 84" className="demo-limb arm-right" />
        <path d="M112 86 L96 124" className="demo-limb leg-left" />
        <path d="M112 86 L128 124" className="demo-limb leg-right" />
        <path d="M130 78 H160" className="demo-barbell short" />
      </g>

      <g className="demo-person demo-pullup">
        <circle cx="108" cy="58" r="10" className="demo-head" />
        <path d="M108 70 L108 104" className="demo-limb body-line" />
        <path d="M108 76 L90 42" className="demo-limb arm-left" />
        <path d="M108 76 L126 42" className="demo-limb arm-right" />
        <path d="M108 104 L96 130" className="demo-limb leg-left" />
        <path d="M108 104 L120 130" className="demo-limb leg-right" />
        <path d="M76 34 H140" className="demo-barbell short" />
      </g>

      <g className="demo-person demo-squat">
        <circle cx="108" cy="42" r="10" className="demo-head" />
        <path d="M108 54 L108 88" className="demo-limb body-line" />
        <path d="M108 66 L86 78" className="demo-limb arm-left" />
        <path d="M108 66 L130 78" className="demo-limb arm-right" />
        <path d="M108 88 L88 118" className="demo-limb leg-left" />
        <path d="M108 88 L128 118" className="demo-limb leg-right" />
        <path d="M74 54 H142" className="demo-barbell short" />
      </g>

      <g className="demo-person demo-lunge">
        <circle cx="102" cy="42" r="10" className="demo-head" />
        <path d="M102 54 L102 86" className="demo-limb body-line" />
        <path d="M102 64 L82 82" className="demo-limb arm-left" />
        <path d="M102 64 L122 82" className="demo-limb arm-right" />
        <path d="M102 86 L84 122" className="demo-limb leg-left" />
        <path d="M102 86 L132 108" className="demo-limb leg-right" />
      </g>

      <g className="demo-person demo-curl">
        <circle cx="108" cy="42" r="10" className="demo-head" />
        <path d="M108 54 L108 92" className="demo-limb body-line" />
        <path d="M108 68 L88 92" className="demo-limb arm-left" />
        <path d="M108 68 L128 92" className="demo-limb arm-right" />
        <path d="M108 92 L94 126" className="demo-limb leg-left" />
        <path d="M108 92 L122 126" className="demo-limb leg-right" />
      </g>

      <g className="demo-person demo-pushdown">
        <circle cx="108" cy="42" r="10" className="demo-head" />
        <path d="M108 54 L108 92" className="demo-limb body-line" />
        <path d="M108 68 L94 92" className="demo-limb arm-left" />
        <path d="M108 68 L122 92" className="demo-limb arm-right" />
        <path d="M108 92 L94 126" className="demo-limb leg-left" />
        <path d="M108 92 L122 126" className="demo-limb leg-right" />
      </g>

      <g className="demo-person demo-raise">
        <circle cx="108" cy="42" r="10" className="demo-head" />
        <path d="M108 54 L108 92" className="demo-limb body-line" />
        <path d="M108 68 L82 82" className="demo-limb arm-left" />
        <path d="M108 68 L134 82" className="demo-limb arm-right" />
        <path d="M108 92 L94 126" className="demo-limb leg-left" />
        <path d="M108 92 L122 126" className="demo-limb leg-right" />
      </g>

      <g className="demo-person demo-calf">
        <circle cx="108" cy="42" r="10" className="demo-head" />
        <path d="M108 54 L108 92" className="demo-limb body-line" />
        <path d="M108 66 L90 84" className="demo-limb arm-left" />
        <path d="M108 66 L126 84" className="demo-limb arm-right" />
        <path d="M108 92 L98 126" className="demo-limb leg-left" />
        <path d="M108 92 L118 126" className="demo-limb leg-right" />
      </g>

      <g className="demo-person demo-pushup">
        <circle cx="62" cy="90" r="10" className="demo-head" />
        <path d="M74 94 H126" className="demo-limb body-line" />
        <path d="M82 94 L66 112" className="demo-limb arm-left" />
        <path d="M94 94 L82 120" className="demo-limb arm-right" />
        <path d="M126 94 L148 86" className="demo-limb leg-left" />
        <path d="M126 94 L154 98" className="demo-limb leg-right" />
      </g>

      <g className="demo-person demo-floorcore">
        <circle cx="74" cy="96" r="10" className="demo-head" />
        <path d="M86 100 H138" className="demo-limb body-line" />
        <path d="M138 100 L160 84" className="demo-limb leg-left" />
        <path d="M138 100 L160 108" className="demo-limb leg-right" />
      </g>

      <g className="demo-person demo-legpress">
        <circle cx="90" cy="92" r="10" className="demo-head" />
        <path d="M100 96 L124 110" className="demo-limb body-line" />
        <path d="M116 106 L144 92" className="demo-limb leg-left" />
        <path d="M120 110 L148 98" className="demo-limb leg-right" />
        <path d="M100 100 L84 118" className="demo-limb arm-left" />
      </g>

      <g className="demo-person demo-machineleg">
        <circle cx="94" cy="66" r="10" className="demo-head" />
        <path d="M94 78 L94 106" className="demo-limb body-line" />
        <path d="M94 88 L82 112" className="demo-limb arm-left" />
        <path d="M94 88 L106 112" className="demo-limb arm-right" />
        <path d="M94 106 L132 106" className="demo-limb leg-left" />
        <path d="M94 106 L132 98" className="demo-limb leg-right" />
        <rect x="78" y="110" width="52" height="6" rx="3" className="demo-machine-muted" />
      </g>

      <g className="demo-person demo-treadmill">
        <circle cx="104" cy="42" r="10" className="demo-head" />
        <path d="M104 54 L104 88" className="demo-limb body-line" />
        <path d="M104 66 L88 88" className="demo-limb arm-left" />
        <path d="M104 66 L120 82" className="demo-limb arm-right" />
        <path d="M104 88 L90 118" className="demo-limb leg-left" />
        <path d="M104 88 L126 110" className="demo-limb leg-right" />
      </g>

      <g className="demo-person demo-bike">
        <circle cx="104" cy="46" r="10" className="demo-head" />
        <path d="M104 58 L116 88" className="demo-limb body-line" />
        <path d="M114 72 L130 64" className="demo-limb arm-left" />
        <path d="M116 88 L100 110" className="demo-limb leg-left" />
        <path d="M116 88 L138 110" className="demo-limb leg-right" />
      </g>

      <g className="demo-person demo-elliptical">
        <circle cx="108" cy="44" r="10" className="demo-head" />
        <path d="M108 56 L108 92" className="demo-limb body-line" />
        <path d="M108 70 L90 92" className="demo-limb arm-left" />
        <path d="M108 70 L126 88" className="demo-limb arm-right" />
        <path d="M108 92 L92 122" className="demo-limb leg-left" />
        <path d="M108 92 L126 118" className="demo-limb leg-right" />
      </g>
    </svg>
  )
}

export default function ExerciseAnimation({ exercise, size = 'md', highlighted = false }) {
  const animation = resolveExerciseAnimation(exercise)

  return (
    <div
      className={`exercise-video-shell ${size} ${highlighted ? 'highlighted' : ''}`}
      data-family={animation.family}
      data-muscle={animation.muscleGroup}
    >
      <div className="exercise-video-topbar">
        <div className="exercise-video-dots">
          <span />
          <span />
          <span />
        </div>
        <span className="exercise-video-badge">Loop demo</span>
      </div>

      <div className="exercise-video-stage">
        <DemoSvg family={animation.family} label={animation.label} />
        <div className="exercise-video-watermark">
          <span className="exercise-video-live-dot" />
          <span>Demonstracao animada</span>
        </div>
      </div>

      <div className="exercise-video-caption">
        <span>{animation.label}</span>
        <small>Preview de execucao</small>
      </div>
    </div>
  )
}
