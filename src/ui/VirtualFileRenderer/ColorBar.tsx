interface CoverageBarProps {
  locationHash?: string
  lineNumber: number
  coverage?: 'H' | 'M' | 'P'
}

// exporting for testing purposes
export const ColorBar = ({
  coverage,
  locationHash,
  lineNumber,
}: CoverageBarProps) => {
  if (locationHash && locationHash === `#L${lineNumber}`) {
    return (
      <div
        data-testid="highlighted-bar"
        className="pointer-events-none absolute left-[-72px] h-full w-[calc(100%+72px)] bg-ds-blue-medium opacity-25"
      />
    )
  } else if (coverage === 'M') {
    return (
      <div
        data-testid="uncovered-bar"
        className="pointer-events-none absolute left-[-72px] h-full w-[calc(100%+72px)] bg-ds-coverage-uncovered opacity-25"
      />
    )
  } else if (coverage === 'P') {
    return (
      <div
        data-testid="partial-bar"
        className="pointer-events-none absolute left-[-72px] h-full w-[calc(100%+72px)] bg-ds-coverage-partial opacity-25"
      />
    )
  } else if (coverage === 'H') {
    return (
      <div
        data-testid="covered-bar"
        className="pointer-events-none absolute left-[-72px] h-full w-[calc(100%+72px)] bg-ds-coverage-covered opacity-25"
      />
    )
  } else {
    return null
  }
}
