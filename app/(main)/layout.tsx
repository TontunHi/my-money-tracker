import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { MainNav, MobileNav } from '@/components/main-nav'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side auth check (replaces deprecated middleware)
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('auth_session')
  if (authCookie?.value !== 'authenticated') {
    redirect('/login')
  }
  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="hidden w-72 border-r bg-background/60 backdrop-blur-xl p-6 md:flex flex-col fixed inset-y-0 z-50">
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="relative h-12 w-12 rounded-xl overflow-hidden shadow-lg shadow-primary/20">
             <img src="/logo.png" alt="PennyPal Logo" className="object-cover w-full h-full" />
          </div>
          <div>
            <span className="block text-xl font-bold tracking-tight text-primary">PennyPal</span>
            <span className="block text-xs text-muted-foreground font-medium">Personal Finance</span>
          </div>
        </div>
        
        <MainNav className="flex-1" />
        
        <div className="mt-auto px-2">
           <div className="rounded-xl bg-card p-4 border shadow-sm">
              <p className="text-xs text-muted-foreground mb-1">Total Balance</p>
              <p className="text-lg font-bold text-foreground">฿0.00</p>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-72">
        <div className="container mx-auto p-4 md:p-8 max-w-5xl pb-24 md:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
}
