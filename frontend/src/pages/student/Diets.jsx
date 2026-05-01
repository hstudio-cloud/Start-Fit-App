import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../services/api'
import { Apple, Droplets, Flame, Soup } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StudentDiets() {
  const [diets, setDiets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDiets()
  }, [])

  const fetchDiets = async () => {
    setLoading(true)
    try {
      const res = await api.get('/student/diets')
      setDiets(res.data.diets || [])
    } catch {
      toast.error('Erro ao carregar dietas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Dietas">
      <div className="mx-auto max-w-5xl space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-white">Dietas personalizadas</h2>
          <p className="text-sm text-white/40">Seu plano alimentar pode ser ajustado pelo personal a qualquer momento.</p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : diets.length === 0 ? (
          <div className="card py-14 text-center text-white/35">
            Nenhum plano alimentar disponivel no momento.
          </div>
        ) : (
          <div className="space-y-4">
            {diets.map((diet) => (
              <div key={diet._id} className="card space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-300">Plano ativo</p>
                    <h3 className="mt-1 text-2xl font-bold text-white">{diet.title}</h3>
                    <p className="mt-2 text-sm text-white/55">{diet.goal || 'Plano personalizado para melhorar sua rotina alimentar.'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:w-64">
                    <div className="card-sm">
                      <div className="flex items-center gap-2 text-brand-300">
                        <Droplets size={14} />
                        <span className="text-xs">Agua</span>
                      </div>
                      <p className="mt-2 text-lg font-bold text-white">{diet.hydrationLiters || 0}L</p>
                    </div>
                    <div className="card-sm">
                      <div className="flex items-center gap-2 text-amber-400">
                        <Flame size={14} />
                        <span className="text-xs">Calorias</span>
                      </div>
                      <p className="mt-2 text-lg font-bold text-white">{diet.caloriesTarget || '--'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {diet.meals?.map((meal, index) => (
                    <div key={`${diet._id}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-white">
                          <Soup size={16} className="text-brand-300" />
                          <p className="font-semibold">{meal.title}</p>
                        </div>
                        <span className="text-xs text-white/40">{meal.time}</span>
                      </div>
                      <ul className="mt-3 space-y-2 text-sm text-white/65">
                        {meal.foods?.map((food, foodIndex) => (
                          <li key={`${diet._id}-${index}-${foodIndex}`} className="flex items-start gap-2">
                            <Apple size={14} className="mt-0.5 flex-shrink-0 text-emerald-400" />
                            <span>{food}</span>
                          </li>
                        ))}
                      </ul>
                      {meal.notes ? (
                        <p className="mt-3 text-xs leading-relaxed text-white/45">{meal.notes}</p>
                      ) : null}
                    </div>
                  ))}
                </div>

                {diet.tips?.length ? (
                  <div className="rounded-2xl border border-brand-500/20 bg-brand-500/10 p-4">
                    <p className="text-sm font-semibold text-brand-300">Orientacoes do personal</p>
                    <ul className="mt-3 space-y-2 text-sm text-white/65">
                      {diet.tips.map((tip, index) => (
                        <li key={`${diet._id}-tip-${index}`}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
