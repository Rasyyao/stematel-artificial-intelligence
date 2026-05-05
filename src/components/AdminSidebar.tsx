'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, FileText, Database, Megaphone, LogOut, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/submissions', label: 'Submissions', icon: FileText },
  { href: '/admin/datasets', label: 'Datasets', icon: Database },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-60 min-h-screen border-r border-white/8 bg-black/40 backdrop-blur-xl flex flex-col"
    >
      <div className="p-4 border-b border-white/8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold">LKS AI Tracker</div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider">Admin Panel</div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                isActive
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-white/8">
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </form>
      </div>
    </motion.aside>
  )
}
