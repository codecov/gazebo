import * as Collapsible from '@radix-ui/react-collapsible'
import React, { ReactNode } from 'react'

import Icon from 'ui/Icon'

interface ExpandableSectionProps {
  title: string
  children: ReactNode
}

export const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  children,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false)

  return (
    <div className="my-2 border border-gray-200">
      <Collapsible.Root open={isExpanded} onOpenChange={setIsExpanded}>
        <Collapsible.Trigger asChild>
          <button className="flex w-full items-center justify-between p-4 text-left font-semibold hover:bg-gray-100">
            <span>{title}</span>
            <Icon name={isExpanded ? 'chevronUp' : 'chevronDown'} size="sm" />
          </button>
        </Collapsible.Trigger>
        <Collapsible.Content className="border-t border-gray-200 p-4">
          {children}
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  )
}
