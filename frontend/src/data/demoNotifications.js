function daysUntil(dateValue) {
  const diff = new Date(dateValue).getTime() - Date.now()
  return Math.ceil(diff / 86400000)
}

export function buildStudentNotifications({ payments = [], workout, student, diets = [] }) {
  const notifications = []
  const nextPayment = payments.find((payment) => payment.status !== 'pago')

  if (nextPayment) {
    const dueInDays = daysUntil(nextPayment.dueDate)
    notifications.push({
      id: `payment-${nextPayment._id}`,
      title: dueInDays < 0 ? 'Mensalidade vencida' : 'Mensalidade perto do vencimento',
      message: dueInDays < 0 ? 'Regularize o pagamento no app demo para manter o acesso.' : `Sua mensalidade vence em ${dueInDays} dia(s).`,
      tone: dueInDays < 0 ? 'danger' : 'warning',
    })
  }

  notifications.push({
    id: 'water-reminder',
    title: 'Lembrete de agua',
    message: `Meta demo: ${diets[0]?.hydrationLiters || 2.5}L ate o fim do dia.`,
    tone: 'info',
  })

  notifications.push({
    id: 'meal-reminder',
    title: 'Lembrete de alimentacao',
    message: diets[0]?.meals?.[0]?.title ? `Nao pule a refeicao: ${diets[0].meals[0].title}.` : 'Mantenha refeicoes consistentes no dia.',
    tone: 'success',
  })

  if (workout) {
    notifications.push({
      id: `workout-${workout._id}`,
      title: 'Treino do dia pronto',
      message: `${workout.name} com ${workout.exercises?.length || 0} exercicios animados.`,
      tone: 'brand',
    })
  }

  if (student?.lastWorkout && Math.floor((Date.now() - new Date(student.lastWorkout).getTime()) / 86400000) >= 3) {
    notifications.push({
      id: 'inactive-warning',
      title: 'Frequencia baixa',
      message: 'Voce esta ha alguns dias sem treinar. Retome a rotina para manter evolucao.',
      tone: 'warning',
    })
  }

  return notifications
}

export function buildAdminNotifications({ students = [], payments = [] }) {
  const lowFrequency = students.filter((student) => {
    if (!student.lastWorkout) return true
    return (Date.now() - new Date(student.lastWorkout).getTime()) > 7 * 86400000
  })

  return [
    {
      id: 'admin-overdue',
      title: 'Mensalidades vencidas',
      message: `${payments.filter((payment) => payment.status === 'vencido').length} aluno(s) com mensalidade em atraso.`,
      tone: 'danger',
    },
    {
      id: 'admin-upcoming',
      title: 'Vencimentos proximos',
      message: `${payments.filter((payment) => payment.status === 'pendente').length} cobrancas pedem acompanhamento comercial.`,
      tone: 'warning',
    },
    {
      id: 'admin-low-frequency',
      title: 'Alunos com baixa frequencia',
      message: `${lowFrequency.length} aluno(s) precisam de reengajamento.`,
      tone: 'info',
    },
  ]
}

export function buildTeacherNotifications({ students = [] }) {
  const inactive = students.filter((student) => !student.lastWorkout || (Date.now() - new Date(student.lastWorkout).getTime()) > 10 * 86400000)

  return [
    {
      id: 'teacher-inactive',
      title: 'Alunos inativos',
      message: `${inactive.length} aluno(s) precisam de contato esta semana.`,
      tone: 'warning',
    },
    {
      id: 'teacher-water',
      title: 'Lembrete de acompanhamento',
      message: 'Reforce agua, alimentacao e registro de carga com seus alunos demo.',
      tone: 'brand',
    },
  ]
}
