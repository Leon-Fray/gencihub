'use server'

import { createSupabaseAdminClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export interface Model {
  id: number
  name: string
  google_drive_link: string
  bio: string
  created_at: string
  is_active: boolean
  storage_folder?: string
}

export interface ModelAssignment {
  id: number
  va_id: string
  model_id: number
  assigned_at: string
  assigned_by: string | null
  model?: Model
}

/**
 * Get all active models
 */
export async function getModels(): Promise<Model[]> {
  const supabase = createSupabaseAdminClient()
  
  const { data, error } = await supabase
    .from('models')
    .select('*')
    .eq('is_active', true)
    .order('name')
  
  if (error) {
    console.error('Error fetching models:', error)
    return []
  }
  
  return data || []
}

/**
 * Get all model assignments for a specific VA
 */
export async function getVAModelAssignments(vaId: string): Promise<ModelAssignment[]> {
  const supabase = createSupabaseAdminClient()
  
  const { data, error } = await supabase
    .from('model_assignments')
    .select(`
      *,
      model:models(*)
    `)
    .eq('va_id', vaId)
    .order('assigned_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching VA model assignments:', error)
    return []
  }
  
  return data || []
}

/**
 * Get all VAs with their assigned models
 */
export async function getAllVAsWithModels() {
  const supabase = createSupabaseAdminClient()
  
  // Get all VAs
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'va')
  
  if (!profiles) return []
  
  // Get all model assignments with model details
  const { data: assignments } = await supabase
    .from('model_assignments')
    .select(`
      *,
      model:models(*)
    `)
  
  // Combine the data
  return profiles.map(profile => {
    const vaAssignments = assignments?.filter(a => a.va_id === profile.id) || []
    return {
      ...profile,
      models: vaAssignments.map(a => a.model).filter(Boolean)
    }
  })
}

/**
 * Assign a model to a VA
 */
export async function assignModelToVA(
  vaId: string,
  modelId: number,
  assignedBy: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient()
  
  // Check if assignment already exists
  const { data: existing } = await supabase
    .from('model_assignments')
    .select('id')
    .eq('va_id', vaId)
    .eq('model_id', modelId)
    .single()
  
  if (existing) {
    return { success: false, error: 'Model is already assigned to this VA' }
  }
  
  const { error } = await supabase
    .from('model_assignments')
    .insert({
      va_id: vaId,
      model_id: modelId,
      assigned_by: assignedBy
    })
  
  if (error) {
    console.error('Error assigning model to VA:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin/users')
  revalidatePath('/admin/models')
  
  return { success: true }
}

/**
 * Remove a model assignment from a VA
 */
export async function removeModelFromVA(
  vaId: string,
  modelId: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient()
  
  const { error } = await supabase
    .from('model_assignments')
    .delete()
    .eq('va_id', vaId)
    .eq('model_id', modelId)
  
  if (error) {
    console.error('Error removing model from VA:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin/users')
  revalidatePath('/admin/models')
  
  return { success: true }
}

/**
 * Create a new model
 */
export async function createModel(
  name: string,
  googleDriveLink: string,
  bio: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient()
  
  const { error } = await supabase
    .from('models')
    .insert({
      name,
      google_drive_link: googleDriveLink,
      bio
    })
  
  if (error) {
    console.error('Error creating model:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin/models')
  
  return { success: true }
}

/**
 * Update a model
 */
export async function updateModel(
  id: number,
  name: string,
  googleDriveLink: string,
  bio: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient()
  
  const { error } = await supabase
    .from('models')
    .update({
      name,
      google_drive_link: googleDriveLink,
      bio
    })
    .eq('id', id)
  
  if (error) {
    console.error('Error updating model:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin/models')
  
  return { success: true }
}

/**
 * Deactivate a model
 */
export async function deactivateModel(id: number): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient()
  
  const { error } = await supabase
    .from('models')
    .update({ is_active: false })
    .eq('id', id)
  
  if (error) {
    console.error('Error deactivating model:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin/models')
  
  return { success: true }
}

