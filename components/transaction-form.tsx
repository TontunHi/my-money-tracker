'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  Gamepad2
} from 'lucide-react'
import { createTransaction } from '@/app/actions/transactions'
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
import { toast } from 'sonner'

// Map of icon names to Lucide components
const IconMap: Record<string, any> = {
  Wallet,
  Laptop,
  TrendingUp,
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
  Gamepad2
}

const formSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
  date: z.date(),
  categoryId: z.string().optional(),
  walletId: z.string().min(1, "Wallet is required"),
  transferToWalletId: z.string().optional(),
  note: z.string().optional(),
}).refine((data) => {
  if (data.type === 'transfer' && !data.transferToWalletId) {
    return false;
  }
  if (data.type === 'transfer' && data.walletId === data.transferToWalletId) {
    return false;
  }
  return true;
}, {
  message: "Invalid transfer destination",
  path: ["transferToWalletId"],
});

type TransactionFormProps = {
  wallets: { id: string; name: string; balance: string | number }[];
  categories: { id: string; name: string; type: 'income' | 'expense'; icon?: string }[];
  onSuccess?: () => void;
}

export function TransactionForm({ wallets, categories, onSuccess }: TransactionFormProps) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const defaultWalletId = wallets.length > 0 ? wallets[0].id : '';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      type: 'expense',
      amount: '' as any,
      date: new Date(),
      walletId: defaultWalletId,
      categoryId: undefined,
      transferToWalletId: undefined,
      note: '',
    },
  })

  const type = form.watch('type')

  if (wallets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">
          <Wallet className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-bold text-lg">No Wallets Found</h3>
          <p className="text-muted-foreground text-sm mt-1 max-w-[250px]">Please create a wallet first before adding transactions.</p>
        </div>
      </div>
    )
  }

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

      console.log('Submitting transaction:', values);

      const result = await createTransaction(null, formData)
      
      if ((result?.errors && Object.keys(result.errors).length > 0) || (result?.rootErrors && result.rootErrors.length > 0)) {
         const errorDesc = result.rootErrors?.join(', ') || "Please check your input.";
         toast.error("Validation Error", {
           description: errorDesc
         })
         console.error('Full Submission Result:', result);
      } else if (result?.message) {
         toast.error("Failed to Save", {
           description: result.message
         })
         console.error('Server error:', result.message);
      } else {
         toast.success("Transaction Saved", {
           description: `${values.type === 'income' ? '+' : '-'}฿${values.amount} recorded.`
         })
         form.reset({
            type: values.type,
            amount: '' as any,
            date: new Date(),
            walletId: values.walletId,
            categoryId: undefined,
            transferToWalletId: undefined,
            note: '',
         })
         if (onSuccess) {
           // Called from Dashboard — just close + refresh
           router.refresh()
           onSuccess()
         } else {
           // Called from Transactions page — navigate there
           router.push('/transactions')
         }
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsPending(false)
    }
  }

  const filteredCategories = categories.filter(c => c.type === type)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
          {/* Segmented Control */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-muted/40 rounded-2xl border border-border/40">
           {['income', 'expense', 'transfer'].map((t) => (
             <div 
               key={t}
               className={cn(
                 "cursor-pointer rounded-xl py-2.5 text-center text-sm font-bold transition-all flex items-center justify-center gap-2 relative overflow-hidden group select-none",
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

        {/* Amount Input */}
        <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel className="sr-only">Amount</FormLabel>
                <div className="relative flex justify-center py-1">
                   <div className="relative w-full">
                       <div className={cn(
                         "absolute left-8 top-1/2 -translate-y-1/2 text-2xl font-black transition-colors pointer-events-none select-none",
                         type === 'income' ? "text-green-500" : type === 'expense' ? "text-red-500" : "text-blue-500"
                       )}>฿</div>
                       <FormControl>
                         <Input 
                            type="number" 
                            step="0.01" 
                            {...field} 
                            className={cn(
                              "pl-12 pr-8 h-16 text-4xl font-black border-none bg-transparent hover:bg-muted/30 focus:bg-muted/30 text-center transition-all rounded-3xl focus-visible:ring-0 shadow-none placeholder:text-muted/20",
                              type === 'income' ? "text-green-600 caret-green-500" : type === 'expense' ? "text-red-600 caret-red-500" : "text-blue-600 caret-blue-500"
                            )}
                            placeholder="0"
                            autoFocus
                         />
                       </FormControl>
                   </div>
                </div>
                <FormMessage className="text-center" />
              </FormItem>
            )}
          />

        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1 -mr-1 custom-scrollbar">
            {/* Date Selection */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">Date</FormLabel>
                  <div className="flex gap-2">
                     <Button 
                        type="button" 
                        variant={format(field.value, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'default' : 'outline'}
                        className="flex-1 rounded-xl h-9 text-sm"
                        onClick={() => field.onChange(new Date())}
                     >
                        Today
                     </Button>
                     <Button 
                        type="button" 
                        variant={format(field.value, 'yyyy-MM-dd') === format(subDays(new Date(), 1), 'yyyy-MM-dd') ? 'default' : 'outline'}
                        className="flex-1 rounded-xl h-9 text-sm"
                        onClick={() => field.onChange(subDays(new Date(), 1))}
                     >
                        Yesterday
                     </Button>
                     <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "flex-none w-[40px] px-0 rounded-xl border-dashed border-border/60 bg-background/50 hover:bg-background transition-all hover:border-border h-9",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  </div>
                  
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Wallet Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
               control={form.control}
               name="walletId"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">{type === 'transfer' ? 'From Wallet' : 'Wallet'}</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                     <FormControl>
                       <SelectTrigger className="h-10 rounded-xl border-border/60 bg-background/50 hover:bg-background transition-all hover:border-border font-medium text-sm">
                         <SelectValue placeholder="Select wallet" />
                       </SelectTrigger>
                     </FormControl>
                     <SelectContent>
                       {wallets.map((w) => (
                         <SelectItem key={w.id} value={w.id}>
                           <span className="flex items-center gap-2 text-sm">
                             <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
                             {w.name}
                             <span className="text-xs text-muted-foreground ml-auto">฿{Number(w.balance).toLocaleString()}</span>
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
                   <FormLabel className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">To Wallet</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                     <FormControl>
                       <SelectTrigger className="h-10 rounded-xl border-border/60 bg-background/50 hover:bg-background transition-all hover:border-border font-medium text-sm">
                         <SelectValue placeholder="Select destination" />
                       </SelectTrigger>
                     </FormControl>
                     <SelectContent>
                       {wallets
                         .filter(w => w.id !== form.getValues('walletId'))
                         .map((w) => (
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
           )}
           </div>

           {/* Category Grid */}
           {type !== 'transfer' && (
             <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">Category</FormLabel>
                    <div className="grid grid-cols-4 gap-2 mt-1">
                        {filteredCategories.map((c) => {
                           const Icon = c.icon && IconMap[c.icon] ? IconMap[c.icon] : CircleDollarSign;
                           const isSelected = field.value === c.id;
                           
                           return (
                             <div 
                               key={c.id} 
                               onClick={() => field.onChange(c.id)}
                               className={cn(
                                  "flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border cursor-pointer transition-all hover:scale-105 active:scale-95",
                                  isSelected 
                                    ? "bg-primary/10 border-primary shadow-sm"
                                    : "bg-background border-border/40 hover:bg-muted/50 hover:border-border"
                               )}
                             >
                                <div className={cn(
                                   "p-2 rounded-full",
                                   isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}>
                                   <Icon className="w-4 h-4" />
                                </div>
                                <span className={cn(
                                   "text-[10px] font-medium text-center truncate w-full leading-tight",
                                   isSelected ? "text-primary" : "text-muted-foreground"
                                )}>
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
                 <FormLabel className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">Note (Optional)</FormLabel>
                 <FormControl>
                   <Textarea 
                      placeholder="Add a note..." 
                      {...field} 
                      className="resize-none rounded-xl border-border/60 bg-background/50 hover:bg-background transition-all hover:border-border min-h-[60px] focus:bg-background text-sm" 
                   />
                 </FormControl>
                 <FormMessage />
               </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className={cn(
            "w-full h-14 text-lg font-bold rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]",
            type === 'income' ? "bg-green-600 hover:bg-green-700 shadow-green-500/20" : 
            type === 'expense' ? "bg-red-600 hover:bg-red-700 shadow-red-500/20" : 
            "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
          )} 
          disabled={isPending}
        >
          {isPending ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : 'Save Transaction'}
        </Button>
      </form>
    </Form>
  )
}
