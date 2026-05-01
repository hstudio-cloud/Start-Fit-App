import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Apple, ChevronRight, CreditCard, LayoutDashboard, LogOut, Menu, TrendingUp, UserCheck, Users,
} from 'lucide-react'

const menuByRole = {
  student: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/student' },
    { label: 'Minha Evolucao', icon: TrendingUp, to: '/student/evolution' },
    { label: 'Mensalidade', icon: CreditCard, to: '/student/payments' },
    { label: 'Dietas', icon: Apple, to: '/student/diets' },
    { label: 'Meu Personal', icon: UserCheck, to: '/student/trainer' },
  ],
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
    { label: 'Alunos', icon: Users, to: '/admin/students' },
    { label: 'Mensalidades', icon: CreditCard, to: '/admin/payments' },
  ],
  teacher: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/teacher' },
    { label: 'Meus Alunos', icon: UserCheck, to: '/teacher/students' },
  ],
}

export default function Layout({ children, title }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menu = menuByRole[user?.role] || []
  const roleLabel = { admin: 'Administrador', teacher: 'Professor', student: 'Aluno' }
  const roleColor = { admin: 'text-amber-400', teacher: 'text-emerald-400', student: 'text-brand-300' }
  const mobileMenu = user?.role === 'student'
    ? [
        { label: 'Inicio', icon: LayoutDashboard, to: '/student' },
        { label: 'Evolucao', icon: TrendingUp, to: '/student/evolution' },
        { label: 'Pagamentos', icon: CreditCard, to: '/student/payments' },
        { label: 'Dietas', icon: Apple, to: '/student/diets' },
        { label: 'Personal', icon: UserCheck, to: '/student/trainer' },
      ]
    : []

  const isItemActive = (item) => {
    if (item.to === '/student') return location.pathname === '/student'
    if (item.to === '/admin') return location.pathname === '/admin'
    if (item.to === '/teacher') return location.pathname === '/teacher'
    return location.pathname.startsWith(item.to)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      {sidebarOpen ? (
        <div className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      ) : null}

      <aside
        className={`
          fixed top-0 left-0 z-30 flex h-full w-64 flex-col border-r border-white/5 bg-dark-800
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        <div className="border-b border-white/5 p-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="StartFit"
              className="h-11 w-11 rounded-xl object-cover"
              style={{ boxShadow: '0 0 16px rgba(0,180,216,0.45)' }}
            />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">StartFit</h1>
              <p className="text-xs text-white/40">Sistema de Gestao</p>
            </div>
          </div>
        </div>

        <div className="border-b border-white/5 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-300 text-sm font-bold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
              <p className={`text-xs font-medium ${roleColor[user?.role]}`}>{roleLabel[user?.role]}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {menu.map((item) => {
            const Icon = item.icon
            const isActive = isItemActive(item)
            return (
              <Link
                key={`${item.to}-${item.label}`}
                to={item.to}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span className="flex-1">{item.label}</span>
                {isActive ? <ChevronRight size={14} className="text-brand-400" /> : null}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-white/5 p-4">
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:ml-64">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-dark-900/80 px-4 py-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-white/60 transition-colors hover:text-white lg:hidden"
            >
              <Menu size={22} />
            </button>
            {title ? <h2 className="text-lg font-semibold text-white">{title}</h2> : null}
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="hidden text-xs text-white/40 sm:block">Online</span>
          </div>
        </header>

        <main className="animate-slide-in flex-1 px-4 py-4 pb-28 sm:px-6 sm:py-6 lg:pb-6">
          {children}
        </main>
      </div>

      {mobileMenu.length ? (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-dark-900/95 px-2 py-2 backdrop-blur-xl lg:hidden">
          <div className="grid grid-cols-5 gap-1">
            {mobileMenu.map((item) => {
              const Icon = item.icon
              const active = isItemActive(item)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition-colors ${
                    active ? 'bg-brand-500/15 text-brand-300' : 'text-white/45'
                  }`}
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      ) : null}
    </div>
  )
}
