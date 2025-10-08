import { createSupabaseServerClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { VANav } from '@/components/va-nav'
import { TimeTracker } from '@/components/time-tracker'
import { DemoBanner } from '@/components/demo-banner'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createSupabaseServerClient()
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  console.log('Dashboard Layout - Session:', session ? 'Found' : 'Not found', sessionError)
  
  if (!session) {
    console.log('Dashboard Layout - No session, redirecting to /')
    redirect('/')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  console.log('Dashboard Layout - Profile:', profile, profileError)

  if (!profile || profile.role !== 'va') {
    console.log('Dashboard Layout - Not a VA, redirecting to /admin')
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VANav />
      <TimeTracker vaId={session.user.id} />
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
