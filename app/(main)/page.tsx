// ... imports ...
import { db } from '@/db';
import { transactions, wallets, categories } from '@/db/schema';
import { desc, eq, sql, and, gte, lte } from 'drizzle-orm';
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DashboardChart } from '@/components/dashboard-chart';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { QuickTransactionButton } from '@/components/quick-transaction-button';

export const revalidate = 0;

async function getDashboardData() {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  // Total Balance
  const walletsRes = await db.select({ 
    balance: wallets.balance
  }).from(wallets).where(eq(wallets.isActive, true));
  
  const totalBalance = walletsRes.reduce((acc, w) => acc + Number(w.balance), 0);

  // Monthly Income & Expense
  const monthlyStats = await db.select({
    type: transactions.type,
    amount: sql<number>`sum(${transactions.amount})`
  })
  .from(transactions)
  .where(
    and(
      gte(transactions.date, start),
      lte(transactions.date, end)
    )
  )
  .groupBy(transactions.type);

  const income = Number(monthlyStats.find(s => s.type === 'income')?.amount || 0);
  const expense = Number(monthlyStats.find(s => s.type === 'expense')?.amount || 0);

  // Daily Expenses for Chart
  const dailyStats = await db.select({
    date: transactions.date,
    amount: sql<number>`sum(${transactions.amount})`
  })
  .from(transactions)
  .where(and(gte(transactions.date, start), lte(transactions.date, end), eq(transactions.type, 'expense')))
  .groupBy(transactions.date);

  // Fill in missing days
  const daysInMonth = eachDayOfInterval({ start, end });
  const chartData = daysInMonth.map(day => {
    const stat = dailyStats.find(s => format(s.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
    return {
       name: format(day, 'd'),
       total: stat ? Number(stat.amount) : 0
    };
  });

  // Recent Transactions
  const recentTransactions = await db.query.transactions.findMany({
    orderBy: [desc(transactions.date)],
    limit: 5,
    with: {
      wallet: true,
      category: true,
    }
  });

  // Fetch all wallets and categories for the Quick Add Form
  const allWallets = await db.select().from(wallets).where(eq(wallets.isActive, true));
  const allCategories = await db.select().from(categories);

  return { totalBalance, income, expense, recentTransactions, chartData, allWallets, allCategories };
}

export default async function DashboardPage() {
  const { totalBalance, income, expense, recentTransactions, chartData, allWallets, allCategories } = await getDashboardData();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-lg font-medium">Overview for {format(new Date(), 'MMMM yyyy')}</p>
        </div>
        
        <QuickTransactionButton wallets={allWallets} categories={allCategories} />
      </div>
      
      {/* Bento Grid Layout */}
      <div className="grid gap-6 md:grid-cols-4 lg:grid-cols-8">
        
        {/* Total Balance - Large Card */}
        <Card className="col-span-4 lg:col-span-4 glass-card border-none shadow-xl bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <Wallet className="w-32 h-32 text-primary" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
               <span className="text-5xl font-black tracking-tighter text-foreground">฿{totalBalance.toLocaleString()}</span>
            </div>
            <div className="mt-6 flex gap-3">
               <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50">
                  <div className="bg-green-500/20 p-1 rounded-full"><ArrowUpRight className="h-3 w-3" /></div>
                  <span className="text-sm font-bold">+฿{income.toLocaleString()}</span>
               </div>
               <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                  <div className="bg-red-500/20 p-1 rounded-full"><ArrowDownLeft className="h-3 w-3" /></div>
                  <span className="text-sm font-bold">-฿{expense.toLocaleString()}</span>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Small Stats Cards */}
        <Card className="col-span-2 lg:col-span-2 glass-card flex flex-col justify-between border-t-4 border-t-green-500/50">
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-bold text-muted-foreground">Income</CardTitle>
             <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600">
               <TrendingUp className="h-4 w-4" />
             </div>
           </CardHeader>
           <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">฿{income.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">+12% vs last month</p>
           </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-2 glass-card flex flex-col justify-between border-t-4 border-t-red-500/50">
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-bold text-muted-foreground">Expense</CardTitle>
             <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600">
               <TrendingDown className="h-4 w-4" />
             </div>
           </CardHeader>
           <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">฿{expense.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">-5% vs last month</p>
           </CardContent>
        </Card>

        {/* Chart Section */}
        <Card className="col-span-4 lg:col-span-5 glass-card shadow-lg">
          <CardHeader>
            <CardTitle className="font-bold">Daily Expenses</CardTitle>
            <CardDescription>Spending trend for this month</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
             <DashboardChart data={chartData} /> 
          </CardContent>
        </Card>

        {/* Recent Transactions List */}
        <Card className="col-span-4 lg:col-span-3 glass-card shadow-lg">
          <CardHeader>
            <CardTitle className="font-bold">Recent Activity</CardTitle>
            <CardDescription>Latest 5 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {recentTransactions.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <p>No recent activity</p>
                  </div>
                )}
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-border/50">
                    <div className="flex items-center gap-3">
                       <div className={`p-2.5 rounded-full ${tx.type === 'expense' ? 'bg-red-100 text-red-600 dark:bg-red-900/20' : 'bg-green-100 text-green-600 dark:bg-green-900/20'}`}>
                          {tx.type === 'expense' ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                       </div>
                       <div className="space-y-0.5">
                        <p className="text-sm font-bold leading-none text-foreground">
                          {tx.category?.name || (tx.type === 'transfer' ? 'Transfer' : 'Uncategorized')}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">{format(tx.date, 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    <div className={`font-bold text-sm ${tx.type === 'expense' ? 'text-red-600 dark:text-red-400' : tx.type === 'income' ? 'text-green-600 dark:text-green-400' : ''}`}>
                      {tx.type === 'expense' ? '-' : '+'}{Number(tx.amount).toLocaleString()}
                    </div>
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
