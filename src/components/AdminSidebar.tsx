'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Database, Megaphone, LogOut } from 'lucide-react'
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
    <aside className="w-60 min-h-screen border-r border-gray-200 bg-white flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-3 group">
          <Image src="/lks-dikmen.png" alt="LKS" width={36} height={36} />
          <div>
            <div className="text-sm font-bold text-[#333333]">LKS AI Tracker</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* Brand stripe */}
      <div className="h-1 bg-gradient-to-r from-[#BF2026] to-[#ED2224]" />

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-[#BF2026]/8 text-[#BF2026] border-l-2 border-[#BF2026] rounded-l-none pl-[10px]'
                  : 'text-gray-500 hover:text-[#333333] hover:bg-gray-100 border-l-2 border-transparent rounded-l-none pl-[10px]'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-200">
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all w-full font-medium border-l-2 border-transparent rounded-l-none pl-[10px]"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Logout
          </button>
        </form>
      </div>
    </aside>
  )
}
