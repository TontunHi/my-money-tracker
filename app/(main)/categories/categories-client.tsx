'use client'

import { useState } from 'react'
import { Plus, Trash2, Tag, TrendingUp, TrendingDown, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CategoryForm } from '@/components/category-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { deleteCategory } from '@/app/actions/categories'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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

  const CategoryTable = ({ data }: { data: Category[] }) => (
    <div className="rounded-md border bg-background/50 backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                No categories found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((cat) => (
              <TableRow key={cat.id} className="group cursor-pointer hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${cat.type === 'income' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                      <Tag className="h-4 w-4" />
                    </div>
                    {cat.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`capitalize font-medium ${
                     cat.type === 'income' 
                      ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300' 
                      : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300'
                  }`}>
                    {cat.type === 'income' ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                    {cat.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEdit(cat)}>
                       <Edit2 className="h-4 w-4" />
                    </Button>
                    <form action={deleteCategory.bind(null, cat.id)}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                         <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )

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
          <CategoryTable data={incomeCategories} />
        </TabsContent>
        <TabsContent value="expense" className="mt-0">
          <CategoryTable data={expenseCategories} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
