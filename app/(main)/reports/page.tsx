import { db } from '@/db';
import { transactions, categories } from '@/db/schema';
import { desc, eq, sql, and, gte, lte } from 'drizzle-orm';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ReportsCharts } from '@/components/reports-charts';

export const revalidate = 0;

async function getReportsData() {
  const now = new Date();
  const startCurrentMonth = startOfMonth(now);
  const endCurrentMonth = endOfMonth(now);
  const start6MonthsAgo = startOfMonth(subMonths(now, 5));

  // 1. Expense by Category (Current Month)
  const categoryStats = await db.select({
    name: categories.name,
    amount: sql<number>`sum(${transactions.amount})`
  })
  .from(transactions)
  .leftJoin(categories, eq(transactions.categoryId, categories.id))
  .where(
    and(
      gte(transactions.date, startCurrentMonth),
      lte(transactions.date, endCurrentMonth),
      eq(transactions.type, 'expense')
    )
  )
  .groupBy(categories.name)
  .orderBy(desc(sql`sum(${transactions.amount})`));

  // 2. Income vs Expense (Last 6 Months)
  const monthlyStats = await db.select({
    month: sql<string>`to_char(${transactions.date}, 'YYYY-MM')`,
    type: transactions.type,
    amount: sql<number>`sum(${transactions.amount})`
  })
  .from(transactions)
  .where(
    and(
      gte(transactions.date, start6MonthsAgo),
      lte(transactions.date, endCurrentMonth)
    )
  )
  .groupBy(sql`to_char(${transactions.date}, 'YYYY-MM')`, transactions.type)
  .orderBy(sql`to_char(${transactions.date}, 'YYYY-MM')`);

  // Transform for Bar Chart
  const barChartDataMap = new Map();
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
     const d = subMonths(now, i);
     const key = format(d, 'yyyy-MM');
     barChartDataMap.set(key, { name: format(d, 'MMM'), income: 0, expense: 0 });
  }

  monthlyStats.forEach(stat => {
     if (barChartDataMap.has(stat.month)) {
        const entry = barChartDataMap.get(stat.month);
        if (stat.type === 'income') entry.income = Number(stat.amount);
        if (stat.type === 'expense') entry.expense = Number(stat.amount);
     }
  });

  const barChartData = Array.from(barChartDataMap.values());
  
  // Pie Chart Data (Top 5 + Others)
  let pieChartData = categoryStats.map(c => ({
    name: c.name || 'Uncategorized',
    value: Number(c.amount)
  }));

  if (pieChartData.length > 5) {
    const top5 = pieChartData.slice(0, 5);
    const others = pieChartData.slice(5).reduce((acc, curr) => acc + curr.value, 0);
    pieChartData = [...top5, { name: 'Others', value: others }];
  }

  // Summary Cards Data
  const highestExpenseCategory = categoryStats[0];
  const totalExpense = categoryStats.reduce((acc, c) => acc + Number(c.amount), 0);
  const avgDailyExpense = totalExpense / now.getDate();

  return { pieChartData, barChartData, highestExpenseCategory, totalExpense, avgDailyExpense };
}

export default async function ReportsPage() {
  const { pieChartData, barChartData, highestExpenseCategory, totalExpense, avgDailyExpense } = await getReportsData();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1 text-lg font-medium">Deep dive into your financial habits.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expense (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{totalExpense.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
           <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Spending Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{highestExpenseCategory?.name || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">฿{Number(highestExpenseCategory?.amount || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
           <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Daily Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{avgDailyExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </CardContent>
        </Card>
      </div>

      <ReportsCharts pieData={pieChartData} barData={barChartData} />
    </div>
  );
}
