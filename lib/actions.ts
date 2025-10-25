'use server'

import { createSupabaseAdminClient } from '@/lib/supabase'
import { encrypt, decrypt } from '@/lib/encryption'
import { revalidatePath } from 'next/cache'

// Task Management Actions
export async function createTask(formData: FormData) {
  const supabase = createSupabaseAdminClient()
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const assignedToId = formData.get('assignedToId') as string
  const dueDate = formData.get('dueDate') as string
  const taskType = formData.get('taskType') as string
  const targetSubredditsRaw = formData.get('targetSubreddits') as string

  // Parse target subreddits - handle both JSON array format and line-separated format
  let targetSubreddits = null
  if (targetSubredditsRaw && taskType === 'subreddit_upvote') {
    try {
      // Try parsing as JSON first
      targetSubreddits = JSON.parse(targetSubredditsRaw)
    } catch {
      // If not JSON, treat as line-separated list
      targetSubreddits = targetSubredditsRaw
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0)
    }
  }

  const { error } = await supabase
    .from('tasks')
    .insert({
      title,
      description: description || null,
      assigned_to_id: assignedToId || null,
      due_date: dueDate || null,
      task_type: taskType || 'general',
      target_subreddits: targetSubreddits,
    })

  if (error) {
    throw new Error(`Failed to create task: ${error.message}`)
  }

  revalidatePath('/admin')
  revalidatePath('/admin/tasks')
  revalidatePath('/dashboard')
}

export async function updateTaskStatus(taskId: number, status: string) {
  const supabase = createSupabaseAdminClient()
  
  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)

  if (error) {
    throw new Error(`Failed to update task: ${error.message}`)
  }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
}

export async function updateWorkNotes(taskId: string, workNotes: string) {
  const supabase = createSupabaseAdminClient()
  
  const { error } = await supabase
    .from('tasks')
    .update({ work_notes: workNotes })
    .eq('id', taskId)

  if (error) {
    throw new Error(`Failed to update work notes: ${error.message}`)
  }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/task/${taskId}`)
}

export async function deleteTask(taskId: number) {
  const supabase = createSupabaseAdminClient()
  
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    throw new Error(`Failed to delete task: ${error.message}`)
  }

  revalidatePath('/admin')
  revalidatePath('/admin/tasks')
}

// Resource Request Actions
export async function getAvailableIP(vaId: string) {
  const supabase = createSupabaseAdminClient()
  
  // Get the least recently used IP
  const { data: ipData, error } = await supabase
    .from('ip_addresses')
    .select('*')
    .order('last_used_at', { ascending: true, nullsFirst: true })
    .limit(1)
    .single()

  if (error) {
    throw new Error(`Failed to get IP address: ${error.message}`)
  }

  // Update the IP as used
  await supabase
    .from('ip_addresses')
    .update({
      last_used_by_id: vaId,
      last_used_at: new Date().toISOString(),
    })
    .eq('id', ipData.id)

  return ipData.ip_address
}

export async function getRedirectLink() {
  try {
    const response = await fetch(process.env.PYTHON_REDIRECT_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to generate redirect link')
    }

    const data = await response.json()
    return data.link
  } catch (error) {
    throw new Error('Failed to generate redirect link')
  }
}

export async function getAccountCredentials(platformName: string) {
  const supabase = createSupabaseAdminClient()
  
  const { data: credential, error } = await supabase
    .from('account_credentials')
    .select('*')
    .eq('platform_name', platformName)
    .single()

  if (error) {
    throw new Error(`Failed to get credentials: ${error.message}`)
  }

  return {
    platform_name: credential.platform_name,
    username: credential.username,
    password: decrypt(credential.encrypted_password),
  }
}

export async function spoofImage(formData: FormData) {
  const file = formData.get('image') as File
  
  if (!file) {
    throw new Error('No image file provided')
  }

  const formDataToSend = new FormData()
  formDataToSend.append('image', file)

  try {
    const response = await fetch(process.env.PYTHON_SPOOFER_API_URL!, {
      method: 'POST',
      body: formDataToSend,
    })

    if (!response.ok) {
      throw new Error('Failed to spoof image')
    }

    const data = await response.json()
    return data.link
  } catch (error) {
    throw new Error('Failed to spoof image')
  }
}

// Work Log Actions
export async function createWorkLog(formData: FormData) {
  const supabase = createSupabaseAdminClient()
  
  const vaId = formData.get('vaId') as string
  const taskId = parseInt(formData.get('taskId') as string)
  const notes = formData.get('notes') as string
  const ipUsed = formData.get('ipUsed') as string
  const redirectLinkCreated = formData.get('redirectLinkCreated') as string

  const { error } = await supabase
    .from('work_logs')
    .insert({
      va_id: vaId,
      task_id: taskId,
      notes,
      ip_used: ipUsed || null,
      redirect_link_created: redirectLinkCreated || null,
    })

  if (error) {
    throw new Error(`Failed to create work log: ${error.message}`)
  }

  revalidatePath('/dashboard')
}

// Time Tracking Actions
export async function clockIn(vaId: string) {
  const supabase = createSupabaseAdminClient()
  
  const { error } = await supabase
    .from('time_tracking')
    .insert({
      va_id: vaId,
      clock_in: new Date().toISOString(),
    })

  if (error) {
    throw new Error(`Failed to clock in: ${error.message}`)
  }

  revalidatePath('/dashboard')
}

export async function clockOut(vaId: string) {
  const supabase = createSupabaseAdminClient()
  
  // Get the most recent clock-in record without clock-out
  const { data: timeRecord, error: fetchError } = await supabase
    .from('time_tracking')
    .select('*')
    .eq('va_id', vaId)
    .is('clock_out', null)
    .order('clock_in', { ascending: false })
    .limit(1)
    .single()

  if (fetchError) {
    throw new Error(`Failed to find clock-in record: ${fetchError.message}`)
  }

  const { error } = await supabase
    .from('time_tracking')
    .update({
      clock_out: new Date().toISOString(),
    })
    .eq('id', timeRecord.id)

  if (error) {
    throw new Error(`Failed to clock out: ${error.message}`)
  }

  revalidatePath('/dashboard')
}

export async function getTotalHoursWorked(vaId: string) {
  const supabase = createSupabaseAdminClient()
  
  // Get all completed time tracking records
  const { data: timeRecords, error } = await supabase
    .from('time_tracking')
    .select('clock_in, clock_out')
    .eq('va_id', vaId)
    .not('clock_out', 'is', null)
    .order('clock_in', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch time records: ${error.message}`)
  }

  if (!timeRecords || timeRecords.length === 0) {
    return {
      totalHours: 0,
      totalShifts: 0,
      records: []
    }
  }

  // Calculate total hours
  const total = timeRecords.reduce((sum, record) => {
    const clockIn = new Date(record.clock_in)
    const clockOut = new Date(record.clock_out)
    const hours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)
    return sum + hours
  }, 0)

  return {
    totalHours: total,
    totalShifts: timeRecords.length,
    records: timeRecords
  }
}

// Admin Actions
export async function createSchedule(formData: FormData) {
  const supabase = createSupabaseAdminClient()
  
  const vaId = formData.get('vaId') as string
  const startTime = formData.get('startTime') as string
  const endTime = formData.get('endTime') as string
  const notes = formData.get('notes') as string

  const { error } = await supabase
    .from('schedules')
    .insert({
      va_id: vaId,
      start_time: startTime,
      end_time: endTime,
      notes: notes || null,
    })

  if (error) {
    throw new Error(`Failed to create schedule: ${error.message}`)
  }

  revalidatePath('/admin')
}

export async function createAccountCredential(formData: FormData) {
  const supabase = createSupabaseAdminClient()
  
  const platformName = formData.get('platformName') as string
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  const { error } = await supabase
    .from('account_credentials')
    .insert({
      platform_name: platformName,
      username,
      encrypted_password: encrypt(password),
    })

  if (error) {
    throw new Error(`Failed to create credential: ${error.message}`)
  }

  revalidatePath('/admin')
}

export async function bulkInsertIPs(ipAddresses: string[]) {
  const supabase = createSupabaseAdminClient()
  
  const ipData = ipAddresses.map(ip => ({ ip_address: ip.trim() }))
  
  const { error } = await supabase
    .from('ip_addresses')
    .insert(ipData)

  if (error) {
    throw new Error(`Failed to insert IP addresses: ${error.message}`)
  }

  revalidatePath('/admin')
}

// Admin Actions for User Management
export async function createUserProfile(formData: FormData) {
  const supabase = createSupabaseAdminClient()
  
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string

  // Create auth user first
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName
    }
  })

  if (authError) {
    throw new Error(`Failed to create user: ${authError.message}`)
  }

  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      full_name: fullName,
      role: role as 'va' | 'admin',
    })

  if (profileError) {
    throw new Error(`Failed to create profile: ${profileError.message}`)
  }

  revalidatePath('/admin/users')
}

// Cookie Management Actions
export async function getAvailableCookie(vaId: string) {
  const supabase = createSupabaseAdminClient()
  
  // Get the next unassigned cookie (where last_used_by_id is NULL)
  // This ensures each cookie is only assigned once
  const { data: cookieData, error } = await supabase
    .from('cookies')
    .select('*')
    .eq('is_active', true)
    .is('last_used_by_id', null) // Only get cookies that have never been assigned
    .order('id', { ascending: true }) // Get the next available cookie in order
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned - all cookies have been assigned
      throw new Error('No available cookies. All cookie files have been assigned to VAs.')
    }
    throw new Error(`Failed to get cookie: ${error.message}`)
  }

  // Permanently assign the cookie to this VA
  await supabase
    .from('cookies')
    .update({
      last_used_by_id: vaId,
      last_used_at: new Date().toISOString(),
    })
    .eq('id', cookieData.id)

  // Create resource assignment record
  await supabase
    .from('resource_assignments')
    .insert({
      va_id: vaId,
      cookie_id: cookieData.id,
      assignment_type: 'new_account',
    })

  // Download the file from storage
  const fileName = cookieData.cookie_file_path.replace(/^\/cookies\//, '')
  
  const { data: fileData, error: downloadError } = await supabase
    .storage
    .from('cookies')
    .download(fileName)

  if (downloadError || !fileData) {
    throw new Error(`Failed to download "${fileName}": ${downloadError?.message || 'File not found'}`)
  }

  const cookieContents = await fileData.text()

  return {
    cookie_name: cookieData.cookie_name,
    cookie_file_path: cookieData.cookie_file_path,
    cookie_contents: cookieContents,
  }
}

// Redirect Link Management Actions
export async function getAvailableRedirectLink(vaId: string) {
  const supabase = createSupabaseAdminClient()
  
  // Get the least recently used redirect link
  const { data: linkData, error } = await supabase
    .from('redirect_links')
    .select('*')
    .eq('is_active', true)
    .order('last_used_at', { ascending: true, nullsFirst: true })
    .limit(1)
    .single()

  if (error) {
    throw new Error(`Failed to get redirect link: ${error.message}`)
  }

  // Update the link as used
  await supabase
    .from('redirect_links')
    .update({
      last_used_by_id: vaId,
      last_used_at: new Date().toISOString(),
    })
    .eq('id', linkData.id)

  // Create resource assignment record
  await supabase
    .from('resource_assignments')
    .insert({
      va_id: vaId,
      redirect_link_id: linkData.id,
      assignment_type: 'new_account',
    })

  return {
    link_url: linkData.link_url,
    slug: linkData.slug,
  }
}

// Admin Actions for Resource Management

// Verify storage setup (helpful for debugging)
export async function verifyCookieStorageSetup() {
  const supabase = createSupabaseAdminClient()
  
  const results = {
    bucketExists: false,
    filesFound: 0,
    filesList: [] as string[],
    errors: [] as string[],
  }
  
  // Check if bucket exists
  const { data: files, error: listError } = await supabase
    .storage
    .from('cookies')
    .list()

  if (listError) {
    results.errors.push(`Bucket error: ${listError.message}`)
    if (listError.message.includes('not found') || listError.message.includes('does not exist')) {
      results.errors.push('Action needed: Create a storage bucket named "cookies" in Supabase Dashboard → Storage')
    }
    return results
  }

  results.bucketExists = true
  
  if (files && files.length > 0) {
    const cookieFiles = files.filter(file => 
      !file.name.startsWith('.') && 
      (file.name.endsWith('.json') || file.name.endsWith('.txt'))
    )
    results.filesFound = cookieFiles.length
    results.filesList = cookieFiles.map(f => f.name)
  } else {
    results.errors.push('No files found in bucket. Upload cookie files (.json or .txt) to the "cookies" bucket.')
  }

  return results
}

export async function syncCookiesFromStorage() {
  const supabase = createSupabaseAdminClient()
  
  // List all files in the cookies bucket
  console.log('Syncing cookies from storage...')
  const { data: files, error: listError } = await supabase
    .storage
    .from('cookies')
    .list()

  if (listError) {
    console.error('List error:', listError)
    // More specific error messages
    if (listError.message.includes('not found') || listError.message.includes('does not exist')) {
      throw new Error('Storage bucket "cookies" does not exist. Please create it in Supabase Dashboard → Storage first.')
    }
    throw new Error(`Failed to list cookies from storage: ${listError.message}`)
  }

  console.log(`Found ${files?.length || 0} files in storage`)

  if (!files || files.length === 0) {
    return { 
      added: 0, 
      message: 'No cookie files found in storage bucket. Upload some cookie files (.json or .txt) first.' 
    }
  }

  // Filter to only cookie files (json, txt, etc.)
  const cookieFiles = files.filter(file => 
    !file.name.startsWith('.') && // Ignore hidden files
    (file.name.endsWith('.json') || file.name.endsWith('.txt'))
  )

  // Get existing cookie file paths from database
  const { data: existingCookies, error: dbError } = await supabase
    .from('cookies')
    .select('cookie_file_path')

  if (dbError) {
    throw new Error(`Failed to query existing cookies: ${dbError.message}`)
  }

  const existingPaths = new Set(
    existingCookies?.map(c => c.cookie_file_path) || []
  )

  // Find new files that aren't in the database yet
  const newFiles = cookieFiles.filter(file => {
    const filePath = file.name
    return !existingPaths.has(filePath)
  })

  if (newFiles.length === 0) {
    return { 
      added: 0, 
      message: 'All cookie files are already in the database.' 
    }
  }

  // Insert new cookie files into database
  const cookiesToInsert = newFiles.map(file => ({
    cookie_name: file.name,
    cookie_file_path: `/cookies/${file.name}`, // Full path for consistency
  }))
  
  console.log('Inserting cookies:', cookiesToInsert)

  const { error: insertError } = await supabase
    .from('cookies')
    .insert(cookiesToInsert)

  if (insertError) {
    throw new Error(`Failed to insert new cookies: ${insertError.message}`)
  }

  revalidatePath('/admin/resources')
  
  return {
    added: newFiles.length,
    message: `Successfully added ${newFiles.length} new cookie file${newFiles.length > 1 ? 's' : ''} to the database.`
  }
}

export async function createCookie(formData: FormData) {
  const supabase = createSupabaseAdminClient()
  
  const cookieName = formData.get('cookieName') as string
  const cookieFilePath = formData.get('cookieFilePath') as string

  const { error } = await supabase
    .from('cookies')
    .insert({
      cookie_name: cookieName,
      cookie_file_path: cookieFilePath,
    })

  if (error) {
    throw new Error(`Failed to create cookie: ${error.message}`)
  }

  revalidatePath('/admin/resources')
}

export async function getAllCookies() {
  const supabase = createSupabaseAdminClient()
  
  const { data, error } = await supabase
    .from('cookies')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch cookies: ${error.message}`)
  }

  return data || []
}

export async function getAllRedirectLinks() {
  const supabase = createSupabaseAdminClient()
  
  const { data, error } = await supabase
    .from('redirect_links')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch redirect links: ${error.message}`)
  }

  return data || []
}

export async function getResourceAssignments() {
  const supabase = createSupabaseAdminClient()
  
  const { data, error } = await supabase
    .from('resource_assignments')
    .select(`
      *,
      profiles:va_id (full_name),
      ip_addresses:ip_address_id (ip_address),
      ip_proxies:ip_proxy_id (ip_proxy, line_number),
      cookies:cookie_id (cookie_name),
      redirect_links:redirect_link_id (link_url, slug)
    `)
    .order('assigned_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch resource assignments: ${error.message}`)
  }

  return data || []
}

export async function createRedirectLink(formData: FormData) {
  const supabase = createSupabaseAdminClient()
  
  const linkUrl = formData.get('linkUrl') as string
  const slug = formData.get('slug') as string

  const { error } = await supabase
    .from('redirect_links')
    .insert({
      link_url: linkUrl,
      slug: slug,
    })

  if (error) {
    throw new Error(`Failed to create redirect link: ${error.message}`)
  }

  revalidatePath('/admin/resources')
}

// Get user resource usage statistics
export async function getUserResourceStats(vaId: string) {
  const supabase = createSupabaseAdminClient()
  
  const { data: assignments, error } = await supabase
    .from('resource_assignments')
    .select(`
      *,
      ip_addresses(ip_address),
      ip_proxies(ip_proxy, line_number),
      cookies(cookie_name),
      redirect_links(link_url, slug)
    `)
    .eq('va_id', vaId)
    .order('assigned_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to get resource stats: ${error.message}`)
  }

  return assignments
}

// IP Proxy Management Actions (from proxyListNew.txt file)
export async function getAvailableIPProxy(vaId: string) {
  const supabase = createSupabaseAdminClient()
  
  // Get the next unassigned IP proxy (where last_used_by_id is NULL)
  // This ensures each IP is only assigned once
  const { data: ipData, error } = await supabase
    .from('ip_proxies')
    .select('*')
    .eq('is_active', true)
    .is('last_used_by_id', null) // Only get IPs that have never been assigned
    .order('line_number', { ascending: true }) // Get IPs in order from the file
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned - all IPs have been assigned
      throw new Error('No available IP proxies. All IPs from proxyListNew.txt have been assigned to VAs. Add more proxies using the "Add Proxies" button.')
    }
    throw new Error(`Failed to get IP proxy: ${error.message}`)
  }

  // Permanently assign the IP to this VA
  await supabase
    .from('ip_proxies')
    .update({
      last_used_by_id: vaId,
      last_used_at: new Date().toISOString(),
    })
    .eq('id', ipData.id)

  // Create resource assignment record
  await supabase
    .from('resource_assignments')
    .insert({
      va_id: vaId,
      ip_proxy_id: ipData.id,
      assignment_type: 'new_account',
    })

  return {
    ip_proxy: ipData.ip_proxy,
    line_number: ipData.line_number,
  }
}

// Sync IP proxies from local proxyListNew.txt file
export async function syncIPProxiesFromFile() {
  'use server'
  
  const supabase = createSupabaseAdminClient()
  const fs = require('fs').promises
  const path = require('path')
  
  try {
    // Read the local proxyListNew.txt file
    const filePath = path.join(process.cwd(), 'proxyListNew.txt')
    console.log('Reading proxies from:', filePath)
    
    const fileContents = await fs.readFile(filePath, 'utf-8')
    const lines = fileContents.split('\n').map((line: string) => line.trim()).filter((line: string) => line.length > 0)

    console.log(`Found ${lines.length} IP proxies in file`)

    if (lines.length === 0) {
      return { 
        added: 0, 
        message: 'proxyListNew.txt is empty. Please add IP proxies to the file.' 
      }
    }

    // Get existing IP proxies from database
    const { data: existingIPs, error: dbError } = await supabase
      .from('ip_proxies')
      .select('ip_proxy, line_number')

    if (dbError) {
      throw new Error(`Failed to query existing IP proxies: ${dbError.message}`)
    }

    const existingIPSet = new Set(
      existingIPs?.map(ip => ip.ip_proxy) || []
    )

    // Find new IPs that aren't in the database yet
    const newIPs = lines
      .map((ip: string, index: number) => ({ ip, lineNumber: index + 1 }))
      .filter(({ ip }: { ip: string }) => !existingIPSet.has(ip))

    if (newIPs.length === 0) {
      return { 
        added: 0, 
        message: 'All IP proxies from the file are already in the database.' 
      }
    }

    // Insert new IP proxies into database
    const ipsToInsert = newIPs.map(({ ip, lineNumber }: { ip: string; lineNumber: number }) => ({
      ip_proxy: ip,
      line_number: lineNumber,
    }))
    
    console.log(`Inserting ${ipsToInsert.length} new IP proxies...`)

    const { error: insertError } = await supabase
      .from('ip_proxies')
      .insert(ipsToInsert)

    if (insertError) {
      throw new Error(`Failed to insert new IP proxies: ${insertError.message}`)
    }

    revalidatePath('/admin/resources')
    
    return {
      added: newIPs.length,
      message: `Successfully added ${newIPs.length} new IP proxy${newIPs.length > 1 ? 'ies' : ''} to the database.`
    }
  } catch (error) {
    console.error('Error syncing proxies:', error)
    throw new Error(`Failed to sync proxies from file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Clear all unassigned proxies and resync from proxyListNew.txt
export async function clearAndResyncProxies() {
  'use server'
  
  const supabase = createSupabaseAdminClient()
  
  try {
    // Delete all unassigned proxies (where last_used_by_id is NULL)
    const { error: deleteError } = await supabase
      .from('ip_proxies')
      .delete()
      .is('last_used_by_id', null)

    if (deleteError) {
      throw new Error(`Failed to delete old proxies: ${deleteError.message}`)
    }

    // Now sync from proxyListNew.txt
    const result = await syncIPProxiesFromFile()
    
    revalidatePath('/admin/resources')
    
    return {
      success: true,
      message: `Cleared old unassigned proxies and synced ${result.added} new proxies from proxyListNew.txt`
    }
  } catch (error) {
    console.error('Error clearing and resyncing proxies:', error)
    throw new Error(`Failed to clear and resync proxies: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Add new proxies to proxyListNew.txt file and sync to database
export async function addProxiesToFile(proxiesText: string) {
  'use server'
  
  const supabase = createSupabaseAdminClient()
  const fs = require('fs').promises
  const path = require('path')
  
  try {
    // Parse the proxies text
    const newProxies = proxiesText
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)

    if (newProxies.length === 0) {
      throw new Error('No valid proxy addresses provided')
    }

    const filePath = path.join(process.cwd(), 'proxyListNew.txt')
    
    // Read existing file content
    let existingContent = ''
    try {
      existingContent = await fs.readFile(filePath, 'utf-8')
    } catch (error) {
      // File doesn't exist, that's okay
      console.log('File does not exist, creating new one')
    }

    // Get existing proxies to avoid duplicates
    const existingProxies = new Set(
      existingContent.split('\n').map((line: string) => line.trim()).filter((line: string) => line.length > 0)
    )

    // Filter out duplicates
    const uniqueNewProxies = newProxies.filter((proxy: string) => !existingProxies.has(proxy))

    if (uniqueNewProxies.length === 0) {
      return {
        added: 0,
        message: 'All provided proxies already exist in the file.'
      }
    }

    // Append new proxies to the file
    const appendContent = uniqueNewProxies.join('\n') + '\n'
    await fs.appendFile(filePath, appendContent, 'utf-8')

    // Now sync to database
    const { data: existingIPsInDB, error: dbError } = await supabase
      .from('ip_proxies')
      .select('ip_proxy')

    if (dbError) {
      throw new Error(`Failed to query existing IP proxies: ${dbError.message}`)
    }

    const existingIPSet = new Set(
      existingIPsInDB?.map(ip => ip.ip_proxy) || []
    )

    // Re-read the full file to get correct line numbers
    const fullFileContent = await fs.readFile(filePath, 'utf-8')
    const allLines = fullFileContent.split('\n').map((line: string) => line.trim()).filter((line: string) => line.length > 0)

    // Find the new proxies in the file with their line numbers
    const proxiesToInsert = uniqueNewProxies
      .map((proxy: string) => {
        const lineNumber = allLines.indexOf(proxy) + 1
        return {
          ip_proxy: proxy,
          line_number: lineNumber
        }
      })
      .filter((item: { ip_proxy: string }) => !existingIPSet.has(item.ip_proxy))

    if (proxiesToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('ip_proxies')
        .insert(proxiesToInsert)

      if (insertError) {
        throw new Error(`Failed to insert new IP proxies: ${insertError.message}`)
      }
    }

    revalidatePath('/admin/resources')

    return {
      added: uniqueNewProxies.length,
      message: `Successfully added ${uniqueNewProxies.length} new proxy${uniqueNewProxies.length > 1 ? 's' : ''} to proxyListNew.txt and database.`
    }
  } catch (error) {
    console.error('Error adding proxies:', error)
    throw new Error(`Failed to add proxies: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getAllIPProxies() {
  const supabase = createSupabaseAdminClient()
  
  const { data, error } = await supabase
    .from('ip_proxies')
    .select('*')
    .order('line_number', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch IP proxies: ${error.message}`)
  }

  return data || []
}

// Delete IP proxies up to a specific line number (for removing already used proxies)
export async function deleteIPProxiesUpToLine(lineNumber: number) {
  'use server'
  
  const supabase = createSupabaseAdminClient()
  
  // First, get count of proxies to be deleted
  const { count: deleteCount, error: countError } = await supabase
    .from('ip_proxies')
    .select('*', { count: 'exact', head: true })
    .lte('line_number', lineNumber)

  if (countError) {
    throw new Error(`Failed to count IP proxies: ${countError.message}`)
  }

  // Delete the proxies
  const { error: deleteError } = await supabase
    .from('ip_proxies')
    .delete()
    .lte('line_number', lineNumber)

  if (deleteError) {
    throw new Error(`Failed to delete IP proxies: ${deleteError.message}`)
  }

  revalidatePath('/admin/resources')
  revalidatePath('/admin/ips')

  return {
    success: true,
    deleted: deleteCount || 0,
    message: `Successfully deleted ${deleteCount || 0} IP proxies (lines 1-${lineNumber})`
  }
}

// Delete individual IP proxy by ID
export async function deleteIPProxy(ipProxyId: number) {
  'use server'
  
  const supabase = createSupabaseAdminClient()
  
  // Get the proxy details before deleting (for confirmation message)
  const { data: proxy, error: fetchError } = await supabase
    .from('ip_proxies')
    .select('ip_proxy, line_number')
    .eq('id', ipProxyId)
    .single()

  if (fetchError) {
    throw new Error(`Failed to fetch IP proxy: ${fetchError.message}`)
  }

  // Delete the proxy
  const { error: deleteError } = await supabase
    .from('ip_proxies')
    .delete()
    .eq('id', ipProxyId)

  if (deleteError) {
    throw new Error(`Failed to delete IP proxy: ${deleteError.message}`)
  }

  revalidatePath('/admin/resources')
  revalidatePath('/admin/ips')

  return {
    success: true,
    message: `Successfully deleted IP proxy: ${proxy.ip_proxy} (Line #${proxy.line_number})`
  }
}

// Delete individual cookie by ID
export async function deleteCookie(cookieId: number) {
  'use server'
  
  const supabase = createSupabaseAdminClient()
  
  // Get the cookie details before deleting (for confirmation message)
  const { data: cookie, error: fetchError } = await supabase
    .from('cookies')
    .select('cookie_name')
    .eq('id', cookieId)
    .single()

  if (fetchError) {
    throw new Error(`Failed to fetch cookie: ${fetchError.message}`)
  }

  // Delete the cookie
  const { error: deleteError } = await supabase
    .from('cookies')
    .delete()
    .eq('id', cookieId)

  if (deleteError) {
    throw new Error(`Failed to delete cookie: ${deleteError.message}`)
  }

  revalidatePath('/admin/resources')

  return {
    success: true,
    message: `Successfully deleted cookie: ${cookie.cookie_name}`
  }
}

// Upload multiple cookie files with automatic renaming to Cookie_1, Cookie_2, etc.
export async function uploadCookieFiles(formData: FormData) {
  'use server'
  
  const supabase = createSupabaseAdminClient()
  
  const files = formData.getAll('files') as File[]
  
  if (!files || files.length === 0) {
    throw new Error('No files provided')
  }

  // Validate all files first
  for (const file of files) {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !['json', 'txt'].includes(extension)) {
      throw new Error(`Invalid file type for "${file.name}". Only .json and .txt files are supported.`)
    }
  }

  // Get all existing cookies to determine the next number
  const { data: existingCookies, error: fetchError } = await supabase
    .from('cookies')
    .select('cookie_name')
    .order('id', { ascending: true })

  if (fetchError) {
    throw new Error(`Failed to fetch existing cookies: ${fetchError.message}`)
  }

  // Find the highest Cookie number
  let maxNumber = 0
  if (existingCookies && existingCookies.length > 0) {
    for (const cookie of existingCookies) {
      // Extract number from Cookie_X pattern
      const match = cookie.cookie_name.match(/^Cookie_(\d+)/)
      if (match) {
        const num = parseInt(match[1], 10)
        if (num > maxNumber) {
          maxNumber = num
        }
      }
    }
  }

  const uploadedFiles: string[] = []
  const failedFiles: { name: string; error: string }[] = []
  let currentNumber = maxNumber

  // Process each file
  for (const file of files) {
    try {
      currentNumber++
      const originalName = file.name
      const extension = originalName.split('.').pop()?.toLowerCase()
      const newFileName = `Cookie_${currentNumber}.${extension}`

      // Convert File to ArrayBuffer for upload
      const arrayBuffer = await file.arrayBuffer()
      const fileBuffer = Buffer.from(arrayBuffer)

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase
        .storage
        .from('cookies')
        .upload(newFileName, fileBuffer, {
          contentType: extension === 'json' ? 'application/json' : 'text/plain',
          upsert: false,
        })

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`)
      }

      // Add to database
      const { error: dbError } = await supabase
        .from('cookies')
        .insert({
          cookie_name: newFileName,
          cookie_file_path: `/cookies/${newFileName}`,
        })

      if (dbError) {
        // If database insert fails, try to delete the uploaded file
        await supabase.storage.from('cookies').remove([newFileName])
        throw new Error(`Database insert failed: ${dbError.message}`)
      }

      uploadedFiles.push(newFileName)
    } catch (error) {
      currentNumber-- // Rollback the number increment
      failedFiles.push({
        name: file.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  revalidatePath('/admin/resources')

  // Generate result message
  let message = ''
  if (uploadedFiles.length > 0) {
    message += `Successfully uploaded ${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''}`
    if (uploadedFiles.length <= 5) {
      message += `: ${uploadedFiles.join(', ')}`
    }
  }
  
  if (failedFiles.length > 0) {
    if (uploadedFiles.length > 0) message += '. '
    message += `${failedFiles.length} file${failedFiles.length > 1 ? 's' : ''} failed: ${failedFiles.map(f => f.name).join(', ')}`
  }

  if (failedFiles.length > 0 && uploadedFiles.length === 0) {
    throw new Error(message)
  }

  return {
    success: true,
    uploadedCount: uploadedFiles.length,
    failedCount: failedFiles.length,
    uploadedFiles,
    failedFiles,
    message,
  }
}