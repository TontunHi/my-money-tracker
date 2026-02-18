import { db } from '@/db'
import { categories } from '@/db/schema'
import CategoriesPage from './categories-client' // Import the client component

export const revalidate = 0;

async function getCategories() {
  return await db.select().from(categories);
}

export default async function CategoriesPageServer() {
  const allCategories = await getCategories();
  
  // Transform data to match client component interface
  const formattedCategories = allCategories.map(c => ({
    id: c.id,
    name: c.name,
    type: c.type as 'income' | 'expense',
    icon: c.icon
  }));

  return <CategoriesPage categories={formattedCategories} />
}
