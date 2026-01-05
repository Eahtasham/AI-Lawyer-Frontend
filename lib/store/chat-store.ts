
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { ChatSession, Message } from '@/types'
import { createClient } from '@/lib/supabase/client'

interface ChatState {
  sessions: ChatSession[]
  currentSessionId: string | null
  isLoading: boolean
  
  // Actions
  setSessions: (sessions: ChatSession[]) => void
  setCurrentSessionId: (id: string | null) => void
  addSession: (session: ChatSession) => void
  updateSession: (id: string, updates: Partial<ChatSession>) => void
  renameSession: (id: string, newTitle: string) => Promise<void>
  togglePinSession: (id: string, isPinned: boolean) => Promise<void>

  // Async Actions
  syncSessions: () => Promise<void>
  deleteSession: (id: string) => Promise<void>
  clearStore: () => void
  updateMessages: (sessionId: string, messages: Message[]) => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,
      isLoading: false,

      setSessions: (sessions) => set({ sessions }),
      setCurrentSessionId: (id) => set({ currentSessionId: id }),
      
      addSession: (session) => set((state) => ({ 
        sessions: [session, ...state.sessions] 
      })),
      
      updateSession: (id, updates) => set((state) => ({
        sessions: state.sessions.map((s) => 
          s.id === id ? { ...s, ...updates } : s
        )
      })),

      updateMessages: (sessionId: string, messages: Message[]) => set((state) => ({
        sessions: state.sessions.map((s) => 
          s.id === sessionId ? { ...s, messages, updatedAt: Date.now() } : s
        )
      })),
      
      deleteSession: async (id: string) => {
          // Optimistic update
          set((state) => ({
            sessions: state.sessions.filter((s) => s.id !== id),
            currentSessionId: state.currentSessionId === id ? null : state.currentSessionId
          }))
          
          try {
              const supabase = createClient()
              await supabase.from('conversations').delete().eq('id', id)
          } catch (error) {
              console.error('Failed to delete session:', error)
              // Optionally revert optimistic update here
          }
      },

      renameSession: async (id: string, newTitle: string) => {
          set((state) => ({
              sessions: state.sessions.map((s) => 
                  s.id === id ? { ...s, title: newTitle } : s
              )
          }))
          
          try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/chat/${id}`, {
                  method: 'PATCH',
                  headers: {
                      'Content-Type': 'application/json',
                       // Auth header usually handled by interceptor or manually if using supabase session
                       // For now assuming we have a way to pass token or backend handles it via cookie/etc.
                       // Actually, in this project, we might need the token.
                       // Let's rely on standard fetch or maybe we need to pass token.
                       // EDIT: The store uses supabase, but the API is generic. 
                       // I'll grab the session token from supabase 
                  },
                  body: JSON.stringify({ title: newTitle })
              })
              
              if (!response.ok) {
                   // If simple fetch fails, let's try supabase client direct update as fallback or alternative
                   // Or just proceed.
                   // Actually, let's use supabase client directly for simplicity if API is not authenticated securely via cookie yet.
                   // But the request was to use the backend API.
                   // I'll stick to updating the store and calling the API with the auth token.
                   
                   // Getting token:
                   const supabase = createClient()
                   const { data: { session } } = await supabase.auth.getSession()
                   if (session) {
                        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/chat/${id}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session.access_token}`
                            },
                            body: JSON.stringify({ title: newTitle })
                        })
                   }
              }
          } catch (error) {
              console.error('Failed to rename session:', error)
          }
      },

      togglePinSession: async (id: string, isPinned: boolean) => {
          set((state) => ({
              sessions: state.sessions.map((s) => 
                  s.id === id ? { ...s, isPinned: isPinned } : s
              )
          }))

          try {
               const supabase = createClient()
               const { data: { session } } = await supabase.auth.getSession()
               if (session) {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/chat/${id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.access_token}`
                        },
                        body: JSON.stringify({ is_pinned: isPinned })
                    })
               }
          } catch (error) {
              console.error('Failed to toggle pin:', error)
          }
      },

      clearStore: () => set({ sessions: [], currentSessionId: null }),

      syncSessions: async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch conversations from Supabase
        const { data: conversations, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', user.id)
          .order('is_pinned', { ascending: false })
          .order('updated_at', { ascending: false })

        if (error) {
            console.error('Failed to sync sessions:', error)
            return
        }

        if (conversations) {
            // Transform Supabase conversations to ChatSession type
            const sessionList = get().sessions
            const mergedSessions = await Promise.all(conversations.map(async (remoteConv) => {
                const localSession = sessionList.find(s => s.id === remoteConv.id)
                
                // If we have local messages, keep them. If not, fetch from Supabase.
                let messages = localSession?.messages || []
                
                if (messages.length === 0) {
                     // Fetch history
                     const { data: remoteMessages } = await supabase
                        .from('messages')
                        .select('*')
                        .eq('conversation_id', remoteConv.id)
                        .order('created_at', { ascending: true })
                    
                     if (remoteMessages) {
                         messages = remoteMessages.map(m => ({
                             id: m.id,
                             role: (m.role === 'assistant' ? 'ai' : m.role) as 'user' | 'ai' | 'system',
                             content: m.content,
                             timestamp: new Date(m.created_at).getTime(),
                             // Map metadata
                             chunks: m.metadata?.chunks,
                             council_opinions: m.metadata?.council_opinions,
                             logs: m.metadata?.logs
                         })) as Message[]
                     }
                }

                return {
                    id: remoteConv.id,
                    title: remoteConv.title || 'New Chat',
                    messages: messages,
                    updatedAt: new Date(remoteConv.updated_at).getTime(),
                    isPinned: remoteConv.is_pinned
                }
            }))
            
            set({ sessions: mergedSessions })
        }
      }
    }),
    {
      name: 'chat-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
