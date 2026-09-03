import { useTranslation } from "react-i18next"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BudgetsTab } from "@/components/planning/budgets-tab"
import { RecurringPaymentsTab } from "@/components/planning/recurring-payments-tab"

export function PlanningPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          {t("planning.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("planning.description")}
        </p>
      </div>
      <Tabs defaultValue="budgets">
        <TabsList>
          <TabsTrigger value="budgets">
            {t("planning.tabs.budgets")}
          </TabsTrigger>
          <TabsTrigger value="recurring">
            {t("planning.tabs.recurring")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="budgets">
          <BudgetsTab />
        </TabsContent>
        <TabsContent value="recurring">
          <RecurringPaymentsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
