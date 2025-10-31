import { Card, CardContent } from '@/components/ui/card'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVAModelAssignments } from '@/lib/model-actions'
import { redirect } from 'next/navigation'
import { ModelTileWithGallery } from '@/components/model-tile-with-gallery'

export default async function ModelDetailsPage() {
  const supabase = createSupabaseServerClient()
  
  // Get the current user session
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/')
  }

  const vaId = session.user.id

  // Fetch models assigned to this VA
  const modelAssignments = await getVAModelAssignments(vaId)
  const models = modelAssignments.map(assignment => assignment.model).filter((model): model is NonNullable<typeof model> => model !== null && model !== undefined)

  // Function to get initials from model name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Function to generate gradient based on model name
  const getGradient = (name: string) => {
    const gradients = [
      'from-purple-400 to-pink-400',
      'from-blue-400 to-cyan-400',
      'from-green-400 to-emerald-400',
      'from-orange-400 to-red-400',
      'from-indigo-400 to-purple-400',
      'from-pink-400 to-rose-400',
    ]
    const index = name.charCodeAt(0) % gradients.length
    return gradients[index]
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Models</h1>
        <p className="mt-2 text-gray-600">View details of celebrity models assigned to you</p>
      </div>

      {models.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-gray-500 text-lg">No models assigned to you yet.</p>
              <p className="text-gray-400 text-sm mt-2">Contact your administrator to get models assigned.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <ModelTileWithGallery
              key={model.id}
              model={model}
            />
          ))}
        </div>
      )}
    </div>
  )
}
