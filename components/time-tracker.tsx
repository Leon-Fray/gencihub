'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { createSupabaseClient } from '@/lib/supabase-client'
import { clockIn, clockOut } from '@/lib/actions'
import { useToast } from '@/hooks/use-toast'
import { Clock, LogIn, LogOut } from 'lucide-react'

interface TimeTrackerProps {
  vaId: string
}

export function TimeTracker({ vaId }: TimeTrackerProps) {
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createSupabaseClient()

  useEffect(() => {
    // Check if user is currently clocked in
    const checkClockStatus = async () => {
      const { data: timeRecord } = await supabase
        .from('time_tracking')
        .select('*')
        .eq('va_id', vaId)
        .is('clock_out', null)
        .order('clock_in', { ascending: false })
        .limit(1)
        .maybeSingle()

      setIsClockedIn(!!timeRecord)
    }

    checkClockStatus()
  }, [vaId, supabase])

  const handleClockIn = async () => {
    setLoading(true)
    try {
      // DEMO MODE - Simulate clock in
      if (vaId === "demo-va-id") {
        setIsClockedIn(true)
        toast({
          title: "Clocked In (Demo)",
          description: "Demo mode: You have successfully clocked in.",
        })
      } else {
        await clockIn(vaId)
        setIsClockedIn(true)
        toast({
          title: "Clocked In",
          description: "You have successfully clocked in.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clock in",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClockOut = async () => {
    setLoading(true)
    try {
      // DEMO MODE - Simulate clock out
      if (vaId === "demo-va-id") {
        setIsClockedIn(false)
        toast({
          title: "Clocked Out (Demo)",
          description: "Demo mode: You have successfully clocked out.",
        })
      } else {
        await clockOut(vaId)
        setIsClockedIn(false)
        toast({
          title: "Clocked Out",
          description: "You have successfully clocked out.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clock out",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-blue-600 text-white px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span className="font-medium">Time Tracker</span>
          <span className="text-blue-200">
            {isClockedIn ? 'Currently Clocked In' : 'Not Clocked In'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {isClockedIn ? (
            <Button
              onClick={handleClockOut}
              disabled={loading}
              variant="secondary"
              size="sm"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {loading ? 'Clocking Out...' : 'Clock Out'}
            </Button>
          ) : (
            <Button
              onClick={handleClockIn}
              disabled={loading}
              variant="secondary"
              size="sm"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <LogIn className="h-4 w-4 mr-2" />
              {loading ? 'Clocking In...' : 'Clock In'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
