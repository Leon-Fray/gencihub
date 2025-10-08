'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createAccountRequest } from '@/lib/account-actions'
import { useToast } from '@/hooks/use-toast'

interface Model {
  id: number
  name: string
  google_drive_link: string
  bio: string
  created_at: string
  is_active: boolean
  storage_folder?: string
}

interface NewAccountFormProps {
  models: Model[]
  vaName: string
  vaId: string
}

const REASON_OPTIONS = [
  'First Account',
  'Additional posts',
  'Account banned',
  'Other'
] as const

export function NewAccountForm({ models, vaName, vaId }: NewAccountFormProps) {
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [reason, setReason] = useState('')
  const [otherReason, setOtherReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Expose selectedModel to parent via event
  const handleModelChange = (value: string) => {
    setSelectedModel(value)
    // Dispatch custom event so parent components can access the selected model
    window.dispatchEvent(new CustomEvent('modelSelected', { detail: { model: value } }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isFormValid) return
    
    setIsSubmitting(true)
    
    try {
      const finalReason = reason === 'Other' ? otherReason : reason
      
      const result = await createAccountRequest(vaId, selectedModel, finalReason)
      
      if (result.success) {
        toast({
          title: 'Request Submitted',
          description: 'Your new account request has been submitted successfully. An admin will review it soon.',
        })
        
        // Reset form
        setSelectedModel('')
        setReason('')
        setOtherReason('')
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to submit request. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error submitting request:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = selectedModel && reason && (reason !== 'Other' || otherReason.trim())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request New Account</CardTitle>
        <CardDescription>Submit a request for a new social media account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="va-name">Your Name (VA)</Label>
            <Input 
              id="va-name" 
              value={vaName}
              disabled
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="model-name">Model Name</Label>
            <Select value={selectedModel} onValueChange={handleModelChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.length > 0 ? (
                  models.map((model) => (
                    <SelectItem key={model.id} value={model.name}>
                      {model.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-models" disabled>
                    No models assigned
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {models.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                You don't have any models assigned yet. Please contact your admin.
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="reason">Reason for New Account</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REASON_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {reason === 'Other' && (
            <div>
              <Label htmlFor="other-reason">Please specify</Label>
              <Textarea 
                id="other-reason" 
                placeholder="Explain why you need a new account..."
                rows={4}
                className="mt-1"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
              />
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={!isFormValid || isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

