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
  profile?: { username: string; full_name: string; avatar_url: string } | null
  onProfileUpdate?: () => void
}

export function SettingsModal({ open, onOpenChange, user, profile, onProfileUpdate }: SettingsModalProps) {
  const { setTheme, theme } = useTheme()
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
        const name = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || ''
        setDisplayName(name)
        setUsername(profile?.username || user.email?.split('@')[0] || '')
    }
  }, [user, profile])

  const handleUpdateProfile = async () => {
    setLoading(true)
    try {
        // Update auth metadata
        const { error: authError } = await supabase.auth.updateUser({
            data: { full_name: displayName }
        })
        if (authError) throw authError

        // Update public profile (username)
        if (user && username) {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ 
                    full_name: displayName,
                    username: username
                })
                .eq('id', user.id)
            
            if (profileError) throw profileError
        }

        onOpenChange(false)
        if (onProfileUpdate) onProfileUpdate();
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
                            <div className="flex flex-col items-center gap-6 mb-6">
                                <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                                    <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-background shadow-xl group-hover:border-primary transition-all duration-300">
                                        <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url} className="object-cover" />
                                        <AvatarFallback className="text-2xl">{displayName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                                    </Avatar>
                                    {/* Edit Badge */}
                                    <div className="absolute bottom-1 right-1 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors border-2 border-background">
                                         {/* Assuming Camera is imported, if not use Settings or similar */}
                                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                                    </div>
                                    <Input 
                                        id="avatar-upload" 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setLoading(true);
                                                try {
                                                    const fileExt = file.name.split('.').pop();
                                                    const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
                                                    const filePath = `${fileName}`;

                                                    const { error: uploadError } = await supabase.storage
                                                        .from('avatars')
                                                        .upload(filePath, file);

                                                    if (uploadError) {
                                                        throw uploadError;
                                                    }

                                                    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
                                                    
                                                    // Update Auth Metadata
                                                    const { error: updateError } = await supabase.auth.updateUser({
                                                        data: { avatar_url: data.publicUrl }
                                                    });
                                                    
                                                    if (updateError) throw updateError;

                                                    // Update Profiles Table (CRITICAL FIX)
                                                    if (user) {
                                                        const { error: profileUpdateError } = await supabase
                                                            .from('profiles')
                                                            .update({ avatar_url: data.publicUrl })
                                                            .eq('id', user.id);

                                                        if (profileUpdateError) {
                                                            console.error("Failed to update profile table:", profileUpdateError);
                                                        }
                                                    }
                                                    
                                                    if (onProfileUpdate) onProfileUpdate();
                                                } catch (error: any) {
                                                    console.error("Error uploading avatar:", error);
                                                    alert("Failed to upload image.");
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input 
                                    id="username" 
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="username"
                                />
                                <p className="text-[0.8rem] text-muted-foreground">
                                    This is your public display name. It can be your real name or a pseudonym.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
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
