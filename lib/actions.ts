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

// IP Proxy Management Actions (from proxyList300.txt file)
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
      throw new Error('No available IP proxies. All IPs from proxyList300.txt have been assigned to VAs.')
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

export async function syncIPProxiesFromStorage() {
  const supabase = createSupabaseAdminClient()
  
  // Download the proxyList300.txt file from the iplist bucket
  console.log('Syncing IP proxies from storage...')
  const { data: fileData, error: downloadError } = await supabase
    .storage
    .from('iplist')
    .download('proxyList300.txt')

  if (downloadError) {
    console.error('Download error:', downloadError)
    if (downloadError.message.includes('not found') || downloadError.message.includes('does not exist')) {
      throw new Error('File "proxyList300.txt" not found in "iplist" bucket. Please upload it to Supabase Storage → iplist bucket.')
    }
    throw new Error(`Failed to download proxyList300.txt: ${downloadError.message}`)
  }

  if (!fileData) {
    throw new Error('No data received from proxyList300.txt file.')
  }

  // Read the file contents
  const fileContents = await fileData.text()
  const lines = fileContents.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  console.log(`Found ${lines.length} IP proxies in file`)

  if (lines.length === 0) {
    return { 
      added: 0, 
      message: 'proxyList300.txt is empty. Please add IP proxies to the file.' 
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
    .map((ip, index) => ({ ip, lineNumber: index + 1 }))
    .filter(({ ip }) => !existingIPSet.has(ip))

  if (newIPs.length === 0) {
    return { 
      added: 0, 
      message: 'All IP proxies from the file are already in the database.' 
    }
  }

  // Insert new IP proxies into database
  const ipsToInsert = newIPs.map(({ ip, lineNumber }) => ({
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