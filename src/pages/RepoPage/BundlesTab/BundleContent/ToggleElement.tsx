import { useState } from 'react'

import { cn } from 'shared/utils/cn'
import Icon from 'ui/Icon'

interface ToggleElementProps {
  showElement: string
  hideElement: string
  localStorageKey: string
  toggleRowElement?: React.ReactNode
  children: React.ReactNode
}

export function ToggleElement({
  showElement,
  hideElement,
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
          className="flex cursor-pointer items-center text-ds-primary-base hover:underline [&[data-state=open]>span:first-child]:rotate-90"
          data-state={isHidden ? 'closed' : 'open'}
          onClick={() => {
            setIsHidden(!isHidden)
            localStorage.setItem(localStorageKey, String(!isHidden))
          }}
        >
          <span className="transition-transform duration-200">
            <Icon size="md" variant="solid" name="chevronRight" />
          </span>
          {isHidden ? showElement : hideElement}
        </button>
        {toggleRowElement}
      </div>
      <div
        data-testid="toggle-element-contents"
        className={cn('', { hidden: isHidden })}
      >
        {children}
      </div>
    </div>
  )
}
