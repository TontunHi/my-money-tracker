'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { TransactionForm } from '@/components/transaction-form'

interface AddTransactionDialogProps {
  wallets: any[]
  categories: any[]
}

export function AddTransactionDialog({ wallets, categories }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        size="lg"
        className="rounded-full shadow-lg hover:shadow-primary/25 transition-all font-bold bg-gradient-to-r from-primary to-primary/80 hover:scale-105 active:scale-95"
        onClick={() => setOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" /> Add Transaction
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg w-full max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40 shrink-0">
            <DialogTitle className="text-xl font-bold">Add New Transaction</DialogTitle>
            <DialogDescription>Record your financial activity.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <TransactionForm
              wallets={wallets}
              categories={categories}
              onSuccess={() => setOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
