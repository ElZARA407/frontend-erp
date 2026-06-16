// src/app/(dashboard)/layout.tsx
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-muted">
      <Sidebar />
      <Topbar />
      <main className="ml-60 mt-14 min-h-[calc(100vh-56px)]">
        <div className="page-container">{children}</div>
      </main>
    </div>
  )
}