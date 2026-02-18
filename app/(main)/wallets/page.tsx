import { db } from '@/db'
import { wallets } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { Wallet, Plus, Trash2, CreditCard, Banknote, Landmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { WalletForm } from '@/components/wallet-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { deleteWallet } from '@/app/actions/wallets'

async function getWallets() {
  return await db.select().from(wallets).where(eq(wallets.isActive, true));
}

export default async function WalletsPage() {
  const allWallets = await getWallets();

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'cash': return <Banknote className="h-4 w-4" />;
      case 'credit_card': return <CreditCard className="h-4 w-4" />;
      case 'bank': return <Landmark className="h-4 w-4" />;
      default: return <Wallet className="h-4 w-4" />; 
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallets</h1>
          <p className="text-muted-foreground">Manage your payment sources.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full shadow-md hover:shadow-primary/25 transition-all">
              <Plus className="mr-2 h-4 w-4" /> Add Wallet
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Wallet</DialogTitle>
            </DialogHeader>
            <WalletForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {allWallets.map((wallet) => (
          <Card key={wallet.id} className="glass-card border-none shadow-sm overflow-hidden relative group">
            <div className={`absolute top-0 left-0 w-1 h-full ${
               wallet.type === 'cash' ? 'bg-green-500' : 
               wallet.type === 'credit_card' ? 'bg-purple-500' : 
               'bg-blue-500'
            }`} />
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pl-5 pr-4 pt-4">
              <CardTitle className="text-sm font-semibold truncate max-w-[120px]" title={wallet.name}>{wallet.name}</CardTitle>
              <div className={`p-1.5 rounded-full bg-background/50 shadow-sm ${
                 wallet.type === 'cash' ? 'text-green-500' : 
                 wallet.type === 'credit_card' ? 'text-purple-500' : 
                 'text-blue-500'
              }`}>
                {getWalletIcon(wallet.type)}
              </div>
            </CardHeader>
            <CardContent className="pl-5 pr-4 pb-4">
              <div className="text-2xl font-bold tracking-tight">฿{Number(wallet.balance).toLocaleString()}</div>
              
              <div className="flex items-center justify-between mt-2">
                 <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold bg-muted/50 inline-block px-1.5 py-0.5 rounded">
                    {wallet.type.replace('_', ' ')}
                 </p>
                 
                 <form action={deleteWallet.bind(null, wallet.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3 w-3" />
                   </Button>
                 </form>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Compact Add New Placeholder */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center justify-center p-4 border border-dashed border-muted-foreground/25 rounded-xl hover:border-primary/50 hover:bg-accent/5 transition-all cursor-pointer h-full min-h-[120px] group">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mb-2 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                 <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-primary">New Wallet</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Wallet</DialogTitle>
            </DialogHeader>
            <WalletForm />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
