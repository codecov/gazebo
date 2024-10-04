import * as Sentry from '@sentry/react'

import { cn } from 'shared/utils/cn'

function exhaustive(_x: never): void {}

// exporting for testing purposes
export function findCoverage(type: 'H' | 'M' | 'P' | undefined) {
  if (type === undefined) return // valid

  switch (type) {
    case 'H':
      return 'H'
    case 'M':
      return 'M'
    case 'P':
      return 'P'
    default:
      Sentry.captureMessage(`Invalid coverage value: ${type}`)
      exhaustive(type)
  }
}

interface CoverageBarProps {
  locationHash?: string
  lineNumber: number
  coverage?: 'H' | 'M' | 'P'
}

export const ColorBar = ({
  coverage,
  locationHash,
  lineNumber,
}: CoverageBarProps) => {
  if (locationHash === `#L${lineNumber}`) {
    return (
      <div
        data-testid="highlighted-bar"
        className="pointer-events-none absolute left-[-72px] h-full w-[calc(100%+72px)] bg-ds-blue-medium/25"
      />
    )
  }

  const coverageType = findCoverage(coverage)

  if (!coverageType) return null

  return (
    <div
      data-testid={
        coverageType === 'H'
          ? 'covered-bar'
          : coverageType === 'M'
            ? 'uncovered-bar'
            : 'partial-bar'
      }
      className={cn(
        'pointer-events-none absolute left-[-72px] h-full w-[calc(100%+72px)]',
        coverageType === 'H' && 'bg-ds-coverage-covered/50',
        coverageType === 'M' && 'bg-ds-coverage-uncovered/75',
        coverageType === 'P' && 'bg-ds-coverage-partial/50'
      )}
    />
  )
}
