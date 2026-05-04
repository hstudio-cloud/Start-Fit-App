import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Activity, Eye, EyeOff, Loader2, Dumbbell, Shield, Users } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let user
      if (mode === 'login') {
        user = await login(form.email, form.password)
      } else {
        if (!form.name) return toast.error('Informe seu nome.')
        user = await register({ name: form.name, email: form.email, password: form.password, phone: form.phone })
      }
      toast.success(mode === 'login' ? 'Bem-vindo(a)!' : 'Conta criada com sucesso!')
      navigate(`/${user.role}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao processar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #070b10 0%, #0d2137 50%, #0a3d62 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-300 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-brand-500 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="StartFit" className="w-12 h-12 rounded-2xl object-cover" style={{ boxShadow: '0 0 20px rgba(0,180,216,0.5)' }} />
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">StartFit</h1>
              <p className="text-sm text-brand-300">Sistema de Gestão Fitness</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Transforme corpos,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-100">
                gerencie resultados.
              </span>
            </h2>
            <p className="text-white/50 text-lg leading-relaxed">
              Plataforma completa para academias gerenciarem alunos, treinos, evolução e mensalidades.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: Dumbbell, title: 'Treinos Personalizados', desc: 'IA gera planos baseados no perfil do aluno' },
              { icon: Users, title: 'Gestão Completa', desc: 'Alunos, professores, pagamentos em um só lugar' },
              { icon: Shield, title: 'Seguro e Confiável', desc: 'Dados protegidos com autenticação JWT' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0 border border-brand-500/30">
                  <item.icon size={18} className="text-brand-300" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{item.title}</p>
                  <p className="text-white/40 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/20 text-sm">
          © 2024 StartFit App. Todos os direitos reservados.
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <img src="/logo.jpg" alt="StartFit" className="w-10 h-10 rounded-xl object-cover" style={{ boxShadow: '0 0 16px rgba(0,180,216,0.45)' }} />
            <h1 className="text-2xl font-black text-white">StartFit</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">
              {mode === 'login' ? 'Bem-vindo de volta!' : 'Criar conta'}
            </h2>
            <p className="text-white/40 text-sm">
              {mode === 'login' ? 'Entre com suas credenciais' : 'Preencha os dados para se cadastrar'}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex bg-dark-700 rounded-xl p-1 mb-6 border border-white/5">
            {['login', 'register'].map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === m ? 'bg-brand-500 text-white shadow' : 'text-white/40 hover:text-white/70'
                }`}>
                {m === 'login' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="label">Nome completo</label>
                <input className="input" type="text" placeholder="Seu nome" value={form.name} onChange={set('name')} required />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="seu@email.com" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input className="input pr-11" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={set('password')} required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {mode === 'register' && (
              <div>
                <label className="label">Telefone (opcional)</label>
                <input className="input" type="tel" placeholder="(00) 00000-0000" value={form.phone} onChange={set('phone')} />
              </div>
            )}

            <button type="submit" className="btn-primary w-full mt-6" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white/50 text-xs text-center mb-2">Contas de demonstração:</p>
            <div className="space-y-1">
              {[
                ['Admin', 'admin@startfit.com'],
                ['Professor', 'professor@startfit.com'],
                ['Aluno', 'joao@email.com'],
                ['Aluna', 'maria@email.com'],
              ].map(([role, email]) => (
                <button key={role} onClick={() => { setForm({ ...form, email, password: '123456' }); setMode('login') }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-all flex justify-between">
                  <span className="font-medium text-brand-400">{role}</span>
                  <span>{email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
