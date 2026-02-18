'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createCategory, updateCategory } from '@/app/actions/categories'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(['income', 'expense']),
  icon: z.string().default('circle'),
})

type CategoryFormProps = {
  onSuccess?: () => void;
  defaultValues?: {
    id?: string;
    name: string;
    type: 'income' | 'expense';
    icon: string;
  };
}

export function CategoryForm({ onSuccess, defaultValues }: CategoryFormProps) {
  const [isPending, setIsPending] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: defaultValues?.name || '',
      type: defaultValues?.type || 'expense',
      icon: defaultValues?.icon || 'circle',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsPending(true)
    const formData = new FormData()
    formData.append('name', values.name)
    formData.append('type', values.type)
    formData.append('icon', values.icon)

    if (defaultValues?.id) {
        await updateCategory(defaultValues.id, null, formData)
    } else {
        await createCategory(null, formData)
    }
    
    setIsPending(false)
    form.reset()
    onSuccess?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Food" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (defaultValues?.id ? 'Update Category' : 'Create Category')}
        </Button>
      </form>
    </Form>
  )
}
