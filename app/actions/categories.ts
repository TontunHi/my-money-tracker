'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { db } from '@/db'
import { categories } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(['income', 'expense']),
  icon: z.string().default('circle'), // default icon
})

export async function createCategory(prevState: any, formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    type: formData.get('type'),
    icon: formData.get('icon') || 'circle',
  }

  const validated = categorySchema.safeParse(rawData)

  if (!validated.success) {
    return { message: 'Invalid data' }
  }

  try {
    await db.insert(categories).values({
      name: validated.data.name,
      type: validated.data.type as any,
      icon: validated.data.icon,
    })
  } catch (_error) {
    return { message: 'Failed to create category' }
  }

  revalidatePath('/categories')
  revalidatePath('/transactions') // transaction form uses categories
}

export async function deleteCategory(id: string) {
  try {
    await db.delete(categories).where(eq(categories.id, id))
  } catch (_error) {
    // console.error('Failed to delete category')
    throw new Error('Failed to delete category')
  }
  revalidatePath('/categories')
  revalidatePath('/transactions')
}

export async function updateCategory(id: string, prevState: any, formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    type: formData.get('type'),
    icon: formData.get('icon') || 'circle',
  }

  const validated = categorySchema.safeParse(rawData)

  if (!validated.success) {
    return { message: 'Invalid data' }
  }

  try {
    await db.update(categories)
      .set({
        name: validated.data.name,
        type: validated.data.type as any,
        icon: validated.data.icon,
      })
      .where(eq(categories.id, id))
  } catch (_error) {
    return { message: 'Failed to update category' }
  }

  revalidatePath('/categories')
  revalidatePath('/transactions')
}
