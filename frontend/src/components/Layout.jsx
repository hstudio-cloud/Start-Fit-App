import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, CreditCard, Dumbbell, TrendingUp,
  LogOut, Menu, X, ChevronRight, Activity, UserCheck,
} from 'lucide-react'

const menuByRole = {
  student: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/student' },
    { label: 'Minha Evolução', icon: TrendingUp, to: '/student/evolution' },
    { label: 'Mensalidade', icon: CreditCard, to: '/student', state: { tab: 'payment' } },
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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleLabel = { admin: 'Administrador', teacher: 'Professor', student: 'Aluno' }
  const roleColor = { admin: 'text-amber-400', teacher: 'text-emerald-400', student: 'text-brand-300' }

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-30 flex flex-col
        bg-dark-800 border-r border-white/5
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="StartFit" className="w-11 h-11 rounded-xl object-cover" style={{ boxShadow: '0 0 16px rgba(0,180,216,0.45)' }} />
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">StartFit</h1>
              <p className="text-xs text-white/40">Sistema de Gestão</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-300 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className={`text-xs font-medium ${roleColor[user?.role]}`}>{roleLabel[user?.role]}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menu.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to
            return (
              <Link key={item.to + item.label} to={item.to} state={item.state}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}>
                <Icon size={18} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight size={14} className="text-brand-400" />}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout}
            className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-dark-900/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-white/60 hover:text-white transition-colors">
              <Menu size={22} />
            </button>
            {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/40 hidden sm:block">Online</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 animate-slide-in">
          {children}
        </main>
      </div>
    </div>
  )
}
