import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/auth'
import AdminSidebar from '@/components/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdminAuthenticated()

  // Login page is also under /admin — don't redirect, just render it bare
  if (!authed) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto min-h-screen">
        {children}
      </main>
    </div>
  )
}
