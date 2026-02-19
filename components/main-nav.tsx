'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowRightLeft, Wallet, CreditCard, Calculator, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function MainNav({ className }: { className?: string }) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const routes = [
    {
      href: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      href: '/transactions',
      label: 'Transactions',
      icon: ArrowRightLeft,
      active: pathname === '/transactions',
    },
    {
      href: '/wallets',
      label: 'Wallets',
      icon: Wallet,
      active: pathname === '/wallets',
    },
    {
      href: '/categories',
      label: 'Categories',
      icon: CreditCard,
      active: pathname === '/categories',
    },
    {
      href: '/reports',
      label: 'Reports',
      icon: Calculator,
      active: pathname === '/reports',
    },
  ]

  return (
    <nav className={cn("hidden md:flex flex-col space-y-2 h-full", className)}>
      <div className="flex-1 space-y-2">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
              route.active ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:text-primary-foreground" : "text-muted-foreground"
            )}
          >
            <route.icon className={cn("mr-3 h-5 w-5 transition-transform group-hover:scale-110", route.active && "text-primary-foreground")} />
            <span>{route.label}</span>
          </Link>
        ))}
      </div>

      <div className="pt-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="mr-3 h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute mr-3 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span>Toggle Theme</span>
        </Button>
      </div>
    </nav>
  )
}

export function MobileNav() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const routes = [
    {
      href: '/',
      label: 'Home',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      href: '/transactions',
      label: 'Txns',
      icon: ArrowRightLeft,
      active: pathname === '/transactions',
    },
    {
       href: '/wallets',
       label: 'Wallet',
       icon: Wallet,
       active: pathname === '/wallets',
    },
    {
      href: '/categories',
      label: 'Cats',
      icon: CreditCard,
      active: pathname === '/categories',
    },
    {
      href: '/reports',
      label: 'Reports',
      icon: Calculator,
      active: pathname === '/reports',
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t pb-safe md:hidden bg-background/80 backdrop-blur-lg">
      <div className="flex justify-around items-center h-16 px-2">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
              route.active ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn("relative p-1 rounded-xl transition-all", route.active && "bg-primary/10")}>
               <route.icon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium">{route.label}</span>
          </Link>
        ))}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-foreground"
        >
           <div className="relative p-1">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute top-1 left-1 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
           </div>
           <span className="text-[10px] font-medium">Theme</span>
        </button>
      </div>
    </div>
  )
}
