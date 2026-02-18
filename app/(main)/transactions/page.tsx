// ... imports
import { db } from '@/db'
import { transactions, wallets, categories } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { TransactionForm } from '@/components/transaction-form'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const revalidate = 0;

async function getTransactionsData() {
  const txs = await db.query.transactions.findMany({
    orderBy: [desc(transactions.date)],
    with: {
      wallet: true,
      category: true,
    },
  });
  
  const allWallets = await db.select().from(wallets).where(eq(wallets.isActive, true));
  const allCategories = await db.select().from(categories);

  return { txs, allWallets, allCategories };
}

export default async function TransactionsPage() {
  const { txs, allWallets, allCategories } = await getTransactionsData();

  const processedCategories = allCategories.map(c => ({
    id: c.id,
    name: c.name,
    type: c.type as 'income' | 'expense' 
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Manage your income and expenses.</p>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg hover:shadow-primary/25 transition-all">
              <Plus className="mr-2 h-4 w-4" /> Add Transaction
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Add New Transaction</SheetTitle>
              <SheetDescription>
                Record your financial activity.
              </SheetDescription>
            </SheetHeader>
            <div className="py-6">
              <TransactionForm wallets={allWallets} categories={processedCategories} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Card className="glass-card border-none shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">History</CardTitle>
            <div className="flex items-center gap-2">
               <div className="relative">
                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input type="search" placeholder="Search..." className="pl-9 w-[150px] lg:w-[250px] bg-background/50 border-none shadow-sm focus-visible:ring-1" />
               </div>
               <Button variant="outline" size="icon" className="h-9 w-9">
                  <Filter className="h-4 w-4" />
               </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {txs.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-muted-foreground">No transactions found.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Start by adding a new transaction.</p>
                </div>
              )}
              
              {txs.map((tx) => (
                <div key={tx.id} className="group flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-card/50 hover:bg-accent/50 transition-all border border-border/50 hover:border-primary/20 shadow-sm hover:shadow-md">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className={`
                      flex h-12 w-12 items-center justify-center rounded-2xl transition-colors
                      ${tx.type === 'income' ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20' : 
                        tx.type === 'expense' ? 'bg-red-500/10 text-red-600 dark:bg-red-500/20' : 
                        'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20'}
                    `}>
                        <span className="text-lg font-bold">
                          {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : '⇄'}
                        </span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-base leading-none">
                        {tx.category?.name || (tx.type === 'transfer' ? 'Transfer' : 'Uncategorized')}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground/80">{format(tx.date, 'dd MMM yyyy')}</span>
                        <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                        <span>{tx.wallet.name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                    {tx.note && (
                      <span className="text-xs text-muted-foreground italic truncate max-w-[100px] hidden md:block">
                        {tx.note}
                      </span>
                    )}
                    <div className="text-right">
                       <span className={`block text-lg font-bold tracking-tight ${
                          tx.type === 'income' ? 'text-green-600' : 
                          tx.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                       }`}>
                         {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}
                         ฿{Number(tx.amount).toLocaleString()}
                       </span>
                       <Badge variant="outline" className="mt-1 text-[10px] uppercase tracking-wider font-semibold border-border/50 bg-background/50">
                          {tx.type}
                       </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
