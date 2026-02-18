'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowRightLeft, Wallet, CreditCard, CalendarDays, Calculator } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MainNav({ className }: { className?: string }) {
  const pathname = usePathname()

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
    <nav className={cn("hidden md:flex flex-col space-y-2", className)}>
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
    </nav>
  )
}

export function MobileNav() {
  const pathname = usePathname()

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
    <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t pb-safe md:hidden">
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
      </div>
    </div>
  )
}
