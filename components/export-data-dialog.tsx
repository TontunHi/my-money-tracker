'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { exportTransactions } from '@/app/actions/export'

export function ExportDataDialog() {
  const [mode, setMode] = useState<'month' | 'custom'>('month')
  const [date, setDate] = useState<Date | undefined>(new Date())
  
  // Custom Range
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  
  const [isExporting, setIsExporting] = useState(false)

  // Generate Year options (current year +/- 5)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)
  
  const months = [
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' },
  ]

  const handleExport = async () => {
    try {
      setIsExporting(true)
      
      let start, end;

      if (mode === 'month' && date) {
        start = new Date(date.getFullYear(), date.getMonth(), 1)
        end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      } else if (mode === 'custom' && startDate && endDate) {
        start = startDate
        end = endDate
      } else {
        return // Invalid state
      }

      // Call Server Action
      const csvData = await exportTransactions(start, end)
      
      // Download Client-side
      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions_${format(start, 'yyyy-MM-dd')}_to_${format(end, 'yyyy-MM-dd')}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="hidden md:flex">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Transactions</DialogTitle>
          <DialogDescription>
            Download your transaction history as a CSV file.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant={mode === 'month' ? 'default' : 'outline'} 
              onClick={() => setMode('month')}
              className="flex-1"
            >
              By Month
            </Button>
            <Button 
              variant={mode === 'custom' ? 'default' : 'outline'} 
              onClick={() => setMode('custom')}
              className="flex-1"
            >
              Custom Range
            </Button>
          </div>

          {mode === 'month' ? (
             <div className="flex gap-2">
                <Select 
                  value={date?.getMonth().toString()} 
                  onValueChange={(val) => {
                    const newDate = new Date(date || new Date())
                    newDate.setMonth(parseInt(val))
                    setDate(newDate)
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                   value={date?.getFullYear().toString()}
                   onValueChange={(val) => {
                      const newDate = new Date(date || new Date())
                      newDate.setFullYear(parseInt(val))
                      setDate(newDate)
                   }}
                >
                   <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Year" />
                   </SelectTrigger>
                   <SelectContent>
                      {years.map((y) => (
                         <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                   </SelectContent>
                </Select>
             </div>
          ) : (
            <div className="flex flex-col gap-2">
               <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                     <span className="text-xs font-medium text-muted-foreground">Start Date</span>
                     <Popover>
                        <PopoverTrigger asChild>
                           <Button
                              variant={"outline"}
                              className={cn(
                                 "w-full justify-start text-left font-normal",
                                 !startDate && "text-muted-foreground"
                              )}
                           >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                           </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                           <Calendar
                              mode="single"
                              selected={startDate}
                              onSelect={setStartDate}
                              initialFocus
                           />
                        </PopoverContent>
                     </Popover>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-xs font-medium text-muted-foreground">End Date</span>
                     <Popover>
                        <PopoverTrigger asChild>
                           <Button
                              variant={"outline"}
                              className={cn(
                                 "w-full justify-start text-left font-normal",
                                 !endDate && "text-muted-foreground"
                              )}
                           >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                           </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                           <Calendar
                              mode="single"
                              selected={endDate}
                              onSelect={setEndDate}
                              initialFocus
                           />
                        </PopoverContent>
                     </Popover>
                  </div>
               </div>
            </div>
          )}
        </div>

        <Button onClick={handleExport} disabled={isExporting}>
          {isExporting ? 'Exporting...' : 'Download CSV'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
