import { type VirtualItem, type Virtualizer } from '@tanstack/react-virtual'

import { cn } from 'shared/utils/cn'
import Icon from 'ui/Icon'

import { LINE_ROW_HEIGHT } from './constants'
import { CoverageValue } from './types'

interface LineNumberProps {
  index: number
  virtualizer: Virtualizer<Window, Element>
  lineNumber: string | null | undefined
  item: VirtualItem
  isHighlighted: boolean
  coverageValue: CoverageValue
  onClick: () => void
}

export const LineNumber = ({
  index,
  virtualizer,
  lineNumber,
  item,
  isHighlighted,
  coverageValue,
  onClick,
}: LineNumberProps) => {
  return (
    <div
      ref={virtualizer.measureElement}
      key={index}
      data-index={index}
      style={{
        height: `${item.size}px`,
        transform: `translateY(${
          item.start - virtualizer.options.scrollMargin
        }px)`,
      }}
      className={cn(
        'absolute left-0 top-0 w-full select-none border-r border-ds-gray-tertiary bg-ds-container pl-2 pr-4 text-right text-ds-gray-senary hover:text-ds-secondary-text',
        lineNumber && 'hover:cursor-pointer',
        coverageValue === 'H' && 'bg-ds-coverage-covered',
        coverageValue === 'M' &&
          'bg-ds-coverage-uncovered after:absolute after:inset-y-0 after:right-0 after:border-r-2 after:border-ds-primary-red',
        coverageValue === 'P' &&
          'bg-ds-coverage-partial after:absolute after:inset-y-0 after:right-0 after:border-r-2 after:border-dotted after:border-ds-primary-yellow',
        // this needs to come last as it overrides the coverage colors
        isHighlighted && 'bg-ds-blue-medium/25'
      )}
      onClick={onClick}
    >
      <div
        className="flex items-center justify-between"
        style={{
          height: `${LINE_ROW_HEIGHT}px`,
          lineHeight: `${LINE_ROW_HEIGHT}px`,
        }}
      >
        <span
          className={cn({
            'text-ds-primary-red': coverageValue === 'M',
            'text-ds-primary-yellow pl-1': coverageValue === 'P',
          })}
        >
          {coverageValue === 'M' ? (
            <Icon
              name="exclamationTriangle"
              size="sm"
              variant="outline"
              className="inline"
              label="missing-coverage-icon"
            />
          ) : coverageValue === 'P' ? (
            <span data-testid="partial-coverage-icon">!</span>
          ) : null}
        </span>
        <span>
          {isHighlighted ? '#' : null}
          {lineNumber}
        </span>
      </div>
    </div>
  )
}
