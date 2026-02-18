'use server'

import { db } from '@/db'
import { transactions, categories, wallets } from '@/db/schema'
import { and, gte, lte, eq, desc } from 'drizzle-orm'
import { format } from 'date-fns'

export async function exportTransactions(startDate: Date, endDate: Date) {
  // 1. Fetch data
  const data = await db.select({
    date: transactions.date,
    type: transactions.type,
    category: categories.name,
    amount: transactions.amount,
    wallet: wallets.name,
    note: transactions.note,
  })
  .from(transactions)
  .leftJoin(categories, eq(transactions.categoryId, categories.id))
  .leftJoin(wallets, eq(transactions.walletId, wallets.id))
  .where(
    and(
      gte(transactions.date, startDate),
      lte(transactions.date, endDate)
    )
  )
  .orderBy(desc(transactions.date));

  // 2. Convert to CSV
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Wallet', 'Note'];
  const rows = data.map(row => [
    format(row.date, 'yyyy-MM-dd'),
    row.type,
    row.category || 'Uncategorized',
    row.amount,
    row.wallet || 'Unknown',
    `"${(row.note || '').replace(/"/g, '""')}"` // Escape quotes
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  return csvContent;
}
