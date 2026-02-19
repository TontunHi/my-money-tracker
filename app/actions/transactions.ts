'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { db } from '@/db'
import { transactions, wallets } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const transactionSchema = z.object({
  amount: z.coerce.number().positive(),
  date: z.date(),
  categoryId: z.string().optional(),
  walletId: z.string().min(1, "Wallet is required"),
  type: z.enum(['income', 'expense', 'transfer']),
  note: z.string().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  transferToWalletId: z.string().optional(),
}).refine((data) => {
  if (data.type === 'transfer' && !data.transferToWalletId) {
    return false;
  }
  return true;
}, {
  message: "Destination wallet is required for transfers",
  path: ["transferToWalletId"],
});

export async function createTransaction(prevState: any, formData: FormData) {
  const rawData = {
    amount: formData.get('amount'),
    date: new Date(formData.get('date') as string),
    categoryId: formData.get('categoryId') as string || undefined,
    walletId: formData.get('walletId') as string,
    type: formData.get('type'),
    note: (formData.get('note') as string) || undefined,
    transferToWalletId: formData.get('transferToWalletId') as string || undefined,
  }

  console.log('Server Action received rawData:', rawData);

  const validatedFields = transactionSchema.safeParse(rawData)

  if (!validatedFields.success) {
    console.error('Validation failed:', validatedFields.error.flatten());
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      rootErrors: validatedFields.error.flatten().formErrors,
      message: 'Validation failed. Please check your inputs.',
    }
  }

  const { amount, date, categoryId, walletId, type, note, transferToWalletId } = validatedFields.data

  console.log('Creating transaction with:', { amount, date, categoryId, walletId, type, note, transferToWalletId });

  try {
    // 1. Create Transaction
    await db.insert(transactions).values({
      amount: amount.toString(),
      date,
      categoryId,
      walletId,
      type: type as "income" | "expense" | "transfer",
      note,
      transferToWalletId,
    })

    // 2. Update Wallet Balance
    if (type === 'income') {
      await db.update(wallets)
        .set({ balance: sql`${wallets.balance} + ${amount}` })
        .where(eq(wallets.id, walletId))
    } else if (type === 'expense') {
      await db.update(wallets)
        .set({ balance: sql`${wallets.balance} - ${amount}` })
        .where(eq(wallets.id, walletId))
    } else if (type === 'transfer' && transferToWalletId) {
      // Deduct from source
      await db.update(wallets)
        .set({ balance: sql`${wallets.balance} - ${amount}` })
        .where(eq(wallets.id, walletId))
      // Add to destination
      await db.update(wallets)
        .set({ balance: sql`${wallets.balance} + ${amount}` })
        .where(eq(wallets.id, transferToWalletId))
    }
  } catch (error) {
    console.error('Failed to create transaction:', error);
    return {
      message: error instanceof Error ? error.message : 'Database Error: Failed to Create Transaction.',
    }
  }

  revalidatePath('/')
  revalidatePath('/transactions')
  revalidatePath('/wallets')
  return { success: true }
}

export async function deleteTransaction(id: string) {
  try {
    // Get transaction details first to revert balance
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id))
    
    if (!transaction) return

    const amount = Number(transaction.amount)

    // Revert balance
    if (transaction.type === 'income') {
      await db.update(wallets)
        .set({ balance: sql`${wallets.balance} - ${amount}` })
        .where(eq(wallets.id, transaction.walletId))
    } else if (transaction.type === 'expense') {
      await db.update(wallets)
        .set({ balance: sql`${wallets.balance} + ${amount}` })
        .where(eq(wallets.id, transaction.walletId))
    } else if (transaction.type === 'transfer' && transaction.transferToWalletId) {
       // Revert transfer: Add back to source, deduct from dest
       await db.update(wallets)
        .set({ balance: sql`${wallets.balance} + ${amount}` })
        .where(eq(wallets.id, transaction.walletId))

       await db.update(wallets)
        .set({ balance: sql`${wallets.balance} - ${amount}` })
        .where(eq(wallets.id, transaction.transferToWalletId))
    }

    await db.delete(transactions).where(eq(transactions.id, id))
  } catch (error) {
    console.error('Failed to delete transaction:', error)
    return { message: 'Database Error: Failed to Delete Transaction.' }
  }

  revalidatePath('/')
  revalidatePath('/transactions')
  revalidatePath('/wallets')
}

export async function updateTransaction(id: string, prevState: any, formData: FormData) {
  const rawData = {
    amount: formData.get('amount'),
    date: new Date(formData.get('date') as string),
    categoryId: formData.get('categoryId') as string || undefined,
    walletId: formData.get('walletId') as string,
    type: formData.get('type'),
    note: (formData.get('note') as string) || undefined,
    transferToWalletId: formData.get('transferToWalletId') as string || undefined,
  }

  const validatedFields = transactionSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      rootErrors: validatedFields.error.flatten().formErrors,
      message: 'Validation failed. Please check your inputs.',
    }
  }

  const { amount, date, categoryId, walletId, type, note, transferToWalletId } = validatedFields.data

  try {
    // 1. Get original transaction to reverse its balance effect
    const [original] = await db.select().from(transactions).where(eq(transactions.id, id))
    if (!original) return { message: 'Transaction not found.' }

    const origAmount = Number(original.amount)

    // 2. Reverse original balance effect
    if (original.type === 'income') {
      await db.update(wallets).set({ balance: sql`${wallets.balance} - ${origAmount}` }).where(eq(wallets.id, original.walletId))
    } else if (original.type === 'expense') {
      await db.update(wallets).set({ balance: sql`${wallets.balance} + ${origAmount}` }).where(eq(wallets.id, original.walletId))
    } else if (original.type === 'transfer' && original.transferToWalletId) {
      await db.update(wallets).set({ balance: sql`${wallets.balance} + ${origAmount}` }).where(eq(wallets.id, original.walletId))
      await db.update(wallets).set({ balance: sql`${wallets.balance} - ${origAmount}` }).where(eq(wallets.id, original.transferToWalletId))
    }

    // 3. Update the transaction record
    await db.update(transactions).set({
      amount: amount.toString(),
      date,
      categoryId,
      walletId,
      type: type as "income" | "expense" | "transfer",
      note,
      transferToWalletId,
    }).where(eq(transactions.id, id))

    // 4. Apply new balance effect
    if (type === 'income') {
      await db.update(wallets).set({ balance: sql`${wallets.balance} + ${amount}` }).where(eq(wallets.id, walletId))
    } else if (type === 'expense') {
      await db.update(wallets).set({ balance: sql`${wallets.balance} - ${amount}` }).where(eq(wallets.id, walletId))
    } else if (type === 'transfer' && transferToWalletId) {
      await db.update(wallets).set({ balance: sql`${wallets.balance} - ${amount}` }).where(eq(wallets.id, walletId))
      await db.update(wallets).set({ balance: sql`${wallets.balance} + ${amount}` }).where(eq(wallets.id, transferToWalletId))
    }
  } catch (error) {
    console.error('Failed to update transaction:', error)
    return { message: error instanceof Error ? error.message : 'Database Error: Failed to Update Transaction.' }
  }

  revalidatePath('/')
  revalidatePath('/transactions')
  revalidatePath('/wallets')
}

