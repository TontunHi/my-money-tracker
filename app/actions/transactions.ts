'use server'

import { db } from '@/db'
import { transactions, wallets } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const transactionSchema = z.object({
  amount: z.coerce.number().positive(),
  date: z.date(),
  categoryId: z.string().optional(),
  walletId: z.string().min(1, "Wallet is required"),
  type: z.enum(['income', 'expense', 'transfer']),
  note: z.string().optional(),
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
    note: formData.get('note') as string,
    transferToWalletId: formData.get('transferToWalletId') as string || undefined,
  }

  const validatedFields = transactionSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Transaction.',
    }
  }

  const { amount, date, categoryId, walletId, type, note, transferToWalletId } = validatedFields.data

  try {
    await db.transaction(async (tx) => {
      // 1. Create Transaction
      await tx.insert(transactions).values({
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
        await tx.update(wallets)
          .set({ balance: sql`${wallets.balance} + ${amount}` })
          .where(eq(wallets.id, walletId))
      } else if (type === 'expense') {
        await tx.update(wallets)
          .set({ balance: sql`${wallets.balance} - ${amount}` })
          .where(eq(wallets.id, walletId))
      } else if (type === 'transfer' && transferToWalletId) {
        // Deduct from source
        await tx.update(wallets)
          .set({ balance: sql`${wallets.balance} - ${amount}` })
          .where(eq(wallets.id, walletId))
        
        // Add to destination
        await tx.update(wallets)
          .set({ balance: sql`${wallets.balance} + ${amount}` })
          .where(eq(wallets.id, transferToWalletId))
      }
    })
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Transaction.',
    }
  }

  revalidatePath('/')
  revalidatePath('/transactions')
  revalidatePath('/wallets')
  redirect('/transactions')
}

export async function deleteTransaction(id: string) {
  try {
    await db.transaction(async (tx) => {
      // Get transaction details first to revert balance
      const [transaction] = await tx.select().from(transactions).where(eq(transactions.id, id))
      
      if (!transaction) return

      const amount = Number(transaction.amount)

      // Revert balance
      if (transaction.type === 'income') {
        await tx.update(wallets)
          .set({ balance: sql`${wallets.balance} - ${amount}` })
          .where(eq(wallets.id, transaction.walletId))
      } else if (transaction.type === 'expense') {
        await tx.update(wallets)
          .set({ balance: sql`${wallets.balance} + ${amount}` })
          .where(eq(wallets.id, transaction.walletId))
      } else if (transaction.type === 'transfer' && transaction.transferToWalletId) {
         // Revert transfer: Add back to source, deduct from dest
         await tx.update(wallets)
          .set({ balance: sql`${wallets.balance} + ${amount}` })
          .where(eq(wallets.id, transaction.walletId))

         await tx.update(wallets)
          .set({ balance: sql`${wallets.balance} - ${amount}` })
          .where(eq(wallets.id, transaction.transferToWalletId))
      }

      await tx.delete(transactions).where(eq(transactions.id, id))
    })
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Transaction.' }
  }

  revalidatePath('/')
  revalidatePath('/transactions')
  revalidatePath('/wallets')
}
