import { useState } from "react"
import { Trash2, FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"

const traits = ["friendly", "witty", "concise", "curious", "empathetic", "creative", "patient"]

export function CustomizationTab() {
  const [customizationForm, setCustomizationForm] = useState({
    name: "",
    occupation: "",
    traits: "",
    additionalInfo: "",
  })

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Customize T3 Chat</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-base font-medium">
              What should T3 Chat call you?
            </Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={customizationForm.name}
              onChange={(e) => setCustomizationForm({ ...customizationForm, name: e.target.value })}
              className="mt-2"
            />
            <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">0/50</div>
          </div>

          <div>
            <Label htmlFor="occupation" className="text-base font-medium">
              What do you do?
            </Label>
            <Input
              id="occupation"
              placeholder="Engineer, student, etc."
              value={customizationForm.occupation}
              onChange={(e) => setCustomizationForm({ ...customizationForm, occupation: e.target.value })}
              className="mt-2"
            />
            <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">0/100</div>
          </div>

          <div>
            <Label className="text-base font-medium">
              What traits should T3 Chat have?{" "}
              <span className="text-sm text-gray-500 dark:text-gray-400">(up to 50, max 100 chars each)</span>
            </Label>
            <Input placeholder="Type a trait and press Enter or Tab..." className="mt-2" />
            <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">0/50</div>
            <div className="flex flex-wrap gap-2 mt-3">
              {traits.map((trait) => (
                <Badge key={trait} variant="secondary" className="gap-1">
                  {trait}
                  <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <Plus className="w-3 h-3 rotate-45" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="additional" className="text-base font-medium">
              Anything else T3 Chat should know about you?
            </Label>
            <Textarea
              id="additional"
              placeholder="Interests, values, or preferences to keep in mind"
              value={customizationForm.additionalInfo}
              onChange={(e) => setCustomizationForm({ ...customizationForm, additionalInfo: e.target.value })}
              className="mt-2 min-h-[100px]"
            />
            <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">0/3000</div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline">Load Legacy Data</Button>
            <Button className="bg-primary hover:bg-primary/90">Save Preferences</Button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Visual Options</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Boring Theme</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    If you think the pink is too much, turn this on to tone it down.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Hide Personal Information</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Hides your name and email from the UI.</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Main Text Font</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Used in general text throughout the app.</p>
              <Select defaultValue="default">
                <SelectTrigger>
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="serif">Serif</SelectItem>
                  <SelectItem value="mono">Monospace</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-medium">Code Font</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Used in code blocks and inline code in chat messages.
              </p>
              <Select defaultValue="default">
                <SelectTrigger>
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="fira">Fira Code</SelectItem>
                  <SelectItem value="jetbrains">JetBrains Mono</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function HistoryTab() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Message History</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Save your history as JSON, or import someone else&apos;s. Importing will NOT delete existing messages
        </p>
      </div>

      <Card className="p-6 text-center">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Temporarily Disabled - Sorry</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This feature is currently unavailable while we perform maintenance.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Button variant="outline" disabled>
              Select All
            </Button>
            <Button variant="outline" disabled>
              Export
            </Button>
            <Button variant="outline" disabled>
              Delete
            </Button>
            <Button variant="outline" disabled>
              Import (temporarily disabled)
            </Button>
          </div>
        </div>
      </Card>

      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No threads found</p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Danger Zone</h2>
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    If your chats from before June 1st are missing, click this to bring them back. Contact support if
                    you have issues.
                  </p>
                  <Button variant="outline" className="bg-gray-600 text-white hover:bg-gray-700">
                    Restore old chats
                  </Button>
                </div>

                <Separator />

                <div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    Permanently delete your history from both your local device and our servers. *
                  </p>
                  <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Chat History (temporarily disabled)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          * The retention policies of our LLM hosting partners may vary.
        </p>
      </div>
    </div>
  )
}

export function ApiKeysTab() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">API Keys</h1>
        <p className="text-gray-600 dark:text-gray-400">Bring your own API keys for select models.</p>
      </div>

      <Card className="p-8 text-center bg-primary/5 border-primary/20">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pro Feature</h3>
          <p className="text-gray-600 dark:text-gray-400">Upgrade to Pro to access this feature.</p>
          <Button className="bg-primary hover:bg-primary/90">Upgrade to Pro - $8/month</Button>
        </div>
      </Card>
    </div>
  )
}

export function AttachmentsTab() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Attachments</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your uploaded files and attachments. Note that deleting files here will remove them from the relevant
          threads, but not delete the threads. This may lead to unexpected behavior if you delete a file that is still
          being used in a thread.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="select-all" />
        <Label htmlFor="select-all">Select All</Label>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox />
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">pasted:1.txt</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">text/plain</p>
              </div>
            </div>
          </div>
          <Button variant="destructive" size="sm">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
} 