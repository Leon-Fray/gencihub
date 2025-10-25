'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { createSupabaseClient } from '@/lib/supabase-client'
import { clockIn, clockOut } from '@/lib/actions'
import { useToast } from '@/hooks/use-toast'
import { Clock, LogIn, LogOut, Timer } from 'lucide-react'

interface TimeTrackerProps {
  vaId: string
}

export function TimeTracker({ vaId }: TimeTrackerProps) {
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [totalHours, setTotalHours] = useState(0)
  const { toast } = useToast()
  const supabase = createSupabaseClient()

  useEffect(() => {
    // Check if user is currently clocked in and calculate total hours
    const checkClockStatusAndCalculateHours = async () => {
      // Check current clock status
      const { data: timeRecord } = await supabase
        .from('time_tracking')
        .select('*')
        .eq('va_id', vaId)
        .is('clock_out', null)
        .order('clock_in', { ascending: false })
        .limit(1)
        .maybeSingle()

      setIsClockedIn(!!timeRecord)

      // Calculate total hours from all completed shifts
      const { data: allRecords } = await supabase
        .from('time_tracking')
        .select('clock_in, clock_out')
        .eq('va_id', vaId)
        .not('clock_out', 'is', null)
        .order('clock_in', { ascending: false })

      if (allRecords && allRecords.length > 0) {
        const total = allRecords.reduce((sum, record) => {
          const clockIn = new Date(record.clock_in)
          const clockOut = new Date(record.clock_out)
          const hours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)
          return sum + hours
        }, 0)
        setTotalHours(total)
      }
    }

    checkClockStatusAndCalculateHours()
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
        
        // Recalculate total hours after clocking out
        const { data: allRecords } = await supabase
          .from('time_tracking')
          .select('clock_in, clock_out')
          .eq('va_id', vaId)
          .not('clock_out', 'is', null)
          .order('clock_in', { ascending: false })

        if (allRecords && allRecords.length > 0) {
          const total = allRecords.reduce((sum, record) => {
            const clockIn = new Date(record.clock_in)
            const clockOut = new Date(record.clock_out)
            const hours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)
            return sum + hours
          }, 0)
          setTotalHours(total)
        }
        
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
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span className="font-medium">Time Tracker</span>
            <span className="text-blue-200">
              {isClockedIn ? 'Currently Clocked In' : 'Not Clocked In'}
            </span>
          </div>
          <div className="flex items-center space-x-2 border-l border-blue-400 pl-4">
            <Timer className="h-5 w-5" />
            <span className="font-medium">Total Hours:</span>
            <span className="text-blue-100 font-bold">
              {totalHours.toFixed(2)} hrs
            </span>
          </div>
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
