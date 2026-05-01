import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Timer } from 'lucide-react'

export default function RestTimer({ defaultSeconds = 60, onComplete }) {
  const [seconds, setSeconds] = useState(defaultSeconds)
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            onComplete?.()
            return 0
          }
          return s - 1
        })
        setElapsed((e) => e + 1)
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const reset = () => {
    setRunning(false)
    setSeconds(defaultSeconds)
    setElapsed(0)
  }

  const progress = ((defaultSeconds - seconds) / defaultSeconds) * 100
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const color = seconds > 30 ? '#00b4d8' : seconds > 10 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Timer size={14} className="text-white/40 mb-1" />
          <span className="text-2xl font-bold text-white font-mono">{fmt(seconds)}</span>
          <span className="text-xs text-white/40">descanso</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setRunning((r) => !r)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
          style={{ background: running ? 'rgba(239,68,68,0.2)' : 'rgba(0,119,182,0.3)', border: `1px solid ${running ? 'rgba(239,68,68,0.4)' : 'rgba(0,180,216,0.4)'}`, color: running ? '#f87171' : '#48cae4' }}>
          {running ? <Pause size={16} /> : <Play size={16} />}
          {running ? 'Pausar' : 'Iniciar'}
        </button>
        <button onClick={reset}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-white/40 hover:text-white/70 transition-colors border border-white/10 hover:border-white/20">
          <RotateCcw size={14} />
        </button>
      </div>

      <div className="flex gap-2">
        {[30, 60, 90, 120].map((s) => (
          <button key={s} onClick={() => { setSeconds(s); setRunning(false); setElapsed(0) }}
            className={`px-2 py-1 rounded text-xs transition-all ${defaultSeconds === s ? 'bg-brand-500/30 text-brand-300 border border-brand-500/40' : 'text-white/30 hover:text-white/60 border border-white/5'}`}>
            {s}s
          </button>
        ))}
      </div>
    </div>
  )
}
