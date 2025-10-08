import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function SOPTutorialsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">SOP & Tutorials</h1>
        <p className="mt-2 text-gray-600">Standard Operating Procedures and training materials</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Access */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Most commonly used procedures</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              📱 Account Setup Process
            </Button>
            <Button variant="outline" className="w-full justify-start">
              📝 Content Creation Guidelines
            </Button>
            <Button variant="outline" className="w-full justify-start">
              🔒 Security Best Practices
            </Button>
            <Button variant="outline" className="w-full justify-start">
              📊 Reporting Procedures
            </Button>
            <Button variant="outline" className="w-full justify-start">
              🚨 Emergency Protocols
            </Button>
          </CardContent>
        </Card>

        {/* Search & Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>Find specific procedures and tutorials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input id="search" placeholder="Search procedures..." />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account-management">Account Management</SelectItem>
                  <SelectItem value="content-creation">Content Creation</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="reporting">Reporting</SelectItem>
                  <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                  <SelectItem value="tools">Tools & Software</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button className="w-full">Search</Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Recently viewed and updated materials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3 p-2 border rounded">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">📋</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Reddit Posting Guidelines</p>
                <p className="text-xs text-gray-500">Viewed 2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-2 border rounded">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">✅</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Account Security Checklist</p>
                <p className="text-xs text-gray-500">Completed yesterday</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-2 border rounded">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm">📚</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Content Creation Tutorial</p>
                <p className="text-xs text-gray-500">Started 3 days ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SOP Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📱</span>
              <span>Account Management</span>
            </CardTitle>
            <CardDescription>Procedures for managing social media accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start text-left h-auto p-2">
              <div>
                <p className="font-medium text-sm">Account Setup Process</p>
                <p className="text-xs text-gray-500">Step-by-step guide for new accounts</p>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-left h-auto p-2">
              <div>
                <p className="font-medium text-sm">Account Verification</p>
                <p className="text-xs text-gray-500">How to verify accounts on different platforms</p>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-left h-auto p-2">
              <div>
                <p className="font-medium text-sm">Profile Optimization</p>
                <p className="text-xs text-gray-500">Best practices for profile setup</p>
              </div>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📝</span>
              <span>Content Creation</span>
            </CardTitle>
            <CardDescription>Guidelines for creating engaging content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start text-left h-auto p-2">
              <div>
                <p className="font-medium text-sm">Content Planning</p>
                <p className="text-xs text-gray-500">How to plan and schedule content</p>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-left h-auto p-2">
              <div>
                <p className="font-medium text-sm">Writing Guidelines</p>
                <p className="text-xs text-gray-500">Tone, style, and best practices</p>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-left h-auto p-2">
              <div>
                <p className="font-medium text-sm">Visual Content</p>
                <p className="text-xs text-gray-500">Creating images, videos, and graphics</p>
              </div>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🔒</span>
              <span>Security & Safety</span>
            </CardTitle>
            <CardDescription>Security protocols and safety measures</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start text-left h-auto p-2">
              <div>
                <p className="font-medium text-sm">Password Management</p>
                <p className="text-xs text-gray-500">Secure password practices</p>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-left h-auto p-2">
              <div>
                <p className="font-medium text-sm">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500">Setting up 2FA on all accounts</p>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-left h-auto p-2">
              <div>
                <p className="font-medium text-sm">Privacy Settings</p>
                <p className="text-xs text-gray-500">Configuring privacy and security</p>
              </div>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📊</span>
              <span>Reporting & Analytics</span>
            </CardTitle>
            <CardDescription>How to track and report performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start text-left h-auto p-2">
              <div>
                <p className="font-medium text-sm">Daily Reports</p>
                <p className="text-xs text-gray-500">Template for daily activity reports</p>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-left h-auto p-2">
              <div>
                <p className="font-medium text-sm">Analytics Tracking</p>
                <p className="text-xs text-gray-500">How to monitor account performance</p>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-left h-auto p-2">
              <div>
                <p className="font-medium text-sm">Weekly Summaries</p>
                <p className="text-xs text-gray-500">Format for weekly progress reports</p>
              </div>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🛠️</span>
              <span>Tools & Software</span>
            </CardTitle>
            <CardDescription>Tutorials for using various tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start text-left h-auto p-2">
              <div>
                <p className="font-medium text-sm">Canva Tutorial</p>
                <p className="text-xs text-gray-500">Creating graphics and designs</p>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-left h-auto p-2">
              <div>
                <p className="font-medium text-sm">Scheduling Tools</p>
                <p className="text-xs text-gray-500">Using Buffer, Hootsuite, etc.</p>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-left h-auto p-2">
              <div>
                <p className="font-medium text-sm">Analytics Tools</p>
                <p className="text-xs text-gray-500">Google Analytics, platform insights</p>
              </div>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🚨</span>
              <span>Emergency Procedures</span>
            </CardTitle>
            <CardDescription>What to do in emergency situations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start text-left h-auto p-2">
              <div>
                <p className="font-medium text-sm">Account Compromise</p>
                <p className="text-xs text-gray-500">Steps to take if account is hacked</p>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-left h-auto p-2">
              <div>
                <p className="font-medium text-sm">Content Issues</p>
                <p className="text-xs text-gray-500">Handling negative comments or backlash</p>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-left h-auto p-2">
              <div>
                <p className="font-medium text-sm">Platform Changes</p>
                <p className="text-xs text-gray-500">Adapting to platform policy changes</p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Featured Tutorial */}
      <Card>
        <CardHeader>
          <CardTitle>Featured Tutorial</CardTitle>
          <CardDescription>This week's highlighted training material</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl">🎥</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Advanced Reddit Marketing Strategies</h3>
              <p className="text-gray-600 mt-1">
                Learn advanced techniques for building engagement on Reddit, including community management, 
                content optimization, and growth strategies that actually work.
              </p>
              <div className="flex items-center space-x-4 mt-3">
                <span className="text-sm text-gray-500">⏱️ 45 minutes</span>
                <span className="text-sm text-gray-500">📊 Intermediate</span>
                <span className="text-sm text-gray-500">👥 1,234 views</span>
              </div>
              <div className="mt-4">
                <Button>Start Tutorial</Button>
                <Button variant="outline" className="ml-2">Add to Favorites</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
