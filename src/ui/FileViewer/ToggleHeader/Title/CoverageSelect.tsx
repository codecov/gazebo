import { cva, VariantProps } from 'cva'

import { cn } from 'shared/utils/cn'
import { LINE_STATE } from 'shared/utils/fileviewer'
import CoverageLineIndicator from 'ui/CodeRenderer/CoverageLineIndicator'

const coverageSelect = cva(
  ['flex items-center gap-2 px-2 font-mono text-xs capitalize'],
  {
    variants: {
      coverage: {
        [LINE_STATE.COVERED]: [
          'font-regular border-ds-primary-green bg-ds-coverage-covered',
        ],
        [LINE_STATE.UNCOVERED]: [
          'border-r-2 border-ds-primary-red bg-ds-coverage-uncovered font-bold',
        ],
        [LINE_STATE.PARTIAL]: [
          'border-r-2 border-dotted border-ds-primary-yellow bg-ds-coverage-partial font-bold',
        ],
      },
    },
  }
)

type CoverageSelectVariantProps = VariantProps<typeof coverageSelect>
interface CoverageSelectProps
  extends Omit<CoverageSelectVariantProps, 'coverage'> {
  coverage: NonNullable<CoverageSelectVariantProps['coverage']>
}

export function CoverageSelect({ coverage }: CoverageSelectProps) {
  return (
    <div className={cn(coverageSelect({ coverage }))}>
      <span className="text-ds-default-text">{coverage.toLowerCase()}</span>
      <CoverageLineIndicator coverage={coverage} />
    </div>
  )
}
