import { Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"

export function ContactTab() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">We&apos;re here to help!</h1>
      </div>

      <div className="space-y-4">
        <Card className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary mt-1" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Have a cool feature idea?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Vote on upcoming features or suggest your own</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
          <div className="flex items-start gap-3">
            <span className="text-primary mt-1">🐛</span>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Found a non-critical bug?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                UI glitches or formatting issues? Report them here :)
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
          <div className="flex items-start gap-3">
            <span className="text-red-600 mt-1">⚠️</span>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Having account or billing issues?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Email us for priority support - support@ping.gg
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
          <div className="flex items-start gap-3">
            <span className="text-purple-600 mt-1">💬</span>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Want to join the community?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Come hang out in our Discord! Chat with the team and other users
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
          <div className="flex items-start gap-3">
            <span className="text-gray-600 mt-1">🔒</span>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Privacy Policy</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Read our privacy policy and data handling practices
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
          <div className="flex items-start gap-3">
            <span className="text-gray-600 mt-1">📋</span>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Terms of Service</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Review our terms of service and usage guidelines
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 