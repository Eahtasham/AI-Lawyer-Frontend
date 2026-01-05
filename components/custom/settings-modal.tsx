'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTheme } from 'next-themes'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { AlertTriangle, Moon, Sun, Laptop, Trash2, User as UserIcon, Settings, LogOut } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useRouter } from 'next/navigation'

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
}

export function SettingsModal({ open, onOpenChange, user }: SettingsModalProps) {
  const { setTheme, theme } = useTheme()
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
        // Try to get display name from metadata, fallback to email username
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || ''
        setDisplayName(name)
    }
  }, [user])

  const handleUpdateProfile = async () => {
    setLoading(true)
    try {
        const { error } = await supabase.auth.updateUser({
            data: { full_name: displayName }
        })
        if (error) throw error
        // Optionally show toast success
        onOpenChange(false)
    } catch (error) {
        console.error('Error updating profile:', error)
    } finally {
        setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setLoading(true)
    // specific implementation depends on backend function (usually requires admin, or a specific edge function)
    // For now, we will sign out and optionally call a backend endpoint if one existed.
    // Supabase client-side can't strictly delete the user without an edge function usually.
    // We'll simulate by signing out and telling the user functionality is pending backend implementation
    // OR if connected to backend API, call that.
    
    // For this demo, let's just sign out and redirect.
    await supabase.auth.signOut()
    router.push('/login')
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] sm:max-w-[600px] h-[60vh] sm:h-[500px] flex flex-col gap-0 p-0 overflow-hidden rounded-lg">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden">
             <Tabs defaultValue="general" orientation="vertical" className="flex flex-col md:flex-row w-full h-full">
                {/* Sidebar */}
                <div className="w-full md:w-48 border-b md:border-b-0 md:border-r bg-muted/30 p-2 md:p-4 space-y-0 md:space-y-2 shrink-0">
                    <TabsList className="flex flex-row md:flex-col h-auto items-center md:items-start bg-transparent p-0 space-x-1 md:space-x-0 md:space-y-1 w-full justify-between md:justify-start">
                        <TabsTrigger value="general" className="flex-1 md:w-full justify-center md:justify-start px-3 py-2 data-[state=active]:bg-secondary text-xs md:text-sm">
                            <UserIcon className="mr-2 h-4 w-4" />
                            General
                        </TabsTrigger>
                        <TabsTrigger value="appearance" className="flex-1 md:w-full justify-center md:justify-start px-3 py-2 data-[state=active]:bg-secondary text-xs md:text-sm">
                            <Sun className="mr-2 h-4 w-4" />
                            Appearance
                        </TabsTrigger>
                         <TabsTrigger value="danger" className="flex-1 md:w-full justify-center md:justify-start px-3 py-2 data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive text-destructive/80 hover:text-destructive hover:bg-destructive/5 text-xs md:text-sm">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Danger Zone
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                     <TabsContent value="general" className="mt-0 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                                    <AvatarFallback>{displayName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-lg">{user?.email}</p>
                                    <p className="text-sm text-muted-foreground">User ID: {user?.id?.slice(0, 8)}...</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Display Name</Label>
                                <Input 
                                    id="name" 
                                    value={displayName} 
                                    onChange={(e) => setDisplayName(e.target.value)} 
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={handleUpdateProfile} disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="appearance" className="mt-0 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium mb-4">Interface Theme</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div 
                                        className={`cursor-pointer rounded-lg border-2 p-4 flex flex-col items-center gap-2 hover:bg-secondary/50 ${theme === 'light' ? 'border-primary bg-secondary/50' : 'border-transparent'}`}
                                        onClick={() => setTheme('light')}
                                    >
                                        <Sun className="h-6 w-6" />
                                        <span className="text-sm font-medium">Light</span>
                                    </div>
                                    <div 
                                        className={`cursor-pointer rounded-lg border-2 p-4 flex flex-col items-center gap-2 hover:bg-secondary/50 ${theme === 'dark' ? 'border-primary bg-secondary/50' : 'border-transparent'}`}
                                        onClick={() => setTheme('dark')}
                                    >
                                        <Moon className="h-6 w-6" />
                                        <span className="text-sm font-medium">Dark</span>
                                    </div>
                                    <div 
                                        className={`cursor-pointer rounded-lg border-2 p-4 flex flex-col items-center gap-2 hover:bg-secondary/50 ${theme === 'system' ? 'border-primary bg-secondary/50' : 'border-transparent'}`}
                                        onClick={() => setTheme('system')}
                                    >
                                        <Laptop className="h-6 w-6" />
                                        <span className="text-sm font-medium">System</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="danger" className="mt-0 space-y-6">
                         <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-4">
                            <div className="flex flex-col md:flex-row items-start gap-4">
                                <div className="p-2 rounded-full bg-destructive/10 text-destructive mt-1">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-destructive">Delete Account</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Permanently delete your account and all of your content. This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                            
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete My Account
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90 text-white">
                                            Delete Account
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
