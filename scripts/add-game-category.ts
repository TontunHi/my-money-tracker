
import { db } from '../db';
import { categories } from '../db/schema';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

dotenv.config({ path: '.env.local' });

async function addGameCategory() {
  console.log('Adding Game category...');
  try {
    // Check if it exists first
    const existing = await db.select().from(categories).where(eq(categories.name, 'Game'));
    if (existing.length > 0) {
      console.log('Game category already exists.');
      return;
    }

    await db.insert(categories).values({
      name: 'Game',
      type: 'expense',
      icon: 'Gamepad2',
    });
    console.log('Game category added successfully!');
  } catch (error) {
    console.error('Error adding category:', error);
  }
}

addGameCategory();
