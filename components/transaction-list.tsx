'use client'

import { useState, memo } from 'react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EditTransactionSheet } from '@/components/edit-transaction-sheet'
import { Pencil, ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const TransactionItem = memo(function TransactionItem({ 
  tx, 
  onEdit 
}: { 
  tx: Transaction
  onEdit: (tx: Transaction) => void 
}) {
  const isIncome = tx.type === 'income'
  const isExpense = tx.type === 'expense'
  const isTransfer = tx.type === 'transfer'

  return (
    <div
      className="group flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl hover:bg-secondary/50 transition-all border border-transparent hover:border-border/50"
    >
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background transition-colors flex-shrink-0",
        )}>
           {isIncome ? <TrendingUp className="h-5 w-5" /> : 
            isExpense ? <TrendingDown className="h-5 w-5" /> : 
            <ArrowRightLeft className="h-5 w-5" />}
        </div>
        <div className="space-y-1 min-w-0">
          <p className="font-bold text-sm leading-none">
            {tx.category?.name || (isTransfer ? 'Transfer' : 'Uncategorized')}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{format(tx.date, 'dd MMM yyyy')}</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="truncate">{tx.wallet.name}</span>
            {tx.note && (
              <>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span className="italic truncate max-w-[100px]">{tx.note}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
        <div className="text-right">
          <span className="block text-lg font-bold tracking-tight">
            {isExpense ? '-' : isIncome ? '+' : ''}
            ฿{Number(tx.amount).toLocaleString()}
          </span>
          <Badge variant="outline" className="mt-1 text-[10px] uppercase tracking-wider font-bold border-primary text-primary bg-transparent rounded-sm px-1.5 py-0">
            {tx.type}
          </Badge>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-lg hover:bg-primary hover:text-primary-foreground"
          onClick={() => onEdit(tx)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
})

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
          <TransactionItem key={tx.id} tx={tx} onEdit={setEditingTx} />
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
