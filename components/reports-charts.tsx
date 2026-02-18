'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

interface ReportsChartsProps {
  pieData: { name: string; value: number }[]
  barData: { name: string; income: number; expense: number }[]
}

const COLORS = ['#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#E5E5E5'];

export function ReportsCharts({ pieData, barData }: ReportsChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Category Breakdown (Pie) */}
      <Card className="glass-card shadow-lg">
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>By Category (Current Month)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   formatter={(value: number) => `฿${value.toLocaleString()}`}
                   contentStyle={{ backgroundColor: 'white', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Income vs Expense (Bar) */}
      <Card className="glass-card shadow-lg">
        <CardHeader>
          <CardTitle>Income vs Expense</CardTitle>
          <CardDescription>Last 6 Months</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                   stroke="#888888" 
                   fontSize={12} 
                   tickLine={false} 
                   axisLine={false}
                   tickFormatter={(value) => `฿${value}`}
                />
                <Tooltip 
                   formatter={(value: number) => `฿${value.toLocaleString()}`}
                   contentStyle={{ backgroundColor: 'white', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#000000" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#999999" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
