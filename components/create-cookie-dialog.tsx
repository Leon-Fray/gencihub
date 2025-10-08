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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCookie } from '@/lib/actions'
import { useToast } from '@/hooks/use-toast'

export function CreateCookieDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      await createCookie(formData)
      toast({
        title: "Cookie Created",
        description: "The cookie file has been added successfully.",
      })
      setOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create cookie",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Cookie Manually</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Cookie File Manually</DialogTitle>
          <DialogDescription>
            Manually add a cookie file to the database. For bulk uploads, upload files to Supabase Storage and use &quot;Sync from Storage&quot; instead.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cookieName">Cookie Name</Label>
              <Input
                id="cookieName"
                name="cookieName"
                placeholder="e.g., chrome_cookie_001.json"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cookieFilePath">File Path</Label>
              <Input
                id="cookieFilePath"
                name="cookieFilePath"
                placeholder="e.g., /cookies/chrome_cookie_001.json"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Cookie'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
