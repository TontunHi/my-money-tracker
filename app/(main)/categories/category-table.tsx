'use client'

import { Category } from './categories-client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tag, TrendingUp, TrendingDown, Edit2, Trash2 } from 'lucide-react'
import { deleteCategory } from '@/app/actions/categories'

interface CategoryTableProps {
  data: Category[];
  onEdit: (category: Category) => void;
}

export function CategoryTable({ data, onEdit }: CategoryTableProps) {
  return (
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
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onEdit(cat)}>
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
}
