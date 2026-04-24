import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { TopBar } from '@/components/layout/top-bar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: physio } = await supabase
    .from('physiotherapists')
    .select('full_name, profile_photo_url, verification_status')
    .eq('id', user.id)
    .single()

  if (physio?.verification_status !== 'verified') redirect('/verification')

  // Unread message count for sidebar badge
  const { count: unreadCount } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('sender_type', 'patient')
    .is('read_at', null)

  const physioInfo = {
    full_name: physio.full_name,
    profile_photo_url: physio.profile_photo_url,
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar physio={physioInfo} unreadCount={unreadCount ?? 0} />
      <div className="flex flex-1 flex-col overflow-hidden lg:pl-0">
        <TopBar physio={physioInfo} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
