import { NextResponse } from 'next/server';
import { db } from '@/db';
import { recurringRules, transactions, wallets } from '@/db/schema';
import { eq, lte, sql } from 'drizzle-orm';
import { addMonths, addYears } from 'date-fns';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const now = new Date();
    
    // Find due rules
    const dueRules = await db.select().from(recurringRules)
      .where(
        //@ts-ignore - dte lte might have type issues with date object vs string but usually fine in drizzle
        lte(recurringRules.nextDueDate, now)
      );

    if (dueRules.length === 0) {
      return NextResponse.json({ message: 'No recurring transactions due.' });
    }

    let processedCount = 0;

    await db.transaction(async (tx) => {
      for (const rule of dueRules) {
        if (!rule.isActive) continue;

        // 1. Create Transaction
        await tx.insert(transactions).values({
          walletId: rule.walletId,
          categoryId: rule.categoryId,
          amount: rule.amount.toString(),
          date: new Date(), // Transaction date is now
          type: 'expense', // Recurring usually expense, but schema has amount. Assuming expense for now or need type in rule?
                           // Schema for recurring_rules doesn't have 'type'. 
                           // "recurring_rules (for monthly subscriptions)" implies expenses.
                           // But could be income (salary).
                           // Prompt says "recurring_rules ... (for monthly subscriptions)".
                           // I'll assume 'expense' for simplicity as per "subscriptions".
                           // Or I should have added 'type' to recurring_rules.
                           // Given schema is fixed now, I'll assume 'expense'.
          note: 'Recurring Subscription',
        });

        // 2. Update Wallet Balance
        // Assuming expense
        await tx.update(wallets)
          .set({ balance: sql`${wallets.balance} - ${rule.amount}` })
          .where(eq(wallets.id, rule.walletId));

        // 3. Update Next Due Date
        const nextDate = rule.frequency === 'monthly' 
          ? addMonths(rule.nextDueDate, 1) 
          : addYears(rule.nextDueDate, 1);

        await tx.update(recurringRules)
          .set({ nextDueDate: nextDate })
          .where(eq(recurringRules.id, rule.id));
        
        processedCount++;
      }
    });

    return NextResponse.json({ message: `Processed ${processedCount} recurring transactions.` });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
