'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, subDays } from 'date-fns'
import {
  CalendarIcon,
  Loader2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Wallet,
  Laptop,
  Utensils,
  Bus,
  ShoppingBag,
  Film,
  Zap,
  Heart,
  Plane,
  GraduationCap,
  Smile,
  CircleDollarSign,
  Landmark,
  CreditCard,
  Coins,
  Gamepad2,
  Pencil,
  Trash2
} from 'lucide-react'
import { updateTransaction, deleteTransaction } from '@/app/actions/transactions'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

const IconMap: Record<string, any> = {
  Wallet, Laptop, TrendingUp, Utensils, Bus, ShoppingBag,
  Film, Zap, Heart, Plane, GraduationCap, Smile,
  CircleDollarSign, Landmark, CreditCard, Coins, Gamepad2
}

const formSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
  date: z.date(),
  categoryId: z.string().optional(),
  walletId: z.string().min(1, "Wallet is required"),
  transferToWalletId: z.string().optional(),
  note: z.string().optional(),
})

type Transaction = {
  id: string
  type: string
  amount: string | number
  date: Date
  categoryId?: string | null
  walletId: string
  transferToWalletId?: string | null
  note?: string | null
}

type EditTransactionSheetProps = {
  transaction: Transaction
  wallets: { id: string; name: string; balance: string | number }[]
  categories: { id: string; name: string; type: 'income' | 'expense'; icon?: string | null }[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTransactionSheet({
  transaction,
  wallets,
  categories,
  open,
  onOpenChange
}: EditTransactionSheetProps) {
  const [isPending, setIsPending] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      type: transaction.type as any,
      amount: Number(transaction.amount),
      date: new Date(transaction.date),
      walletId: transaction.walletId,
      categoryId: transaction.categoryId || undefined,
      transferToWalletId: transaction.transferToWalletId || undefined,
      note: transaction.note || '',
    },
  })

  const type = form.watch('type')
  const filteredCategories = categories.filter(c => c.type === type)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsPending(true)
    try {
      const formData = new FormData()
      formData.append('type', values.type)
      formData.append('amount', values.amount.toString())
      formData.append('date', values.date.toISOString())
      formData.append('walletId', values.walletId)
      if (values.categoryId) formData.append('categoryId', values.categoryId)
      if (values.transferToWalletId) formData.append('transferToWalletId', values.transferToWalletId)
      if (values.note) formData.append('note', values.note)

      const result = await updateTransaction(transaction.id, null, formData)

      if (result?.message) {
        toast.error('Failed to Update', { description: result.message })
      } else {
        toast.success('Transaction Updated', {
          description: `฿${values.amount} updated successfully.`
        })
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsPending(false)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteTransaction(transaction.id)
      toast.success('Transaction Deleted')
      onOpenChange(false)
      setShowDeleteDialog(false)
    } catch {
      toast.error('Failed to delete transaction')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="flex items-center gap-2">
                  <Pencil className="w-4 h-4" /> Edit Transaction
                </SheetTitle>
                <SheetDescription>Update your transaction details.</SheetDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Type Segmented Control */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-muted/40 rounded-2xl border border-border/40">
                {['income', 'expense', 'transfer'].map((t) => (
                  <div
                    key={t}
                    className={cn(
                      "cursor-pointer rounded-xl py-2.5 text-center text-sm font-bold transition-all flex items-center justify-center gap-2 relative overflow-hidden select-none",
                      type === t
                        ? "bg-background shadow-sm text-foreground ring-1 ring-black/5 dark:ring-white/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/40",
                    )}
                    onClick={() => form.setValue('type', t as any)}
                  >
                    <div className={cn(
                      "absolute inset-0 opacity-0 transition-opacity",
                      type === t && t === 'income' && "bg-green-500/10 opacity-100",
                      type === t && t === 'expense' && "bg-red-500/10 opacity-100",
                      type === t && t === 'transfer' && "bg-blue-500/10 opacity-100",
                    )} />
                    <div className={cn(
                      "relative flex items-center gap-1.5",
                      type === t && t === 'income' && "text-green-600 dark:text-green-400",
                      type === t && t === 'expense' && "text-red-600 dark:text-red-400",
                      type === t && t === 'transfer' && "text-blue-600 dark:text-blue-400"
                    )}>
                      {t === 'income' ? <TrendingUp className="w-4 h-4" /> : t === 'expense' ? <TrendingDown className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Amount</FormLabel>
                    <div className="relative">
                      <div className={cn(
                        "absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black pointer-events-none",
                        type === 'income' ? "text-green-500" : type === 'expense' ? "text-red-500" : "text-blue-500"
                      )}>฿</div>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          className={cn(
                            "pl-9 h-14 text-3xl font-black border-none bg-muted/30 focus:bg-muted/50 rounded-2xl focus-visible:ring-0 shadow-none",
                            type === 'income' ? "text-green-600" : type === 'expense' ? "text-red-600" : "text-blue-600"
                          )}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</FormLabel>
                    <div className="flex gap-2">
                      <Button type="button" variant={format(field.value, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'default' : 'outline'} className="flex-1 rounded-xl h-9 text-sm" onClick={() => field.onChange(new Date())}>Today</Button>
                      <Button type="button" variant={format(field.value, 'yyyy-MM-dd') === format(subDays(new Date(), 1), 'yyyy-MM-dd') ? 'default' : 'outline'} className="flex-1 rounded-xl h-9 text-sm" onClick={() => field.onChange(subDays(new Date(), 1))}>Yesterday</Button>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className="flex-none w-[40px] px-0 rounded-xl border-dashed h-9">
                              <CalendarIcon className="h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(d) => d > new Date()} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Wallet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="walletId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{type === 'transfer' ? 'From Wallet' : 'Wallet'}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 rounded-xl font-medium text-sm">
                            <SelectValue placeholder="Select wallet" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {wallets.map((w) => (
                            <SelectItem key={w.id} value={w.id}>
                              <span className="flex items-center gap-2 text-sm">
                                <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
                                {w.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {type === 'transfer' && (
                  <FormField
                    control={form.control}
                    name="transferToWalletId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To Wallet</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 rounded-xl font-medium text-sm">
                              <SelectValue placeholder="Select destination" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {wallets.filter(w => w.id !== form.getValues('walletId')).map((w) => (
                              <SelectItem key={w.id} value={w.id}>
                                <span className="flex items-center gap-2 text-sm">
                                  <Wallet className="w-3.5 h-3.5 text-muted-foreground" />{w.name}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Category Grid */}
              {type !== 'transfer' && filteredCategories.length > 0 && (
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</FormLabel>
                      <div className="grid grid-cols-4 gap-2 mt-1">
                        {filteredCategories.map((c) => {
                          const Icon = c.icon && IconMap[c.icon] ? IconMap[c.icon] : CircleDollarSign
                          const isSelected = field.value === c.id
                          return (
                            <div
                              key={c.id}
                              onClick={() => field.onChange(c.id)}
                              className={cn(
                                "flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border cursor-pointer transition-all hover:scale-105 active:scale-95",
                                isSelected ? "bg-primary/10 border-primary shadow-sm" : "bg-background border-border/40 hover:bg-muted/50"
                              )}
                            >
                              <div className={cn("p-2 rounded-full", isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className={cn("text-[10px] font-medium text-center truncate w-full leading-tight", isSelected ? "text-primary" : "text-muted-foreground")}>
                                {c.name}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Note */}
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Note (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Add a note..." {...field} className="resize-none rounded-xl min-h-[60px] text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className={cn(
                  "w-full h-12 text-base font-bold rounded-2xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]",
                  type === 'income' ? "bg-green-600 hover:bg-green-700 shadow-green-500/20" :
                  type === 'expense' ? "bg-red-600 hover:bg-red-700 shadow-red-500/20" :
                  "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                )}
                disabled={isPending}
              >
                {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Update Transaction'}
              </Button>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction?</DialogTitle>
            <DialogDescription>
              This will permanently delete this transaction and revert the wallet balance. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
