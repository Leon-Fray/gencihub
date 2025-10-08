import { createSupabaseAdminClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreateScheduleDialog } from '@/components/create-schedule-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateTime } from '@/lib/utils'

export default async function SchedulerPage() {
  const supabase = createSupabaseAdminClient()
  
  const { data: schedules } = await supabase
    .from('schedules')
    .select(`
      *,
      profiles!schedules_va_id_fkey(full_name)
    `)
    .order('start_time', { ascending: true })

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'va')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">VA Scheduler</h1>
          <p className="mt-2 text-gray-600">Manage work schedules for your VAs</p>
        </div>
        <CreateScheduleDialog users={users || []} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Work Schedules</CardTitle>
          <CardDescription>View and manage VA work schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>VA</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules?.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">
                    {schedule.profiles?.full_name || 'Unknown VA'}
                  </TableCell>
                  <TableCell>
                    {formatDateTime(schedule.start_time)}
                  </TableCell>
                  <TableCell>
                    {formatDateTime(schedule.end_time)}
                  </TableCell>
                  <TableCell>
                    {schedule.notes || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
