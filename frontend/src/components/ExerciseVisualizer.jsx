import { useState } from 'react'
import AnimatedExerciseCard from './AnimatedExerciseCard'
import ExerciseDemoModal from './ExerciseDemoModal'

export default function ExerciseVisualizer({ exercise, compact = false, active = false }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <AnimatedExerciseCard
        exercise={exercise}
        compact={compact}
        active={active}
        onOpen={() => setOpen(true)}
      />
      <ExerciseDemoModal exercise={exercise} open={open} onClose={() => setOpen(false)} />
    </>
  )
}
