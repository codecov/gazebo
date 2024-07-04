import { useSelect } from 'downshift'

import { cn } from 'shared/utils/cn'
import Button from 'ui/Button'
import Icon from 'ui/Icon'

// Copying UserDropdown implementation for now until we get a proper
// component made up.
type toProps = {
  pageName: string
  options?: object
}

type itemProps = {
  to?: toProps
  hook?: string
  onClick?: () => void
}

function HelpDropdown() {
  const items = [
    {
      props: { to: { pageName: 'docs' } } as itemProps,
      children: 'Developer docs',
    },
    {
      props: { to: { pageName: 'support' } } as itemProps,
      children: 'Support center',
    },
    {
      props: { onClick: () => {} } as itemProps,
      children: 'Share feedback',
    },
    {
      props: { to: { pageName: 'feedback' } } as itemProps,
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
      data-testid="dropdown"
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
          'z-50 w-[15.5rem] border border-gray-ds-tertiary overflow-hidden rounded bg-white text-gray-900 border-ds-gray-tertiary absolute right-0 top-8 min-w-fit',
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
