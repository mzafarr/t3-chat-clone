interface DashboardTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: "account", label: "Account" },
  { id: "customization", label: "Customization" },
  { id: "history", label: "History & Sync" },
  { id: "models", label: "Models" },
  { id: "api-keys", label: "API Keys" },
  { id: "attachments", label: "Attachments" },
  { id: "contact", label: "Contact Us" },
]

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div className="flex border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === tab.id
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
} 