'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { useEffect, useState } from "react"

interface DashboardChartProps {
  data: { name: string; total: number }[];
}

export function DashboardChart({ data }: DashboardChartProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">Loading chart...</div>

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--border))" />
        <XAxis
          dataKey="name"
          stroke="oklch(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis
          stroke="oklch(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `฿${value}`}
        />
        <Tooltip
          cursor={{ fill: 'oklch(var(--muted)/0.5)' }}
          contentStyle={{ 
            backgroundColor: 'oklch(var(--popover))', 
            borderRadius: '12px', 
            border: '1px solid oklch(var(--border))',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
          labelStyle={{ color: 'oklch(var(--foreground))', marginBottom: '4px' }}
        />
        <Bar 
          dataKey="total" 
          fill="oklch(var(--primary))" 
          radius={[6, 6, 0, 0]} 
          barSize={32}
          animationDuration={1500}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
