'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { db } from '@/db'
import { wallets } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const walletSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(['cash', 'bank', 'credit_card', 'investment']),
  balance: z.coerce.number(),
  currency: z.string().default('THB'),
})

export async function createWallet(prevState: any, formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    type: formData.get('type'),
    balance: formData.get('balance'),
    currency: formData.get('currency') || 'THB',
  }

  const validated = walletSchema.safeParse(rawData)

  if (!validated.success) {
    return { message: 'Invalid data' }
  }

  try {
    await db.insert(wallets).values({
      name: validated.data.name,
      type: validated.data.type as any,
      balance: validated.data.balance.toString(),
      currency: validated.data.currency,
      isActive: true,
    })
  } catch (_error) {
    return { message: 'Failed to create wallet' }
  }

  revalidatePath('/wallets')
  revalidatePath('/')
}

export async function deleteWallet(id: string) {
  try {
    await db.delete(wallets).where(eq(wallets.id, id))
  } catch (_error) {
    // console.error('Failed to delete wallet')
    throw new Error('Failed to delete wallet')
  }
  revalidatePath('/wallets')
  revalidatePath('/')
}
