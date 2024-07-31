import { feedbackIntegration } from '@sentry/react'
import React, { useEffect } from 'react'

import Button from 'ui/Button'
import { Dropdown } from 'ui/Dropdown/Dropdown'
import Icon from 'ui/Icon'

type DropdownItem = {
  to?: { pageName: string }
  hook?: string
  onClick?: () => void
  children: React.ReactNode
}

const removeSentryForm = () => {
  document.body.style.overflow = ''
  document.querySelector('#help-dropdown-widget')?.remove()
}

function HelpDropdown() {
  useEffect(() => removeSentryForm, [])

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
      onClick: async () => {
        const sentryFeedback = feedbackIntegration({
          showBranding: false,
          colorScheme: 'light',
          formTitle: 'Give Feedback',
          buttonLabel: 'Give Feedback',
          submitButtonLabel: 'Send Feedback',
          nameLabel: 'Username',
          isEmailRequired: true,
          autoInject: false,
          id: 'help-dropdown-widget',
          onFormClose: removeSentryForm,
        })
        const form = await sentryFeedback.createForm()
        form.appendToDom()
        form.open()
      },
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
        <span data-marketing="help menu">
          <Dropdown.Trigger>
            <Icon variant="outline" name="questionMarkCircle" />
          </Dropdown.Trigger>
        </span>

        <Dropdown.Content
          align="end"
          className="w-[15.5rem] min-w-fit rounded border-ds-gray-tertiary shadow-none"
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
