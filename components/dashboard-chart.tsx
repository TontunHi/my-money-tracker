'use client'
/* eslint-disable react-hooks/set-state-in-effect */

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
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: 20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="name"
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `฿${value}`}
        />
        <Tooltip
          cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
          contentStyle={{ 
            backgroundColor: 'var(--popover)', 
            borderRadius: '12px', 
            border: '1px solid var(--border)',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
          labelStyle={{ color: 'var(--foreground)', marginBottom: '4px' }}
        />
        <Bar 
          dataKey="total" 
          fill="var(--primary)" 
          radius={[4, 4, 0, 0]} 
          barSize={32}
          animationDuration={1500}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
