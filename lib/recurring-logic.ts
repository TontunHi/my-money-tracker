import { db } from '@/db'
import { recurringRules, transactions, wallets } from '@/db/schema'
import { eq, lte, and } from 'drizzle-orm'
import { addMonths, addYears } from 'date-fns'

export async function processRecurringRules() {
  const now = new Date()

  // 1. Fetch active rules where nextDueDate is in the past or today
  const pendingRules = await db
    .select()
    .from(recurringRules)
    .where(and(eq(recurringRules.isActive, true), lte(recurringRules.nextDueDate, now)))

  if (pendingRules.length === 0) return

  for (const rule of pendingRules) {
    try {
      await db.transaction(async (tx) => {
        // Create the transaction
        await tx.insert(transactions).values({
          walletId: rule.walletId,
          categoryId: rule.categoryId,
          amount: rule.amount,
          date: rule.nextDueDate, // Use the due date as transaction date
          type: 'expense', // Recurring rules in this app seem to be expenses based on schema usage, primarily
          note: 'Recurring Transaction',
        })

        // Update wallet balance
        const [wallet] = await tx.select().from(wallets).where(eq(wallets.id, rule.walletId)).limit(1)

        if (wallet) {
           const newBalance = Number(wallet.balance) - Number(rule.amount)
           await tx.update(wallets)
             .set({ balance: newBalance.toFixed(2), updatedAt: new Date() })
             .where(eq(wallets.id, rule.walletId))
        }

        // Calculate next due date
        let nextDate = new Date(rule.nextDueDate)
        if (rule.frequency === 'monthly') {
          nextDate = addMonths(nextDate, 1)
        } else if (rule.frequency === 'yearly') {
          nextDate = addYears(nextDate, 1)
        }

        // Update the rule
        await tx.update(recurringRules)
          .set({ nextDueDate: nextDate, updatedAt: new Date() })
          .where(eq(recurringRules.id, rule.id))
      })
      console.log(`Processed recurring rule ${rule.id}`)
    } catch (error) {
      console.error(`Failed to process rule ${rule.id}`, error)
    }
  }
}
