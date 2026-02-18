'use client'

import { useState } from 'react'
import { deleteRecurringRule } from '@/app/actions/recurring'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
 
// Wait, transactions form had an issue with useToast. I'll use simple alert or just revalidate.
// To be safe and consistent with other parts, I'll avoid toast for now and rely on revalidation.

export function DeleteRecurringButton({ id }: { id: string }) {
  const [isPending, setIsPending] = useState(false)

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this rule?')) return
    
    setIsPending(true)
    await deleteRecurringRule(id)
    setIsPending(false)
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
      onClick={handleDelete}
      disabled={isPending}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  )
}
