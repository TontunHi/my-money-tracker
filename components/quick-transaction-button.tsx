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
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { TransactionForm } from '@/components/transaction-form'

interface QuickTransactionButtonProps {
  wallets: any[]
  categories: any[]
}

export function QuickTransactionButton({ wallets, categories }: QuickTransactionButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full shadow-lg hover:shadow-primary/25 transition-all font-bold bg-gradient-to-r from-primary to-primary/80 hover:scale-105 active:scale-95">
          <Plus className="mr-2 h-5 w-5" /> Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>Enter the details of your new transaction.</DialogDescription>
        </DialogHeader>
        <TransactionForm 
          wallets={wallets} 
          categories={categories} 
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
