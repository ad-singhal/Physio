'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import type { Message } from '@/lib/types/database.types'
import { cn } from '@/lib/utils'

type Thread = {
  matchId: string
  patientId: string
  patientName: string
  patientPhotoUrl: string | null
  lastMessage: Message | null
  unreadCount: number
}

type Props = {
  threads: Thread[]
  physioId: string
}

export function MessagingInbox({ threads, physioId }: Props) {
  const supabase = createClient()
  const [activeThread, setActiveThread] = useState<Thread | null>(threads[0] ?? null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeThread) return
    setLoadingMessages(true)

    supabase
      .from('messages')
      .select('id, match_id, sender_id, sender_type, content, created_at, read_at')
      .eq('match_id', activeThread.matchId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setMessages((data as Message[]) ?? [])
        setLoadingMessages(false)
      })

    // Mark patient messages as read
    supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('match_id', activeThread.matchId)
      .eq('sender_type', 'patient')
      .is('read_at', null)
      .then(() => {})
  }, [activeThread?.matchId, supabase])

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Realtime subscription
  useEffect(() => {
    if (!activeThread) return

    const channel = supabase
      .channel(`inbox:${activeThread.matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${activeThread.matchId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeThread?.matchId, supabase])

  async function sendMessage() {
    const content = text.trim()
    if (!content || !activeThread) return
    setSending(true)
    setText('')
    await supabase.from('messages').insert({
      match_id: activeThread.matchId,
      sender_id: physioId,
      sender_type: 'physio',
      content,
    })
    setSending(false)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border border-border overflow-hidden">
      {/* Thread list */}
      <div className="w-72 border-r border-border flex flex-col shrink-0">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.map((thread) => (
            <button
              key={thread.matchId}
              onClick={() => setActiveThread(thread)}
              className={cn(
                'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-border/50 last:border-0',
                activeThread?.matchId === thread.matchId
                  ? 'bg-primary/5'
                  : 'hover:bg-muted/50'
              )}
            >
              <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center shrink-0 overflow-hidden">
                {thread.patientPhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thread.patientPhotoUrl} alt={thread.patientName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-white text-xs font-semibold">{thread.patientName.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground truncate">{thread.patientName}</p>
                  {thread.lastMessage && (
                    <p className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(thread.lastMessage.created_at).toLocaleTimeString('en-GB', { timeStyle: 'short' })}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-xs text-muted-foreground truncate">
                    {thread.lastMessage ? thread.lastMessage.content : 'No messages yet'}
                  </p>
                  {thread.unreadCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white shrink-0">
                      {thread.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active thread */}
      {activeThread ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Thread header */}
          <div className="border-b border-border px-4 py-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
              {activeThread.patientPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeThread.patientPhotoUrl} alt={activeThread.patientName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-white text-xs font-semibold">{activeThread.patientName.charAt(0)}</span>
              )}
            </div>
            <p className="text-sm font-semibold text-foreground">{activeThread.patientName}</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loadingMessages ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No messages yet.</p>
            ) : null}

            {messages.map((msg) => {
              const isPhysio = msg.sender_id === physioId
              return (
                <div key={msg.id} className={cn('flex', isPhysio ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm',
                      isPhysio
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                    )}
                  >
                    <p>{msg.content}</p>
                    <p className={cn('mt-1 text-[10px]', isPhysio ? 'text-primary-foreground/60' : 'text-muted-foreground')}>
                      {new Date(msg.created_at).toLocaleTimeString('en-GB', { timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                disabled={sending}
                className="flex-1"
              />
              <Button size="icon" onClick={sendMessage} disabled={sending || !text.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted-foreground">Select a conversation</p>
        </div>
      )}
    </div>
  )
}
