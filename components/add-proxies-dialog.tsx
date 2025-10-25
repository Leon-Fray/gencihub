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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { addProxiesToFile } from '@/lib/actions'
import { useToast } from '@/hooks/use-toast'
import { Plus } from 'lucide-react'

export function AddProxiesDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [proxiesText, setProxiesText] = useState('')
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (!proxiesText.trim()) {
      toast({
        title: "No Proxies Provided",
        description: "Please paste proxy addresses to add.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await addProxiesToFile(proxiesText)
      
      toast({
        title: "Proxies Added",
        description: result.message,
      })
      setOpen(false)
      setProxiesText('')
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add proxies",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function countProxies() {
    if (!proxiesText.trim()) return 0
    return proxiesText.split('\n').filter(line => line.trim()).length
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Proxies
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add IP Proxies</DialogTitle>
          <DialogDescription>
            Paste proxy addresses (one per line). They will be added to proxyListNew.txt and synced to the database.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="proxies">Proxy Addresses</Label>
              <Textarea
                id="proxies"
                name="proxies"
                placeholder="gw.dataimpulse.com:10429:b2f65229d1ddb2161e15__cr.us:bfe49c67ffed2bc7
gw.dataimpulse.com:10430:b2f65229d1ddb2161e15__cr.us:bfe49c67ffed2bc7
..."
                value={proxiesText}
                onChange={(e) => setProxiesText(e.target.value)}
                disabled={loading}
                className="min-h-[200px] font-mono text-sm"
              />
              {proxiesText.trim() && (
                <p className="text-sm text-gray-500">
                  {countProxies()} proxy address{countProxies() !== 1 ? 'es' : ''} ready to add
                </p>
              )}
            </div>
            <div className="rounded-md bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Proxies will be appended to proxyListNew.txt and automatically 
                synced to the database. Duplicate proxies will be skipped.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setOpen(false)
                setProxiesText('')
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !proxiesText.trim()}>
              {loading ? 'Adding...' : `Add ${countProxies()} Proxy${countProxies() !== 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

