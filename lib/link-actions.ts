'use server'

import { revalidatePath } from 'next/cache'

// Girly.bio Supabase Configuration (DIFFERENT from main app Supabase)
const GIRLY_BIO_SUPABASE_URL = 'https://dtrbuomodpheqtazsghp.supabase.co'
const GIRLY_BIO_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cmJ1b21vZHBoZXF0YXpzZ2hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1Njk4MjMsImV4cCI6MjA2NzE0NTgyM30.L_xCuYvkRvmO7gzvYhJFzQ3_86NMOQnIoF3MYvGJsKE'
const GIRLY_BIO_AUTH_URL = `${GIRLY_BIO_SUPABASE_URL}/auth/v1/token?grant_type=password`
const GIRLY_BIO_LINKS_API_URL = `${GIRLY_BIO_SUPABASE_URL}/rest/v1/links`
const GIRLY_BIO_MODELS_API_URL = `${GIRLY_BIO_SUPABASE_URL}/rest/v1/models`

// User credentials for girly.bio Supabase
const GIRLY_BIO_EMAIL = 'hotman324324@gmail.com'
const GIRLY_BIO_PASSWORD = 'Furda2-kyspyn-bakgot'

export interface Link {
  id: number
  title: string
  destination_url: string
  slug: string
  user_id: string
  domain: string
  is_active: boolean
  created_at: string
  updated_at: string
  clicks?: number
}

/**
 * Get authentication token from girly.bio Supabase
 */
async function getAuthToken(): Promise<{ token: string; userId: string } | null> {
  try {
    console.log('🔐 Authenticating with girly.bio Supabase...')
    
    const response = await fetch(GIRLY_BIO_AUTH_URL, {
      method: 'POST',
      headers: {
        'apikey': GIRLY_BIO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: GIRLY_BIO_EMAIL,
        password: GIRLY_BIO_PASSWORD,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Authentication failed:', response.status, errorText)
      return null
    }

    const authData = await response.json()
    const token = authData.access_token
    const userId = authData.user?.id

    if (!token || !userId) {
      console.error('❌ No access token or user ID in response')
      return null
    }

    console.log('✅ Successfully authenticated with girly.bio')
    return { token, userId }
  } catch (error) {
    console.error('❌ Authentication error:', error)
    return null
  }
}

/**
 * Generate slug for model with incremental numbering starting at 200
 */
async function generateSlug(modelName: string, authToken: string): Promise<string> {
  // Normalize model name: lowercase, remove spaces and special characters
  const baseSlug = modelName.toLowerCase().replace(/[^a-z0-9]/g, '')
  
  try {
    console.log('🔍 Fetching existing slugs for:', baseSlug)
    
    // Find all existing links for this model
    const response = await fetch(
      `${GIRLY_BIO_LINKS_API_URL}?slug=ilike.${baseSlug}*&select=slug&order=slug.desc`,
      {
        method: 'GET',
        headers: {
          'apikey': GIRLY_BIO_API_KEY,
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error('⚠️ Error fetching existing slugs, defaulting to 200')
      return `${baseSlug}200`
    }

    const existingLinks = await response.json()
    
    // Extract numbers from existing slugs
    let maxNumber = 199 // Start at 199 so first increment gives 200
    
    if (existingLinks && existingLinks.length > 0) {
      for (const link of existingLinks) {
        // Extract number from slug (e.g., "modelname201" -> 201)
        const numberMatch = link.slug.match(new RegExp(`^${baseSlug}(\\d+)$`))
        if (numberMatch) {
          const num = parseInt(numberMatch[1], 10)
          if (num > maxNumber) {
            maxNumber = num
          }
        }
      }
    }
    
    // Increment to get next number
    const nextNumber = maxNumber + 1
    const finalSlug = `${baseSlug}${nextNumber}`
    console.log('✅ Generated slug:', finalSlug)
    
    return finalSlug
  } catch (error) {
    console.error('⚠️ Error generating slug:', error)
    return `${baseSlug}200`
  }
}

/**
 * Get model's OnlyFans link from YOUR vaHub database (NOT girly.bio)
 */
async function getModelOfLink(modelName: string): Promise<string | null> {
  try {
    console.log('📋 Fetching model oflink from vaHub database for:', modelName)
    
    // Import Supabase client to query YOUR database
    const { createSupabaseAdminClient } = await import('@/lib/supabase')
    const supabase = createSupabaseAdminClient()
    
    const { data: model, error } = await supabase
      .from('models')
      .select('oflink')
      .eq('name', modelName)
      .single()

    if (error || !model) {
      console.error('❌ Error fetching model from vaHub:', error)
      return null
    }

    if (!model.oflink) {
      console.error('❌ Model has no oflink in vaHub:', modelName)
      return null
    }

    console.log('✅ Found model oflink from vaHub:', model.oflink)
    return model.oflink
  } catch (error) {
    console.error('❌ Error fetching model from vaHub:', error)
    return null
  }
}

/**
 * Create a new redirect link using RAW HTTP requests to girly.bio Supabase
 */
export async function createRedirectLink(
  userId: string, // This is from YOUR app's user, not girly.bio user
  vaName: string,
  modelName: string
): Promise<{ success: boolean; error?: string; link?: Link; url?: string }> {
  console.log('🔗 Creating redirect link...', { userId, vaName, modelName })
  
  try {
    // Step 1: Authenticate with girly.bio Supabase
    const auth = await getAuthToken()
    if (!auth) {
      return { success: false, error: 'Failed to authenticate with girly.bio' }
    }

    // Step 2: Get the model's OnlyFans link from YOUR vaHub database
    const oflink = await getModelOfLink(modelName)
    if (!oflink) {
      return { 
        success: false, 
        error: `Model "${modelName}" not found or has no OnlyFans link configured` 
      }
    }

    // Step 3: Generate slug with incremental numbering
    const slug = await generateSlug(modelName, auth.token)

    // Step 4: Create the link using RAW HTTP POST
    const linkData = {
      title: vaName,
      destination_url: oflink,
      slug: slug,
      user_id: auth.userId, // Use girly.bio's authenticated user ID
      domain: 'girly.bio',
      is_active: true,
    }
    
    console.log('📝 Creating link with data:', linkData)

    const response = await fetch(GIRLY_BIO_LINKS_API_URL, {
      method: 'POST',
      headers: {
        'apikey': GIRLY_BIO_API_KEY,
        'Authorization': `Bearer ${auth.token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(linkData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error creating link:', response.status, errorText)
      return { success: false, error: `Failed to create link: ${errorText}` }
    }

    const createdLinks = await response.json()
    const newLink = createdLinks[0]
    
    if (!newLink) {
      console.error('❌ No link returned from API')
      return { success: false, error: 'No link created' }
    }

    const fullUrl = `https://girly.bio/${slug}`
    console.log('✅ Link created successfully:', fullUrl)
    
    revalidatePath('/dashboard/new-account')
    
    return { 
      success: true, 
      link: newLink,
      url: fullUrl
    }
  } catch (error) {
    console.error('❌ Unexpected error creating link:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
}

/**
 * Get all links for a specific user (from YOUR app's user ID)
 * Note: This won't work with girly.bio database since user IDs don't match
 */
export async function getUserLinks(userId: string): Promise<Link[]> {
  try {
    const auth = await getAuthToken()
    if (!auth) {
      console.error('Failed to authenticate')
      return []
    }

    const response = await fetch(
      `${GIRLY_BIO_LINKS_API_URL}?select=*&order=created_at.desc`,
      {
        method: 'GET',
        headers: {
          'apikey': GIRLY_BIO_API_KEY,
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error('Error fetching links')
      return []
    }

    const data = await response.json()
    return data || []
  } catch (error) {
    console.error('Error fetching user links:', error)
    return []
  }
}

/**
 * Get all links (admin view)
 */
export async function getAllLinks(): Promise<Link[]> {
  try {
    const auth = await getAuthToken()
    if (!auth) {
      console.error('Failed to authenticate')
      return []
    }

    const response = await fetch(
      `${GIRLY_BIO_LINKS_API_URL}?select=*&order=created_at.desc`,
      {
        method: 'GET',
        headers: {
          'apikey': GIRLY_BIO_API_KEY,
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error('Error fetching all links')
      return []
    }

    const data = await response.json()
    return data || []
  } catch (error) {
    console.error('Error fetching all links:', error)
    return []
  }
}

/**
 * Update link status
 */
export async function updateLinkStatus(
  linkId: number,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await getAuthToken()
    if (!auth) {
      return { success: false, error: 'Failed to authenticate' }
    }

    const response = await fetch(
      `${GIRLY_BIO_LINKS_API_URL}?id=eq.${linkId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': GIRLY_BIO_API_KEY,
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error updating link status:', errorText)
      return { success: false, error: errorText }
    }

    revalidatePath('/dashboard/new-account')
    
    return { success: true }
  } catch (error) {
    console.error('Error updating link status:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
}