import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api from '../../services/api'
import {
  Plus, Search, Edit2, Trash2, X, Save, Loader2,
  User, Mail, Phone, CreditCard, UserCheck, ChevronDown,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const EMPTY_FORM = { name: '', email: '', password: '', phone: '', monthlyFee: 100, paymentDueDay: 10, teacherId: '' }

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // null | 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [sRes, tRes] = await Promise.all([api.get('/admin/students'), api.get('/admin/teachers')])
      setStudents(sRes.data.students || [])
      setTeachers(tRes.data.teachers || [])
    } catch { toast.error('Erro ao carregar alunos.') }
    finally { setLoading(false) }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create') }
  const openEdit = (s) => {
    setSelected(s)
    setForm({ name: s.user.name, email: s.user.email, password: '', phone: s.user.phone || '', monthlyFee: s.monthlyFee, paymentDueDay: s.paymentDueDay, teacherId: s.teacher?._id || '' })
    setModal('edit')
  }
  const openDelete = (s) => { setSelected(s); setModal('delete') }

  const handleCreate = async () => {
    if (!form.name || !form.email) { toast.error('Nome e email são obrigatórios.'); return }
    setSaving(true)
    try {
      await api.post('/admin/students', form)
      toast.success('Aluno cadastrado!')
      setModal(null); fetchData()
    } catch (err) { toast.error(err.response?.data?.message || 'Erro ao cadastrar.') }
    finally { setSaving(false) }
  }

  const handleEdit = async () => {
    setSaving(true)
    try {
      await api.put(`/admin/students/${selected._id}`, form)
      toast.success('Aluno atualizado!')
      setModal(null); fetchData()
    } catch (err) { toast.error(err.response?.data?.message || 'Erro ao atualizar.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await api.delete(`/admin/students/${selected._id}`)
      toast.success('Aluno desativado.')
      setModal(null); fetchData()
    } catch { toast.error('Erro ao desativar.') }
    finally { setSaving(false) }
  }

  const filtered = students.filter(s =>
    s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.user?.email?.toLowerCase().includes(search.toLowerCase())
  )

  const FormModal = ({ title, onSave }) => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="card w-full max-w-lg animate-slide-in my-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-white text-lg">{title}</h3>
          <button onClick={() => setModal(null)} className="text-white/40 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label"><User size={12} className="inline mr-1" />Nome completo *</label>
              <input className="input" placeholder="Nome do aluno" value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label className="label"><Mail size={12} className="inline mr-1" />Email *</label>
              <input className="input" type="email" placeholder="email@exemplo.com" value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className="label"><Phone size={12} className="inline mr-1" />Telefone</label>
              <input className="input" placeholder="(00) 00000-0000" value={form.phone} onChange={set('phone')} />
            </div>
            <div>
              <label className="label">Senha {modal === 'edit' && '(deixe vazio para manter)'}</label>
              <input className="input" type="password" placeholder={modal === 'edit' ? '••••••' : 'mínimo 6 chars'} value={form.password} onChange={set('password')} />
            </div>
            <div>
              <label className="label"><CreditCard size={12} className="inline mr-1" />Mensalidade (R$)</label>
              <input className="input" type="number" min="0" value={form.monthlyFee} onChange={set('monthlyFee')} />
            </div>
            <div>
              <label className="label">Dia de Vencimento</label>
              <input className="input" type="number" min="1" max="28" value={form.paymentDueDay} onChange={set('paymentDueDay')} />
            </div>
            <div>
              <label className="label"><UserCheck size={12} className="inline mr-1" />Professor</label>
              <div className="relative">
                <select className="input appearance-none pr-8" value={form.teacherId} onChange={set('teacherId')}>
                  <option value="">Sem professor</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancelar</button>
            <button onClick={onSave} disabled={saving} className="btn-primary flex-1">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Layout title="Gerenciar Alunos">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-white">Alunos</h2>
            <p className="text-white/40 text-sm">{students.length} alunos cadastrados</p>
          </div>
          <button onClick={openCreate} className="btn-primary">
            <Plus size={18} /> Novo Aluno
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input className="input pl-10" placeholder="Buscar por nome ou email..."
            value={search} onChange={e => setSearch(e.target.value)} />
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
                    {['Aluno', 'Contato', 'Professor', 'Treinos', 'Mensalidade', 'Status', 'Ações'].map(h => (
                      <th key={h} className="text-left text-white/40 text-xs py-4 px-4 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-white/30">Nenhum aluno encontrado.</td></tr>
                  ) : filtered.map((s) => (
                    <tr key={s._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center text-sm font-bold text-brand-300 flex-shrink-0">
                            {s.user?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-medium whitespace-nowrap">{s.user?.name}</p>
                            <p className="text-white/30 text-xs">desde {s.user?.createdAt ? format(new Date(s.user.createdAt), 'dd/MM/yy') : '--'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-white/60 text-xs">{s.user?.email}</p>
                        <p className="text-white/40 text-xs">{s.user?.phone || '—'}</p>
                      </td>
                      <td className="py-4 px-4 text-white/60 text-xs whitespace-nowrap">{s.teacher?.name || <span className="text-white/20">—</span>}</td>
                      <td className="py-4 px-4 text-white/70 font-medium">{s.totalWorkouts || 0}</td>
                      <td className="py-4 px-4">
                        <p className="text-white/70 text-xs">R$ {s.monthlyFee?.toFixed(2)}</p>
                        <p className="text-white/30 text-xs">Vcto dia {s.paymentDueDay}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={s.user?.active ? 'badge-success' : 'badge-danger'}>
                          {s.user?.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(s)}
                            className="w-8 h-8 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 flex items-center justify-center transition-all">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => openDelete(s)}
                            className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-all">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {modal === 'create' && <FormModal title="Cadastrar Novo Aluno" onSave={handleCreate} />}
      {modal === 'edit' && <FormModal title="Editar Aluno" onSave={handleEdit} />}

      {modal === 'delete' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-sm animate-slide-in text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-400" />
            </div>
            <h3 className="font-bold text-white text-lg mb-2">Desativar Aluno?</h3>
            <p className="text-white/50 text-sm mb-6">
              <strong className="text-white">{selected?.user?.name}</strong> será desativado(a) e não poderá mais fazer login.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={handleDelete} disabled={saving} className="btn-danger flex-1">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {saving ? 'Removendo...' : 'Desativar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
