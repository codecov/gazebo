// Copying UserDropdown implementation for now until we get a proper
// component made up.

import { feedbackIntegration } from '@sentry/react'
import { useSelect } from 'downshift'
import { useEffect } from 'react'

import { cn } from 'shared/utils/cn'
import Button from 'ui/Button'
import Icon from 'ui/Icon'

type toProps = {
  pageName: string
  options?: object
}

type ItemProps = {
  to?: toProps
  hook?: string
  onClick?: () => void
}

type Item = {
  props: ItemProps
  children: string
}

const removeSentryForm = () => {
  document.body.style.overflow = ''
  document.querySelector('#help-dropdown-widget')?.remove()
}

function HelpDropdown() {
  useEffect(() => removeSentryForm, [])

  const items: Item[] = [
    {
      props: { to: { pageName: 'docs' } },
      children: 'Developer docs',
    },
    {
      props: { to: { pageName: 'support' } },
      children: 'Support center',
    },
    {
      props: {
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
      },
      children: 'Share feedback',
    },
    {
      props: { to: { pageName: 'feedback' } },
      children: 'Join GitHub discussions',
    },
  ]

  const {
    isOpen,
    getToggleButtonProps,
    getItemProps,
    getLabelProps,
    getMenuProps,
  } = useSelect({
    items,
  })

  return (
    <div
      className="relative"
      data-testid="help-dropdown"
      data-cy="auth-help-dropdown"
    >
      <label className="sr-only" {...getLabelProps()}>
        Help menu dropdown
      </label>
      <button
        className="flex flex-1 items-center gap-1 whitespace-nowrap text-left focus:outline-1"
        data-marketing="help menu"
        type="button"
        {...getToggleButtonProps()}
      >
        <Icon variant="outline" name="questionMarkCircle" />
        <span
          aria-hidden="true"
          className={cn('transition-transform', {
            'rotate-180': isOpen,
            'rotate-0': !isOpen,
          })}
        >
          <Icon variant="solid" name="chevronDown" size="sm" />
        </span>
      </button>
      <ul
        className={cn(
          'absolute right-0 top-8 z-50 w-[15.5rem] min-w-fit overflow-hidden rounded border border-ds-gray-tertiary bg-white text-gray-900',
          { hidden: !isOpen }
        )}
        aria-label="help menu items"
        {...getMenuProps()}
      >
        {isOpen &&
          items.map((item, index) => (
            <li
              key={`main-dropdown-${index}`}
              className="grid cursor-pointer text-sm first:pt-2 last:pb-2 hover:bg-ds-gray-secondary"
              {...getItemProps({ item, index })}
            >
              {/* @ts-expect-error props might be overloaded with stuff */}
              <Button variant="listbox" {...item.props}>
                {item.children}
              </Button>
            </li>
          ))}
      </ul>
    </div>
  )
}

export default HelpDropdown
