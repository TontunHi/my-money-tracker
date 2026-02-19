
import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../db/index';
import { transactions, wallets, categories } from '../db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('Starting reproduction script...');

  try {
    // 1. Get a wallet and category to resolve FKs
    const wallet = await db.query.wallets.findFirst();
    if (!wallet) {
      console.error('No wallets found. Cannot proceed.');
      return;
    }
    console.log('Using wallet:', wallet.id, wallet.name);

    const category = await db.query.categories.findFirst({
        where: (categories, { eq }) => eq(categories.type, 'expense')
    });
    
    // If no category, we can try with null if schema allows, but let's try to get one.
    const categoryId = category ? category.id : undefined;
    console.log('Using category:', categoryId);

    // 2. Prepare transaction data
    const newTx = {
      amount: "100.00", // Decimal as string
      date: new Date(),
      categoryId: categoryId,
      walletId: wallet.id,
      type: "expense" as const,
      note: "Test Transaction from Script",
    };

    console.log('Attempting to insert transaction:', newTx);

    // 3. Insert transaction
    const result = await db.insert(transactions).values(newTx).returning();
    console.log('Insert result:', result);

    console.log('Transaction inserted successfully!');

    // 4. Clean up (optional, but good for repeatability)
    // await db.delete(transactions).where(eq(transactions.id, result[0].id));
    // console.log('Cleaned up test transaction.');

  } catch (error) {
    console.error('FAILED to insert transaction:', error);
  } finally {
    process.exit(0);
  }
}

main();
