import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: physio } = await supabase
    .from('physiotherapists')
    .select('verification_status')
    .eq('id', user.id)
    .single()

  if (physio?.verification_status !== 'verified') redirect('/verification')

  return <>{children}</>
}
