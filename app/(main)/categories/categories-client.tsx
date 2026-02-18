'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CategoryForm } from '@/components/category-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoryTable } from './category-table'

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
}

export default function CategoriesPage({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setOpen(true)
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) setEditingCategory(null)
  }

  const incomeCategories = categories.filter(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Organize your financial tracking.</p>
        </div>
        
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg hover:shadow-primary/25 transition-all" onClick={() => setEditingCategory(null)}>
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Create New Category'}</DialogTitle>
            </DialogHeader>
            <CategoryForm 
               onSuccess={() => setOpen(false)} 
               defaultValues={editingCategory || undefined}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="expense" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50 p-1 h-12 rounded-xl">
          <TabsTrigger value="income" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-green-600 data-[state=active]:shadow-sm transition-all text-base">Income</TabsTrigger>
          <TabsTrigger value="expense" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all text-base">Expense</TabsTrigger>
        </TabsList>
        <TabsContent value="income" className="mt-0">
          <CategoryTable data={incomeCategories} onEdit={handleEdit} />
        </TabsContent>
        <TabsContent value="expense" className="mt-0">
          <CategoryTable data={expenseCategories} onEdit={handleEdit} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
