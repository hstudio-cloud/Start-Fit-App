import { useEffect, useMemo, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../services/api'
import {
  CheckCircle2, Clock3, Copy, CreditCard, ExternalLink, Loader2, QrCode, TriangleAlert,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const statusStyles = {
  pago: 'badge-success',
  pendente: 'badge-warning',
  vencido: 'badge-danger',
}

export default function StudentPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [pixLoading, setPixLoading] = useState(null)
  const [selectedPayment, setSelectedPayment] = useState(null)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const res = await api.get('/student/payments')
      const nextPayments = res.data.payments || []
      setPayments(nextPayments)
      setSelectedPayment((current) => {
        if (!nextPayments.length) return null
        if (!current) return nextPayments[0]
        return nextPayments.find((payment) => payment._id === current._id) || nextPayments[0]
      })
    } catch {
      toast.error('Erro ao carregar mensalidades.')
    } finally {
      setLoading(false)
    }
  }

  const activeCharge = selectedPayment?.pixCharge
  const summary = useMemo(() => ({
    paid: payments.filter((payment) => payment.status === 'pago').length,
    open: payments.filter((payment) => payment.status !== 'pago').length,
    overdue: payments.filter((payment) => payment.status === 'vencido').length,
  }), [payments])

  const generatePix = async (paymentId) => {
    setPixLoading(paymentId)
    try {
      const res = await api.post(`/student/payments/${paymentId}/pix`)
      const updatedPayment = res.data.payment
      setPayments((current) => current.map((payment) => (
        payment._id === paymentId ? updatedPayment : payment
      )))
      setSelectedPayment(updatedPayment)
      toast.success('Cobranca Pix gerada.')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Nao foi possivel gerar o Pix.')
    } finally {
      setPixLoading(null)
    }
  }

  const copyPixCode = async () => {
    if (!activeCharge?.qrCode) return
    try {
      await navigator.clipboard.writeText(activeCharge.qrCode)
      toast.success('Codigo Pix copiado.')
    } catch {
      toast.error('Nao foi possivel copiar o codigo.')
    }
  }

  return (
    <Layout title="Mensalidades">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Pagamento pelo app</h2>
            <p className="text-sm text-white/40">Acompanhe sua mensalidade e gere o Pix quando precisar.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:w-auto">
            <div className="card-sm text-center">
              <p className="text-xl font-black text-white">{summary.paid}</p>
              <p className="text-xs text-white/40">Pagas</p>
            </div>
            <div className="card-sm text-center">
              <p className="text-xl font-black text-white">{summary.open}</p>
              <p className="text-xs text-white/40">Em aberto</p>
            </div>
            <div className="card-sm text-center">
              <p className="text-xl font-black text-white">{summary.overdue}</p>
              <p className="text-xs text-white/40">Vencidas</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="order-2 space-y-3 lg:order-1">
              {payments.map((payment) => (
                <button
                  key={payment._id}
                  type="button"
                  onClick={() => setSelectedPayment(payment)}
                  className={`card w-full text-left transition-all ${
                    selectedPayment?._id === payment._id ? 'border-brand-500/40' : 'border-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-white/40">
                        Referencia {String(payment.referenceMonth).padStart(2, '0')}/{payment.referenceYear}
                      </p>
                      <p className="mt-1 text-xl font-bold text-white">
                        R$ {Number(payment.amount || 0).toFixed(2)}
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        Vencimento em {format(new Date(payment.dueDate), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <span className={statusStyles[payment.status] || 'badge-gray'}>
                      {payment.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="card order-1 lg:order-2">
              {selectedPayment ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-white/40">Mensalidade selecionada</p>
                      <h3 className="text-xl font-bold text-white">
                        {String(selectedPayment.referenceMonth).padStart(2, '0')}/{selectedPayment.referenceYear}
                      </h3>
                    </div>
                    <CreditCard className="text-brand-300" size={22} />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      {selectedPayment.status === 'pago' ? (
                        <CheckCircle2 size={16} className="text-emerald-400" />
                      ) : selectedPayment.status === 'vencido' ? (
                        <TriangleAlert size={16} className="text-red-400" />
                      ) : (
                        <Clock3 size={16} className="text-amber-400" />
                      )}
                      <span>Status atual: {selectedPayment.status}</span>
                    </div>
                    <p className="mt-3 text-3xl font-black text-white">
                      R$ {Number(selectedPayment.amount || 0).toFixed(2)}
                    </p>
                    {selectedPayment.paidDate ? (
                      <p className="mt-2 text-xs text-white/40">
                        Pago em {format(new Date(selectedPayment.paidDate), 'dd/MM/yyyy')}
                      </p>
                    ) : null}
                  </div>

                  {selectedPayment.status !== 'pago' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => generatePix(selectedPayment._id)}
                        disabled={pixLoading === selectedPayment._id}
                        className="btn-primary w-full"
                      >
                        {pixLoading === selectedPayment._id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <QrCode size={16} />
                        )}
                        {activeCharge ? 'Gerar novo Pix' : 'Gerar Pix da mensalidade'}
                      </button>

                      {activeCharge ? (
                        <div className="space-y-3 rounded-2xl border border-brand-500/20 bg-brand-500/10 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-brand-300">Pix disponivel</p>
                              <p className="text-xs text-white/50">
                                {activeCharge.provider === 'mock'
                                  ? 'Modo demonstracao. Configure Mercado Pago para cobranca real.'
                                  : 'Use o QR Code ou copie e cole o codigo no seu banco.'}
                              </p>
                            </div>
                            <QrCode size={18} className="text-brand-300" />
                          </div>

                          <div className="rounded-xl border border-white/10 bg-dark-900/60 p-3">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-white/30">Pix copia e cola</p>
                            <p className="mt-2 max-h-32 overflow-y-auto break-all font-mono text-xs text-white/80">
                              {activeCharge.qrCode}
                            </p>
                          </div>

                          <div className="flex flex-col gap-2 sm:flex-row">
                            <button type="button" onClick={copyPixCode} className="btn-secondary flex-1">
                              <Copy size={14} />
                              Copiar codigo
                            </button>
                            {activeCharge.ticketUrl ? (
                              <a
                                href={activeCharge.ticketUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-secondary flex-1"
                              >
                                <ExternalLink size={14} />
                                Abrir cobranca
                              </a>
                            ) : null}
                          </div>

                          {activeCharge.instructions ? (
                            <p className="text-xs leading-relaxed text-white/55">{activeCharge.instructions}</p>
                          ) : null}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                      Sua mensalidade ja esta quitada.
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-white/35">
                  Nenhuma mensalidade encontrada.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
