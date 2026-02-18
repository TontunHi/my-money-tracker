import { db } from '@/db'
import { recurringRules, wallets, categories } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { Plus, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

import { RecurringForm } from '@/components/recurring-form'
import { DeleteRecurringButton } from '@/components/delete-recurring-button'

export const revalidate = 0;

async function getRecurringData() {
  const rules = await db.select({
    id: recurringRules.id,
    amount: recurringRules.amount,
    frequency: recurringRules.frequency,
    nextDueDate: recurringRules.nextDueDate,
    walletName: wallets.name,
    categoryName: categories.name,
  })
    .from(recurringRules)
    .leftJoin(wallets, eq(recurringRules.walletId, wallets.id))
    .leftJoin(categories, eq(recurringRules.categoryId, categories.id))

  const allWallets = await db.select().from(wallets).where(eq(wallets.isActive, true));
  const allCategories = await db.select().from(categories).where(eq(categories.type, 'expense')); // Only expense categories for subscriptions

  return { rules, allWallets, allCategories };
}

export default async function RecurringPage() {
  const { rules, allWallets, allCategories } = await getRecurringData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Recurring Rules</h1>
        
        <Dialog>
          <DialogTrigger asChild>
             <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
             <DialogHeader>
                <DialogTitle>New Recurring Subscription</DialogTitle>
             </DialogHeader>
             <RecurringForm wallets={allWallets} categories={allCategories} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rules.length === 0 && <p className="col-span-full text-muted-foreground text-center">No recurring rules set.</p>}
        
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{rule.categoryName || 'Unknown Category'}</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">-฿{Number(rule.amount).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground capitalize">{rule.frequency}</p>
              <p className="text-xs text-muted-foreground mt-1">Next: {format(rule.nextDueDate, 'MMM dd, yyyy')}</p>
              <p className="text-xs text-muted-foreground">From: {rule.walletName}</p>

              <div className="mt-4 flex justify-end">
                <DeleteRecurringButton id={rule.id} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
