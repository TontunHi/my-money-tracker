// ... imports
import { db } from '@/db'
import { transactions, wallets, categories } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'
import { Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TransactionList } from '@/components/transaction-list'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddTransactionDialog } from '@/components/add-transaction-dialog'

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
    type: c.type as 'income' | 'expense',
    icon: c.icon
  }));

  const processedWallets = allWallets.map(w => ({
    id: w.id,
    name: w.name,
    balance: w.balance,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Manage your income and expenses.</p>
        </div>
        
        <AddTransactionDialog wallets={processedWallets} categories={processedCategories} />
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
          <TransactionList
            transactions={txs}
            wallets={processedWallets}
            categories={processedCategories}
          />
        </CardContent>
      </Card>
    </div>
  )
}
