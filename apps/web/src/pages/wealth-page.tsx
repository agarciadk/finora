import { useTranslation } from "react-i18next"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountsTab } from "@/components/wealth/accounts-tab"
import { TransactionsTab } from "@/components/wealth/transactions-tab"

export function WealthPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          {t("wealth.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("wealth.description")}
        </p>
      </div>
      <Tabs defaultValue="accounts">
        <TabsList>
          <TabsTrigger value="accounts">
            {t("wealth.tabs.accounts")}
          </TabsTrigger>
          <TabsTrigger value="transactions">
            {t("wealth.tabs.transactions")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="accounts">
          <AccountsTab />
        </TabsContent>
        <TabsContent value="transactions">
          <TransactionsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
