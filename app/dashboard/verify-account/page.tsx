import { createSupabaseServerClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { VerifyAccountClient } from '@/components/verify-account-client'

export default async function VerifyAccountPage() {
  const supabase = createSupabaseServerClient()
  
  // Get the current user session
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Verify Account</h1>
        <p className="mt-2 text-gray-600">Generate email masks using Firefox Relay for account verification</p>
      </div>

      <VerifyAccountClient />
    </div>
  )
}

