'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'New Account', href: '/dashboard/new-account' },
  { name: 'Model Details', href: '/dashboard/model-details' },
  // { name: 'SOP & Tutorials', href: '/dashboard/sop-tutorials' },
]

export function VANav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createSupabaseClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">VA Hub</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                    pathname === item.href
                      ? 'border-primary-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => router.push('/admin')} 
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              View Admin Dashboard
            </Button>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
