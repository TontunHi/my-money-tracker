// ... imports ...
import { db } from '@/db';
import { transactions, wallets, categories } from '@/db/schema';
import { desc, eq, sql, and, gte, lte } from 'drizzle-orm';
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DashboardChart } from '@/components/dashboard-chart';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { QuickTransactionButton } from '@/components/quick-transaction-button';
import { Progress } from '@/components/ui/progress';

export const revalidate = 0;

async function getDashboardData() {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const walletsRes = await db.select({ balance: wallets.balance })
    .from(wallets).where(eq(wallets.isActive, true));
  const totalBalance = walletsRes.reduce((acc, w) => acc + Number(w.balance), 0);

  const monthlyStats = await db.select({
    type: transactions.type,
    amount: sql<number>`sum(${transactions.amount})`
  }).from(transactions)
    .where(and(gte(transactions.date, start), lte(transactions.date, end)))
    .groupBy(transactions.type);

  const income = Number(monthlyStats.find(s => s.type === 'income')?.amount || 0);
  const expense = Number(monthlyStats.find(s => s.type === 'expense')?.amount || 0);

  const dailyStats = await db.select({
    date: transactions.date,
    amount: sql<number>`sum(${transactions.amount})`
  }).from(transactions)
    .where(and(gte(transactions.date, start), lte(transactions.date, end), eq(transactions.type, 'expense')))
    .groupBy(transactions.date);

  const daysInMonth = eachDayOfInterval({ start, end });
  const chartData = daysInMonth.map(day => {
    const stat = dailyStats.find(s => format(s.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
    return { name: format(day, 'd'), total: stat ? Number(stat.amount) : 0 };
  });

  const recentTransactions = await db.query.transactions.findMany({
    orderBy: [desc(transactions.date)],
    limit: 5,
    with: { wallet: true, category: true }
  });

  const allWallets = await db.select().from(wallets).where(eq(wallets.isActive, true));
  const allCategories = await db.select().from(categories);

  // Category Spending for Budget
  const categorySpending = await db.select({
    categoryId: transactions.categoryId,
    amount: sql<number>`sum(${transactions.amount})`
  }).from(transactions)
    .where(and(gte(transactions.date, start), lte(transactions.date, end), eq(transactions.type, 'expense')))
    .groupBy(transactions.categoryId);

  return { totalBalance, income, expense, recentTransactions, chartData, allWallets, allCategories, categorySpending };
}

export default async function DashboardPage() {
  const { totalBalance, income, expense, recentTransactions, chartData, allWallets, allCategories, categorySpending } = await getDashboardData();

  const processedCategories = allCategories.map(c => ({
    id: c.id, name: c.name, type: c.type as 'income' | 'expense', icon: c.icon
  }));
  const processedWallets = allWallets.map(w => ({
    id: w.id, name: w.name, balance: w.balance,
  }));

  // Process Budget Data
  const budgetData = allCategories
    .filter(c => c.type === 'expense' && c.budgetLimit && Number(c.budgetLimit) > 0)
    .map(c => {
      const spent = Number(categorySpending.find(s => s.categoryId === c.id)?.amount || 0);
      const limit = Number(c.budgetLimit);
      const percentage = Math.min((spent / limit) * 100, 100);
      return { ...c, spent, limit, percentage };
    })
    .sort((a, b) => b.percentage - a.percentage) // Highest % first
    .slice(0, 4); // Show top 4

  return (
    <div className="space-y-8 animate-in fade-in duration-500 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Dashboard</h1>
          <p className="text-lg text-muted-foreground mt-1 font-medium">{format(new Date(), 'MMMM yyyy')}</p>
        </div>
        <QuickTransactionButton wallets={processedWallets} categories={processedCategories} />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance */}
        <Card className="col-span-1 border-2 border-primary/10 shadow-none hover:border-primary/20 transition-colors">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Balance</p>
            <p className="text-4xl font-black tracking-tighter">
              ฿{totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        {/* Income */}
        <Card className="col-span-1 border-2 border-border shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Income</p>
              <div className="p-1.5 bg-primary/5 rounded-full">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">
              ฿{income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        {/* Expense */}
        <Card className="col-span-1 border-2 border-border shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Expenses</p>
              <div className="p-1.5 bg-primary/5 rounded-full">
                <ArrowDownLeft className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">
              ฿{expense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-6">
           {/* Chart */}
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle className="text-xl font-bold">Daily Expenses</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[350px] w-full border-2 border-dashed border-border rounded-xl p-4 bg-card/50">
                  <DashboardChart data={chartData} />
                </div>
              </CardContent>
            </Card>

            {/* Budget Progress (New Feature) */}
            {budgetData.length > 0 && (
              <Card className="border-2 border-border shadow-none">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold">Budget Status</CardTitle>
                  <CardDescription>Top spending categories vs limits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {budgetData.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <div>
                           <p className="font-bold text-sm">{item.name}</p>
                           <p className="text-xs text-muted-foreground">฿{item.spent.toLocaleString()} / ฿{item.limit.toLocaleString()}</p>
                        </div>
                        <span className="text-sm font-bold">
                          {Math.round(item.percentage)}%
                        </span>
                      </div>
                      <Progress 
                        value={item.percentage} 
                        className="h-2 bg-secondary"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
           <Card className="border-2 border-border shadow-none h-full">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="divide-y divide-border/50">
                  {recentTransactions.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                      <Wallet className="w-8 h-8 mb-3 opacity-20" />
                      <p className="text-sm font-medium">No activity yet</p>
                    </div>
                  )}
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center border border-border bg-background`}>
                          {tx.type === 'expense'
                            ? <TrendingDown className="h-4 w-4" />
                            : tx.type === 'income'
                              ? <TrendingUp className="h-4 w-4" />
                              : <ArrowUpRight className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">
                            {tx.category?.name || (tx.type === 'transfer' ? 'Transfer' : 'Uncategorized')}
                          </p>
                          <p className="text-xs text-muted-foreground">{format(tx.date, 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold">
                        {tx.type === 'expense' ? '-' : '+'}฿{Number(tx.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
