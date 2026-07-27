import { Languages } from "lucide-react"
import { useTranslation } from "react-i18next"

import { supportedLanguages } from "@/i18n/config"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LanguageToggle() {
  const { t, i18n } = useTranslation()
  const currentLanguage = i18n.resolvedLanguage ?? i18n.language

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon">
            <Languages />
            <span className="sr-only">{t("languageToggle.toggle")}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={currentLanguage}
          onValueChange={(value) => {
            void i18n.changeLanguage(value)
          }}
        >
          {supportedLanguages.map((language) => (
            <DropdownMenuRadioItem key={language} value={language}>
              {t(`languageToggle.${language}`)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
