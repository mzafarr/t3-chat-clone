import { Sparkles, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function AccountTab() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Upgrade to Pro</h1>
        <div className="text-right">
          <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">$8</span>
          <span className="text-gray-600 dark:text-gray-400">/month</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Access to All Models</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get access to our full suite of models including Claude, o3-mini-high, and more!
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Generous Limits</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive <span className="font-medium text-primary">1500 standard credits</span> per month, plus{" "}
                <span className="font-medium text-primary">100 premium credits</span>* per month.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Priority Support</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get faster responses and dedicated assistance from the T3 team whenever you need help!
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="text-center">
        <Button size="lg" className="bg-primary hover:bg-primary/90 px-8">
          Upgrade Now
        </Button>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        * Premium credits are used for GPT Image Gen, Claude Sonnet, and Grok 3. Additional Premium credits can be
        purchased separately.
      </p>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Danger Zone</h2>
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Permanently delete your account and all associated data.
              </p>
              <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 