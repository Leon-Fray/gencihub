import { createSupabaseServerClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { AdminNav } from '@/components/admin-nav'
import { DemoBanner } from '@/components/demo-banner'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createSupabaseServerClient()
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  console.log('Admin Layout - Session:', session ? 'Found' : 'Not found', sessionError)
  
  if (!session) {
    console.log('Admin Layout - No session, redirecting to /')
    redirect('/')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  console.log('Admin Layout - Profile:', profile, profileError)

  if (!profile || profile.role !== 'admin') {
    console.log('Admin Layout - Not an admin, redirecting to /dashboard')
    redirect('/dashboard')
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
