// Script to create admin user in Supabase
// Run this with: node create-admin-user.js

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  console.log('🔍 Creating admin user...')
  
  try {
    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@vahub.com',
      password: 'admin123',
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        full_name: 'VA Hub Admin'
      }
    })

    if (authError) {
      console.error('❌ Error creating auth user:', authError.message)
      return
    }

    console.log('✅ Auth user created:', authData.user.id)

    // Create the profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: 'VA Hub Admin',
        role: 'admin'
      })
      .select()
      .single()

    if (profileError) {
      console.error('❌ Error creating profile:', profileError.message)
      return
    }

    console.log('✅ Profile created:', profileData)
    console.log('🎉 Admin user created successfully!')
    console.log('📧 Email: admin@vahub.com')
    console.log('🔑 Password: admin123')
    console.log('👤 Role: admin')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

createAdminUser()
