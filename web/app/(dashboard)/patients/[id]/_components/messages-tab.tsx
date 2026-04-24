'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'
import type { Message } from '@/lib/types/database.types'
import { cn } from '@/lib/utils'

type Props = {
  matchId: string
  physioId: string
  initialMessages: Message[]
}

export function MessagesTab({ matchId, physioId, initialMessages }: Props) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId, supabase])

  async function sendMessage() {
    const content = text.trim()
    if (!content) return

    setSending(true)
    setSendError(null)
    setText('')

    const { error } = await supabase.from('messages').insert({
      match_id: matchId,
      sender_id: physioId,
      sender_type: 'physio',
      content,
    })

    if (error) {
      setSendError('Failed to send. Tap retry.')
      setText(content)
    }
    setSending(false)
  }

  return (
    <div className="flex flex-col h-[500px] rounded-xl border border-border overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No messages yet. Start the conversation.
          </p>
        )}
        {messages.map((msg) => {
          const isPhysio = msg.sender_id === physioId
          return (
            <div
              key={msg.id}
              className={cn('flex', isPhysio ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm',
                  isPhysio
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                )}
              >
                <p>{msg.content}</p>
                <p
                  className={cn(
                    'mt-1 text-[10px]',
                    isPhysio ? 'text-primary-foreground/60' : 'text-muted-foreground'
                  )}
                >
                  {new Date(msg.created_at).toLocaleTimeString('en-GB', { timeStyle: 'short' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 bg-background">
        {sendError && (
          <p className="text-xs text-destructive mb-2">{sendError}</p>
        )}
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
  )
}
