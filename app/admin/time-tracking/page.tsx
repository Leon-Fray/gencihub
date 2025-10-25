import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { Clock, Calendar, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface TimeRecord {
  id: number
  va_id: string
  clock_in: string
  clock_out: string | null
  profile?: {
    full_name: string
  }
}

export default async function TimeTrackingPage({
  searchParams,
}: {
  searchParams: { va?: string }
}) {
  const supabase = createSupabaseAdminClient()
  
  // Fetch all profiles for VA list
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'va')
    .order('full_name', { ascending: true })

  const vaList = profiles || []

  // If a specific VA is selected, fetch their time records
  let timeRecords: TimeRecord[] = []
  let selectedVA = null
  let totalHours = 0
  let currentlyClocked = false

  if (searchParams.va) {
    selectedVA = vaList.find(va => va.id === searchParams.va)
    
    // Fetch time records for this VA
    const { data: records } = await supabase
      .from('time_tracking')
      .select('*')
      .eq('va_id', searchParams.va)
      .order('clock_in', { ascending: false })

    timeRecords = records || []

    // Calculate total hours from completed shifts
    totalHours = timeRecords
      .filter(record => record.clock_out)
      .reduce((sum, record) => {
        const clockIn = new Date(record.clock_in)
        const clockOut = new Date(record.clock_out!)
        const hours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)
        return sum + hours
      }, 0)

    // Check if currently clocked in
    currentlyClocked = timeRecords.some(record => !record.clock_out)
  } else {
    // Fetch all time records with VA info
    const { data: allRecords } = await supabase
      .from('time_tracking')
      .select(`
        *,
        profiles:va_id (
          full_name
        )
      `)
      .order('clock_in', { ascending: false })
      .limit(100)

    timeRecords = allRecords || []
  }

  // Calculate summary stats for all VAs
  const summaryStats = await Promise.all(
    vaList.map(async (va) => {
      const { data: vaRecords } = await supabase
        .from('time_tracking')
        .select('clock_in, clock_out')
        .eq('va_id', va.id)
        .not('clock_out', 'is', null)

      const hours = (vaRecords || []).reduce((sum, record) => {
        const clockIn = new Date(record.clock_in)
        const clockOut = new Date(record.clock_out!)
        return sum + (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)
      }, 0)

      return {
        ...va,
        totalHours: hours,
        totalShifts: vaRecords?.length || 0
      }
    })
  )

  const totalVAHours = summaryStats.reduce((sum, stat) => sum + stat.totalHours, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
        <p className="mt-2 text-gray-600">Monitor VA work hours and shifts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total VAs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vaList.length}</div>
            <p className="text-xs text-muted-foreground">Active virtual assistants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours (All VAs)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVAHours.toFixed(2)} hrs</div>
            <p className="text-xs text-muted-foreground">Combined work hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {selectedVA ? `${selectedVA.full_name}'s Hours` : 'Select a VA'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {selectedVA ? (
              <>
                <div className="text-2xl font-bold">{totalHours.toFixed(2)} hrs</div>
                <p className="text-xs text-muted-foreground">
                  {currentlyClocked ? (
                    <span className="text-green-600 font-medium">● Currently clocked in</span>
                  ) : (
                    'Not currently clocked in'
                  )}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">Choose a VA to view their hours</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* VA Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>VA Hours Summary</CardTitle>
          <CardDescription>Total hours worked by each virtual assistant</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Virtual Assistant</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Total Shifts</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaryStats.length > 0 ? (
                summaryStats
                  .sort((a, b) => b.totalHours - a.totalHours)
                  .map((stat) => {
                    const isCurrentlyClocked = timeRecords.some(
                      record => record.va_id === stat.id && !record.clock_out
                    )
                    return (
                      <TableRow key={stat.id}>
                        <TableCell className="font-medium">{stat.full_name}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-blue-600">
                            {stat.totalHours.toFixed(2)} hrs
                          </span>
                        </TableCell>
                        <TableCell>{stat.totalShifts}</TableCell>
                        <TableCell>
                          {isCurrentlyClocked ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ● Clocked In
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              Clocked Out
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/admin/time-tracking?va=${stat.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Details →
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No VAs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detailed Time Records */}
      {selectedVA && (
        <Card>
          <CardHeader>
            <CardTitle>Shift History - {selectedVA.full_name}</CardTitle>
            <CardDescription>Detailed clock-in and clock-out records</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeRecords.length > 0 ? (
                  timeRecords.map((record) => {
                    const clockIn = new Date(record.clock_in)
                    const clockOut = record.clock_out ? new Date(record.clock_out) : null
                    const duration = clockOut
                      ? ((clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)).toFixed(2)
                      : 'In Progress'

                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          {clockIn.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          {clockIn.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell>
                          {clockOut
                            ? clockOut.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : '—'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {typeof duration === 'string' ? (
                            <span className="text-green-600">{duration}</span>
                          ) : (
                            `${duration} hrs`
                          )}
                        </TableCell>
                        <TableCell>
                          {clockOut ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ● Active
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No time records found for this VA
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity for All VAs */}
      {!selectedVA && timeRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest clock-in/out activity across all VAs</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Virtual Assistant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeRecords.slice(0, 20).map((record) => {
                  const clockIn = new Date(record.clock_in)
                  const clockOut = record.clock_out ? new Date(record.clock_out) : null
                  const duration = clockOut
                    ? ((clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)).toFixed(2)
                    : 'In Progress'

                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.profile?.full_name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {clockIn.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        {clockIn.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        {clockOut
                          ? clockOut.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '—'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {typeof duration === 'string' ? (
                          <span className="text-green-600">{duration}</span>
                        ) : (
                          `${duration} hrs`
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

