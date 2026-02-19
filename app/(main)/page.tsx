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

  return { totalBalance, income, expense, recentTransactions, chartData, allWallets, allCategories };
}

export default async function DashboardPage() {
  const { totalBalance, income, expense, recentTransactions, chartData, allWallets, allCategories } = await getDashboardData();

  const processedCategories = allCategories.map(c => ({
    id: c.id, name: c.name, type: c.type as 'income' | 'expense', icon: c.icon
  }));
  const processedWallets = allWallets.map(w => ({
    id: w.id, name: w.name, balance: w.balance,
  }));

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{format(new Date(), 'MMMM yyyy')}</p>
        </div>
        <QuickTransactionButton wallets={processedWallets} categories={processedCategories} />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Total Balance */}
        <Card className="col-span-3 sm:col-span-1 border bg-card shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Total Balance</p>
            <p className="text-2xl font-bold tracking-tight">
              ฿{totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        {/* Income */}
        <Card className="col-span-3 sm:col-span-1 border bg-card shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Income</p>
              <ArrowUpRight className="h-3.5 w-3.5 text-green-600" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-green-600">
              ฿{income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        {/* Expense */}
        <Card className="col-span-3 sm:col-span-1 border bg-card shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Expenses</p>
              <ArrowDownLeft className="h-3.5 w-3.5 text-red-500" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-red-500">
              ฿{expense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3 border shadow-sm">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-semibold">Daily Expenses</CardTitle>
            <CardDescription className="text-xs">{format(new Date(), 'MMMM yyyy')}</CardDescription>
          </CardHeader>
          <CardContent className="pl-1 pr-3 pb-3">
            <DashboardChart data={chartData} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border shadow-sm">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
            <CardDescription className="text-xs">Last 5 transactions</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <ScrollArea className="h-[240px]">
              <div className="space-y-0.5 pr-2">
                {recentTransactions.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-36 text-muted-foreground">
                    <Wallet className="w-7 h-7 mb-2 opacity-25" />
                    <p className="text-xs">No activity yet</p>
                  </div>
                )}
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        tx.type === 'expense' ? 'bg-red-50 dark:bg-red-950/30' :
                        tx.type === 'income' ? 'bg-green-50 dark:bg-green-950/30' :
                        'bg-muted'
                      }`}>
                        {tx.type === 'expense'
                          ? <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                          : tx.type === 'income'
                            ? <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                            : <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate leading-tight">
                          {tx.category?.name || (tx.type === 'transfer' ? 'Transfer' : 'Uncategorized')}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{format(tx.date, 'MMM dd')}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold ml-2 flex-shrink-0 ${
                      tx.type === 'expense' ? 'text-red-500' :
                      tx.type === 'income' ? 'text-green-600' :
                      'text-muted-foreground'
                    }`}>
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
  );
}
