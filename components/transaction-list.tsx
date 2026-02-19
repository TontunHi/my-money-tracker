'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EditTransactionSheet } from '@/components/edit-transaction-sheet'
import { Pencil } from 'lucide-react'

type Transaction = {
  id: string
  type: string
  amount: string | number
  date: Date
  categoryId?: string | null
  walletId: string
  transferToWalletId?: string | null
  note?: string | null
  wallet: { id: string; name: string; balance: string | number }
  category?: { id: string; name: string; type: string; icon?: string | null } | null
}

type TransactionListProps = {
  transactions: Transaction[]
  wallets: { id: string; name: string; balance: string | number }[]
  categories: { id: string; name: string; type: 'income' | 'expense'; icon?: string | null }[]
}

export function TransactionList({ transactions, wallets, categories }: TransactionListProps) {
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)

  if (transactions.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">No transactions found.</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Start by adding a new transaction.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="group flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-card/50 hover:bg-accent/50 transition-all border border-border/50 hover:border-primary/20 shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className={`
                flex h-12 w-12 items-center justify-center rounded-2xl transition-colors flex-shrink-0
                ${tx.type === 'income' ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20' :
                  tx.type === 'expense' ? 'bg-red-500/10 text-red-600 dark:bg-red-500/20' :
                  'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20'}
              `}>
                <span className="text-lg font-bold">
                  {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : '⇄'}
                </span>
              </div>
              <div className="space-y-1 min-w-0">
                <p className="font-semibold text-base leading-none">
                  {tx.category?.name || (tx.type === 'transfer' ? 'Transfer' : 'Uncategorized')}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">{format(tx.date, 'dd MMM yyyy')}</span>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                  <span className="truncate">{tx.wallet.name}</span>
                  {tx.note && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                      <span className="italic truncate max-w-[100px]">{tx.note}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
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
              
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary"
                onClick={() => setEditingTx(tx)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {editingTx && (
        <EditTransactionSheet
          transaction={editingTx}
          wallets={wallets}
          categories={categories}
          open={!!editingTx}
          onOpenChange={(open) => { if (!open) setEditingTx(null) }}
        />
      )}
    </>
  )
}
