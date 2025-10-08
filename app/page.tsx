'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase-client'

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createSupabaseClient()

  console.log('🔍 HomePage: Component rendered - showing sign-in form')

  const handleSignIn = async () => {
    console.log('🔍 HomePage: Google OAuth button clicked')
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        console.error('❌ HomePage: Google OAuth error:', error)
        alert('Google OAuth not configured. Please use email/password or configure Google OAuth in Supabase.')
      } else {
        console.log('✅ HomePage: Google OAuth initiated:', data)
      }
    } catch (err) {
      console.error('❌ HomePage: Unexpected Google OAuth error:', err)
      alert('Unexpected error with Google OAuth')
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('🔍 HomePage: Sign in form submitted')
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    console.log('🔍 HomePage: Attempting sign in with email:', email)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('❌ HomePage: Sign in error:', error)
        alert('Error signing in: ' + error.message)
      } else {
        console.log('✅ HomePage: Sign in successful:', data)
        
        // Fetch user profile to determine role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()
        
        // Redirect based on role
        if (profile?.role === 'admin') {
          window.location.href = '/admin'
        } else {
          window.location.href = '/dashboard'
        }
      }
    } catch (err) {
      console.error('❌ HomePage: Unexpected sign in error:', err)
      alert('Unexpected error during sign in')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            VA Hub
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Virtual Assistant Management Platform
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="bg-white p-8 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sign In</h3>
            
            {/* Google OAuth Button */}
            <button
              onClick={handleSignIn}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-4"
            >
              Sign in with Google
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Sign In */}
            <div className="mt-6">
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Sign In
                </button>
              </form>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
