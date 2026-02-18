import { db } from './index'
import { categories } from './schema'

import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function seed() {
  console.log('Seeding database...')

  try {
    const defaultCategories = [
      { name: 'Salary', type: 'income', icon: 'Wallet' },
      { name: 'Freelance', type: 'income', icon: 'Laptop' },
      { name: 'Investments', type: 'income', icon: 'TrendingUp' },
      { name: 'Food & Dining', type: 'expense', icon: 'Utensils' },
      { name: 'Transportation', type: 'expense', icon: 'Bus' },
      { name: 'Shopping', type: 'expense', icon: 'ShoppingBag' },
      { name: 'Entertainment', type: 'expense', icon: 'Film' },
      { name: 'Bills & Utilities', type: 'expense', icon: 'Zap' },
      { name: 'Health & Fitness', type: 'expense', icon: 'Heart' },
      { name: 'Travel', type: 'expense', icon: 'Plane' },
      { name: 'Education', type: 'expense', icon: 'GraduationCap' },
      { name: 'Personal Care', type: 'expense', icon: 'Smile' },
    ] as const

    for (const category of defaultCategories) {
      await db.insert(categories).values({
        name: category.name,
        type: category.type,
        icon: category.icon,
      })
    }

    console.log('Seeding completed!')
  } catch (error) {
    console.error('Error seeding database:', error)
  }
}

seed()
