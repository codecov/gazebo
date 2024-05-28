import React, { ReactNode, useState } from 'react'

import Icon from 'ui/Icon'

interface ExpandableSectionProps {
  title: string
  children: ReactNode
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="my-2 border border-gray-200">
      <button
        onClick={() => {
          setIsExpanded(!isExpanded)
        }}
        className="flex w-full items-center justify-between p-4 text-left font-semibold hover:bg-gray-100"
      >
        <span>{title}</span>
        <Icon name={isExpanded ? 'chevronUp' : 'chevronDown'} size="sm" />
      </button>
      {isExpanded && (
        <div className="border-t border-gray-200 p-4">{children}</div>
      )}
    </div>
  )
}

export default ExpandableSection
