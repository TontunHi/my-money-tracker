'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, Loader2, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

// Wait, I didn't install toast. I'll just use simple alert or local state for now, or install toast in next step.
// For now, I'll allow form to close on success or show error text.

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
  wallets: { id: string; name: string; balance: string | number }[]; // Adjusted for decimal type
  categories: { id: string; name: string; type: 'income' | 'expense' }[];
  onSuccess?: () => void;
}

export function TransactionForm({ wallets, categories, onSuccess }: TransactionFormProps) {
  const [isPending, setIsPending] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      type: 'expense',
      amount: '' as any, // Initialize as empty string to show placeholder
      date: new Date(),
      walletId: '',
      categoryId: undefined,
      transferToWalletId: undefined,
      note: '',
    },
  })

  const type = form.watch('type')

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsPending(true)
    setServerError(null)

    const formData = new FormData()
    formData.append('type', values.type)
    formData.append('amount', values.amount.toString())
    formData.append('date', values.date.toISOString())
    formData.append('walletId', values.walletId)
    if (values.categoryId) formData.append('categoryId', values.categoryId)
    if (values.transferToWalletId) formData.append('transferToWalletId', values.transferToWalletId)
    if (values.note) formData.append('note', values.note)

    const result = await createTransaction(null, formData)
    
    if (result?.errors) {
       // handle field errors if needed, but client validation usually catches them
    } else if (result?.message) {
       setServerError(result.message)
    } else {
       form.reset()
       onSuccess?.()
    }
    setIsPending(false)
  }

  const filteredCategories = categories.filter(c => c.type === type)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {serverError && <div className="text-red-500 text-sm">{serverError}</div>}
        
          {/* Segmented Control */}
          <div className="grid grid-cols-3 gap-1 p-1.5 bg-muted/50 rounded-2xl border border-border/50">
           {['income', 'expense', 'transfer'].map((t) => (
             <div 
               key={t}
               className={cn(
                 "cursor-pointer rounded-xl py-3 text-center text-sm font-bold transition-all flex items-center justify-center gap-2 relative overflow-hidden group",
                 type === t 
                  ? "bg-background shadow-md text-foreground ring-1 ring-black/5" 
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50",
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
                  "relative flex items-center gap-2",
                   type === t && t === 'income' && "text-green-600 dark:text-green-400",
                   type === t && t === 'expense' && "text-red-600 dark:text-red-400",
                   type === t && t === 'transfer' && "text-blue-600 dark:text-blue-400"
                )}>
                    {t === 'income' ? <TrendingUp className="w-4 h-4" /> : t === 'expense' ? <TrendingDown className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                </div>
             </div>
           ))}
           {/* Hidden Radio Group for logic compatibility */}
           <div className="hidden">
             <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value}>
                  <RadioGroupItem value="income" />
                  <RadioGroupItem value="expense" />
                  <RadioGroupItem value="transfer" />
                </RadioGroup>
              )} 
             />
           </div>
        </div>

        {/* Amount Input - Big & Center */}
        <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="relative group">
                <FormLabel className="sr-only">Amount</FormLabel>
                <div className="relative flex justify-center">
                   <div className="relative w-full max-w-[280px]">
                       <div className={cn(
                         "absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-black transition-colors pointer-events-none",
                         type === 'income' ? "text-green-500" : type === 'expense' ? "text-red-500" : "text-blue-500"
                       )}>฿</div>
                       <FormControl>
                         <Input 
                            type="number" 
                            step="0.01" 
                            {...field} 
                            className={cn(
                              "pl-12 pr-4 h-24 text-5xl font-black border-2 border-transparent bg-muted/30 focus:bg-background hover:bg-muted/50 shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 text-center transition-all rounded-3xl",
                              type === 'income' ? "text-green-600 focus-visible:ring-green-500/30" : type === 'expense' ? "text-red-600 focus-visible:ring-red-500/30" : "text-blue-600 focus-visible:ring-blue-500/30"
                            )}
                            placeholder="0"
                         />
                       </FormControl>
                   </div>
                </div>
                <FormMessage className="text-center" />
              </FormItem>
            )}
          />

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs font-semibold text-muted-foreground ml-1">Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal h-12 rounded-xl border-border/60 bg-background/50 hover:bg-background transition-all hover:border-border",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                          {field.value ? (
                            format(field.value, "dd MMM yyyy")
                          ) : (
                            <span>Pick a date</span>
                          )}
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
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
               control={form.control}
               name="walletId"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel className="text-xs font-semibold text-muted-foreground ml-1">{type === 'transfer' ? 'From Wallet' : 'Wallet'}</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                     <FormControl>
                       <SelectTrigger className="h-12 rounded-xl border-border/60 bg-background/50 hover:bg-background transition-all hover:border-border">
                         <SelectValue placeholder="Select wallet" />
                       </SelectTrigger>
                     </FormControl>
                     <SelectContent>
                       {wallets.map((w) => (
                         <SelectItem key={w.id} value={w.id}>
                           {w.name}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   <FormMessage />
                 </FormItem>
               )}
            />
          </div>

          {type === 'transfer' ? (
             <FormField
               control={form.control}
               name="transferToWalletId"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel className="text-xs font-semibold text-muted-foreground ml-1">To Wallet</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                     <FormControl>
                       <SelectTrigger className="h-12 rounded-xl border-border/60 bg-background/50 hover:bg-background transition-all hover:border-border">
                         <SelectValue placeholder="Select destination" />
                       </SelectTrigger>
                     </FormControl>
                     <SelectContent>
                       {wallets
                         .filter(w => w.id !== form.getValues('walletId'))
                         .map((w) => (
                           <SelectItem key={w.id} value={w.id}>
                             {w.name}
                           </SelectItem>
                         ))}
                     </SelectContent>
                   </Select>
                   <FormMessage />
                 </FormItem>
               )}
             />
           ) : (
             <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground ml-1">Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl border-border/60 bg-background/50 hover:bg-background transition-all hover:border-border">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCategories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
             />
           )}
          
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
               <FormItem>
                 <FormLabel className="text-xs font-semibold text-muted-foreground ml-1">Note</FormLabel>
                 <FormControl>
                   <Textarea 
                      placeholder="Add a note..." 
                      {...field} 
                      className="resize-none rounded-xl border-border/60 bg-background/50 hover:bg-background transition-all hover:border-border min-h-[80px]" 
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
