import cs from 'classnames'

import {
  classNamePerLineContent,
  classNamePerLineState,
  getLineState,
  lineStateToLabel,
  type LineType,
} from 'shared/utils/fileviewer'
import CoverageLineIndicator from 'ui/CodeRenderer/CoverageLineIndicator'

import { useScrollToLine } from '../hooks'

type LineContent = { types: Array<string>; content: string }

export interface DiffLineProps {
  baseCoverage: LineType | null
  baseNumber?: string
  getTokenProps: ({ token, key }: { token: LineContent; key: number }) => object
  headCoverage: LineType | null
  headNumber?: string
  hitCount: number | null
  lineContent: Array<LineContent>
  path?: string
  stickyPadding?: number
}

const DiffLine: React.FC<DiffLineProps> = ({
  getTokenProps,
  lineContent,
  headNumber,
  baseNumber,
  headCoverage,
  baseCoverage,
  path,
  hitCount,
  stickyPadding,
}) => {
  const baseLineState = getLineState({ coverage: baseCoverage })
  const headLineState = getLineState({ coverage: headCoverage })

  const {
    lineRef: baseLineRef,
    handleClick: baseHandleClick,
    targeted: baseTargeted,
  } = useScrollToLine({
    number: baseNumber,
    path,
    base: true,
    stickyPadding,
  })

  const {
    lineRef: headLineRef,
    handleClick: headHandleClick,
    targeted: headTargeted,
  } = useScrollToLine({
    number: headNumber,
    path,
    head: true,
    stickyPadding,
  })

  return (
    <tr data-testid="fv-diff-line">
      <td
        aria-label={lineStateToLabel[baseLineState]}
        className={cs(
          'line-number text-ds-gray-quaternary font-mono text-right border-solid px-2 select-none',
          classNamePerLineState()[baseLineState]
        )}
        ref={baseLineRef}
      >
        <button
          onClick={baseHandleClick}
          className={cs('flex-1 text-right px-2', baseTargeted && 'font-bold')}
        >
          <span className="text-ds-secondary-text">
            <span className={cs({ invisible: !baseTargeted })}>#</span>
            {baseNumber}
          </span>
        </button>
      </td>
      <td
        aria-label={lineStateToLabel[headLineState]}
        className={cs(
          'line-number text-ds-gray-quaternary font-mono text-right border-solid select-none',
          classNamePerLineState(headTargeted)[headLineState]
        )}
        ref={headLineRef}
      >
        <button
          onClick={headHandleClick}
          className={cs('flex-1 text-right px-2', headTargeted && 'font-bold')}
        >
          <span className="text-ds-secondary-text">
            <span className={cs({ invisible: !headTargeted })}>#</span>
            {headNumber}
          </span>
        </button>
      </td>
      <td
        data-testid="affected-lines"
        className={cs(
          'pl-2 break-all',
          classNamePerLineContent(headTargeted)[headLineState]
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            {lineContent?.map((token, key) => {
              return <span key={key} {...getTokenProps({ token, key })} />
            })}
          </div>
          <CoverageLineIndicator coverage={headLineState} hitCount={hitCount} />
        </div>
      </td>
    </tr>
  )
}

export default DiffLine
