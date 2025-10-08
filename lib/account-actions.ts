'use server'

import { createSupabaseAdminClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export interface AccountRequest {
  id: number
  va_id: string
  model_id: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  reviewed_by: string | null
  reviewed_at: string | null
  admin_notes: string | null
}

/**
 * Create a new account request
 */
export async function createAccountRequest(
  vaId: string,
  modelName: string,
  reason: string
): Promise<{ success: boolean; error?: string; requestId?: number }> {
  const supabase = createSupabaseAdminClient()
  
  try {
    // Get the model ID from the model name
    const { data: model, error: modelError } = await supabase
      .from('models')
      .select('id')
      .eq('name', modelName)
      .single()
    
    if (modelError || !model) {
      console.error('Error fetching model:', modelError)
      return { success: false, error: 'Model not found' }
    }
    
    // Create the account request
    const { data, error } = await supabase
      .from('account_requests')
      .insert({
        va_id: vaId,
        model_id: model.id,
        reason: reason,
        status: 'pending'
      })
      .select('id')
      .single()
    
    if (error) {
      console.error('Error creating account request:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/dashboard/new-account')
    
    return { success: true, requestId: data.id }
  } catch (error) {
    console.error('Unexpected error creating account request:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get all account requests for a specific VA
 */
export async function getVAAccountRequests(vaId: string): Promise<AccountRequest[]> {
  const supabase = createSupabaseAdminClient()
  
  const { data, error } = await supabase
    .from('account_requests')
    .select(`
      *,
      model:models(name),
      profile:profiles!account_requests_va_id_fkey(full_name)
    `)
    .eq('va_id', vaId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching VA account requests:', error)
    return []
  }
  
  return data || []
}

/**
 * Get all account requests (admin only)
 */
export async function getAllAccountRequests(): Promise<AccountRequest[]> {
  const supabase = createSupabaseAdminClient()
  
  const { data, error } = await supabase
    .from('account_requests')
    .select(`
      *,
      model:models(name),
      profile:profiles!account_requests_va_id_fkey(full_name)
    `)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching all account requests:', error)
    return []
  }
  
  return data || []
}

/**
 * Update account request status (admin only)
 */
export async function updateAccountRequestStatus(
  requestId: number,
  status: 'approved' | 'rejected',
  reviewedBy: string,
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient()
  
  const { error } = await supabase
    .from('account_requests')
    .update({
      status,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      admin_notes: adminNotes,
      updated_at: new Date().toISOString()
    })
    .eq('id', requestId)
  
  if (error) {
    console.error('Error updating account request status:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin/account-requests')
  
  return { success: true }
}

