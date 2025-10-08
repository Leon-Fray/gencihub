import { createSupabaseServerClient } from '@/lib/supabase'
import { getVAModelAssignments } from '@/lib/model-actions'
import { redirect } from 'next/navigation'
import { NewAccountPageClient } from '@/components/new-account-page-client'

export default async function NewAccountPage() {
  const supabase = createSupabaseServerClient()
  
  // Get the current user session
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/')
  }

  const vaId = session.user.id

  // Fetch the VA's profile to get their name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', vaId)
    .single()

  // Fetch models assigned to this VA
  const modelAssignments = await getVAModelAssignments(vaId)
  const models = modelAssignments.map(assignment => assignment.model).filter(Boolean)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">New Account Setup</h1>
        <p className="mt-2 text-gray-600">Create and configure new social media accounts for campaigns</p>
      </div>

      <NewAccountPageClient
        models={models as any[]}
        vaName={profile?.full_name || session.user.email || 'VA User'}
        vaId={vaId}
      />
    </div>
  )
}
