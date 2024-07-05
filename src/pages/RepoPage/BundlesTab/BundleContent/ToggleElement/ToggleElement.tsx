import { useState } from 'react'

import { cn } from 'shared/utils/cn'
import Icon from 'ui/Icon'

interface ToggleElementProps {
  showElement: string
  hideElement: string
  localStorageKey: string
  children: React.ReactNode
}

export function ToggleElement({
  showElement,
  hideElement,
  localStorageKey,
  children,
}: ToggleElementProps) {
  const [isHidden, setIsHidden] = useState(
    () => localStorage.getItem(localStorageKey) === 'true'
  )

  return (
    <div className="hidden lg:block">
      <button
        data-cy="toggle-chart"
        data-marketing="toggle-chart"
        className="flex cursor-pointer items-center pt-2 text-ds-primary-base hover:underline [&[data-state=open]>span:first-child]:rotate-90"
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
      <div
        data-testid="toggle-element-contents"
        className={cn('', { hidden: isHidden })}
      >
        {children}
      </div>
    </div>
  )
}
