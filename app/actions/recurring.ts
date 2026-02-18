'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { db } from '@/db'
import { recurringRules } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const ruleSchema = z.object({
  walletId: z.string().min(1),
  categoryId: z.string().min(1),
  amount: z.coerce.number().positive(),
  frequency: z.enum(['monthly', 'yearly']),
  nextDueDate: z.date(),
})

export async function createRecurringRule(prevState: any, formData: FormData) {
  const rawData = {
    walletId: formData.get('walletId'),
    categoryId: formData.get('categoryId'),
    amount: formData.get('amount'),
    frequency: formData.get('frequency'),
    nextDueDate: new Date(formData.get('nextDueDate') as string),
  }

  const validated = ruleSchema.safeParse(rawData)
  if (!validated.success) return { message: 'Invalid Data' }

  try {
    await db.insert(recurringRules).values({
      walletId: validated.data.walletId,
      categoryId: validated.data.categoryId,
      amount: validated.data.amount.toString(),
      frequency: validated.data.frequency as 'monthly' | 'yearly',
      nextDueDate: validated.data.nextDueDate,
      isActive: true,
    })
  } catch (_error) {
    return { message: 'Database Error' }
  }

  revalidatePath('/recurring')
}

export async function deleteRecurringRule(id: string) {
  try {
    await db.delete(recurringRules).where(eq(recurringRules.id, id))
  } catch (_error) {
    return { message: 'Failed to delete' }
  }
  revalidatePath('/recurring')
}
