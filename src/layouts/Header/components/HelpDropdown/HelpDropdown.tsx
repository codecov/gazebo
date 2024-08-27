import { useQuery } from '@tanstack/react-query'
import { useLayoutEffect } from 'react'

import { SentryUserFeedback } from 'sentry'

import { Theme, useThemeContext } from 'shared/ThemeContext'
import Button from 'ui/Button'
import { Dropdown } from 'ui/Dropdown/Dropdown'
import Icon from 'ui/Icon'

type DropdownItem = {
  to?: { pageName: string }
  hook?: string
  onClick?: () => void
  children: React.ReactNode
}

function HelpDropdown() {
  const { theme } = useThemeContext()
  const { data: form, isSuccess: isFormSuccess } = useQuery({
    queryKey: ['HelpDropdownForm', theme],
    queryFn: () => SentryUserFeedback(theme === Theme.DARK).createForm(),
    suspense: false,
  })

  useLayoutEffect(() => {
    if (!isFormSuccess) return
    form.appendToDom()
    return form.removeFromDom
  }, [form, isFormSuccess])

  const items: DropdownItem[] = [
    {
      to: { pageName: 'docs' },
      children: 'Developer docs',
    },
    {
      to: { pageName: 'support' },
      children: 'Support center',
    },
    {
      onClick: isFormSuccess ? form.open : () => {},
      hook: 'open-modal',
      children: 'Share feedback',
    },
    {
      to: { pageName: 'feedback' },
      children: 'Join GitHub discussions',
    },
  ]

  return (
    <div
      className="relative"
      data-testid="help-dropdown"
      data-cy="auth-help-dropdown"
    >
      <label className="sr-only">Help menu dropdown</label>

      <Dropdown>
        <Dropdown.Trigger
          aria-label="help menu"
          data-marketing="help menu"
          data-testid="help-dropdown-trigger"
        >
          <Icon variant="outline" name="questionMarkCircle" />
        </Dropdown.Trigger>

        <Dropdown.Content
          align="end"
          className="w-[15.5rem] min-w-fit rounded border-ds-gray-tertiary shadow-none"
          aria-label="help menu items"
        >
          {items.map((item, index) => (
            <Dropdown.Item
              key={`main-dropdown-${index}`}
              className="grid p-0 first:pt-2 last:pb-2"
            >
              {/* @ts-expect-error props might be overloaded with stuff */}
              <Button variant="listbox" {...item} />
            </Dropdown.Item>
          ))}
        </Dropdown.Content>
      </Dropdown>
    </div>
  )
}

export default HelpDropdown
