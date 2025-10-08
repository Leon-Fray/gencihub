'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { bulkInsertIPs } from '@/lib/actions'
import { useToast } from '@/hooks/use-toast'

export function BulkIPDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      const ipsText = formData.get('ips') as string
      const ipAddresses = ipsText
        .split('\n')
        .map(ip => ip.trim())
        .filter(ip => ip.length > 0)
      
      if (ipAddresses.length === 0) {
        throw new Error('Please enter at least one IP address')
      }

      await bulkInsertIPs(ipAddresses)
      toast({
        title: "IP Addresses Added",
        description: `Successfully added ${ipAddresses.length} IP addresses.`,
      })
      setOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add IP addresses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Bulk Add IPs</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bulk Add IP Addresses</DialogTitle>
          <DialogDescription>
            Add multiple IP addresses at once. Enter one IP address per line.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ips">IP Addresses</Label>
              <Textarea
                id="ips"
                name="ips"
                placeholder="192.168.1.1&#10;192.168.1.2&#10;192.168.1.3"
                rows={6}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add IPs'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
