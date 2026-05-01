import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api from '../../services/api'
import {
  CreditCard, CheckCircle2, AlertTriangle, Clock,
  Filter, ChevronDown, X, Loader2, DollarSign,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const statusConfig = {
  pago:      { label: 'Pago',      class: 'badge-success', icon: CheckCircle2, iconClass: 'text-emerald-400' },
  pendente:  { label: 'Pendente',  class: 'badge-warning', icon: Clock,        iconClass: 'text-amber-400'   },
  vencido:   { label: 'Vencido',   class: 'badge-danger',  icon: AlertTriangle,iconClass: 'text-red-400'     },
  cancelado: { label: 'Cancelado', class: 'badge-gray',    icon: X,            iconClass: 'text-white/40'    },
}

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [modalPayment, setModalPayment] = useState(null)
  const [payMethod, setPayMethod] = useState('pix')

  useEffect(() => { fetchPayments() }, [filter])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const params = filter !== 'all' ? `?status=${filter}` : ''
      const res = await api.get(`/admin/payments${params}`)
      setPayments(res.data.payments || [])
    } catch { toast.error('Erro ao carregar mensalidades.') }
    finally { setLoading(false) }
  }

  const markAsPaid = async () => {
    if (!modalPayment) return
    setUpdating(modalPayment._id)
    try {
      await api.put(`/admin/payments/${modalPayment._id}`, { status: 'pago', paidDate: new Date(), paymentMethod: payMethod })
      toast.success('Pagamento registrado!')
      setModalPayment(null)
      fetchPayments()
    } catch { toast.error('Erro ao atualizar.') }
    finally { setUpdating(null) }
  }

  const totals = {
    pago:     payments.filter(p => p.status === 'pago').reduce((a, p) => a + p.amount, 0),
    pendente: payments.filter(p => p.status === 'pendente').reduce((a, p) => a + p.amount, 0),
    vencido:  payments.filter(p => p.status === 'vencido').reduce((a, p) => a + p.amount, 0),
  }

  const tabs = [
    { id: 'all',     label: 'Todas',    count: payments.length },
    { id: 'vencido', label: 'Vencidas', count: payments.filter(p => p.status === 'vencido').length  },
    { id: 'pendente',label: 'Pendentes',count: payments.filter(p => p.status === 'pendente').length },
    { id: 'pago',    label: 'Pagas',    count: payments.filter(p => p.status === 'pago').length     },
  ]

  return (
    <Layout title="Mensalidades">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Controle de Mensalidades</h2>
          <p className="text-white/40 text-sm">{format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Recebido', value: totals.pago,     color: 'emerald', icon: CheckCircle2 },
            { label: 'Pendente', value: totals.pendente, color: 'amber',   icon: Clock        },
            { label: 'Vencido',  value: totals.vencido,  color: 'red',     icon: AlertTriangle},
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                s.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                s.color === 'amber'   ? 'bg-amber-500/20 text-amber-400' :
                                        'bg-red-500/20 text-red-400'
              }`}>
                <s.icon size={16} />
              </div>
              <p className="text-xl font-black text-white">
                R$ {s.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-dark-800 p-1 rounded-xl border border-white/5 w-fit">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setFilter(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                filter === t.id ? 'bg-brand-500 text-white shadow' : 'text-white/40 hover:text-white/70'
              }`}>
              {t.label}
              {t.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  filter === t.id ? 'bg-white/20' : 'bg-white/10'
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/5">
                  <tr>
                    {['Aluno', 'Referência', 'Valor', 'Vencimento', 'Pagamento', 'Status', 'Ação'].map(h => (
                      <th key={h} className="text-left text-white/40 text-xs py-4 px-4 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-white/30">Nenhuma mensalidade encontrada.</td></tr>
                  ) : payments.map((p) => {
                    const cfg = statusConfig[p.status] || statusConfig.pendente
                    const Icon = cfg.icon
                    return (
                      <tr key={p._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-300 flex-shrink-0">
                              {p.student?.user?.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-white font-medium whitespace-nowrap">{p.student?.user?.name}</p>
                              <p className="text-white/30 text-xs">{p.student?.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-white/60 text-xs whitespace-nowrap">
                          {String(p.referenceMonth).padStart(2,'0')}/{p.referenceYear}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-white font-semibold">R$ {p.amount?.toFixed(2)}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-xs whitespace-nowrap ${
                            p.status === 'vencido' ? 'text-red-400' :
                            p.status === 'pendente' ? 'text-amber-400' : 'text-white/50'
                          }`}>
                            {format(new Date(p.dueDate), 'dd/MM/yyyy')}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-white/50 text-xs whitespace-nowrap">
                          {p.paidDate ? format(new Date(p.paidDate), 'dd/MM/yyyy') : '—'}
                        </td>
                        <td className="py-4 px-4">
                          <span className={cfg.class}>{cfg.label}</span>
                        </td>
                        <td className="py-4 px-4">
                          {p.status !== 'pago' && p.status !== 'cancelado' && (
                            <button onClick={() => { setModalPayment(p); setPayMethod('pix') }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all border border-emerald-500/30">
                              <DollarSign size={12} /> Dar baixa
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Mark as Paid Modal */}
      {modalPayment && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-sm animate-slide-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white">Registrar Pagamento</h3>
              <button onClick={() => setModalPayment(null)} className="text-white/40 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
              <p className="text-emerald-400 font-semibold">{modalPayment.student?.user?.name}</p>
              <p className="text-white/60 text-sm mt-1">
                Ref.: {String(modalPayment.referenceMonth).padStart(2,'0')}/{modalPayment.referenceYear} —
                <span className="text-white font-bold"> R$ {modalPayment.amount?.toFixed(2)}</span>
              </p>
            </div>
            <div className="mb-5">
              <label className="label">Forma de Pagamento</label>
              <div className="grid grid-cols-2 gap-2">
                {[['pix','PIX'],['dinheiro','Dinheiro'],['cartao','Cartão'],['boleto','Boleto']].map(([v,l]) => (
                  <button key={v} onClick={() => setPayMethod(v)}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                      payMethod === v ? 'bg-brand-500/20 border-brand-400 text-brand-300' : 'bg-white/3 border-white/10 text-white/50 hover:border-white/20'
                    }`}>{l}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModalPayment(null)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={markAsPaid} disabled={!!updating} className="btn-success flex-1">
                {updating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                {updating ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
