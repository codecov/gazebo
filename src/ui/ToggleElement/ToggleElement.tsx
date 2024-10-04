import { useState } from 'react'

import { cn } from 'shared/utils/cn'
import Icon from 'ui/Icon'

interface ToggleElementProps {
  showButtonContent: React.ReactNode
  hideButtonContent: React.ReactNode
  localStorageKey: string
  toggleRowElement?: React.ReactNode
  children: React.ReactNode
}

export function ToggleElement({
  showButtonContent,
  hideButtonContent,
  localStorageKey,
  toggleRowElement,
  children,
}: ToggleElementProps) {
  const [isHidden, setIsHidden] = useState(
    () => localStorage.getItem(localStorageKey) === 'true'
  )

  return (
    <div className="hidden lg:block">
      <div className="flex items-center justify-between py-4">
        <button
          data-cy="toggle-chart"
          data-marketing="toggle-chart"
          className="flex cursor-pointer items-center text-ds-secondary-text hover:underline [&[data-state=open]>span:first-child]:rotate-90"
          data-state={isHidden ? 'closed' : 'open'}
          onClick={() => {
            setIsHidden(!isHidden)
            localStorage.setItem(localStorageKey, String(!isHidden))
          }}
        >
          <span className="transition-transform duration-200">
            <Icon size="md" variant="solid" name="chevronRight" />
          </span>
          {/* When the element is hidden we want to show the show button content and the inverse when it is shown */}
          {isHidden ? showButtonContent : hideButtonContent}
        </button>
        {toggleRowElement}
      </div>
      <div
        data-testid="toggle-element-contents"
        className={cn({ hidden: isHidden })}
      >
        {children}
      </div>
    </div>
  )
}
