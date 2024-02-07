import cs from 'classnames'
import PropTypes from 'prop-types'

import {
  classNamePerLineContent,
  classNamePerLineState,
  getLineState,
  LINE_TYPE,
  lineStateToLabel,
} from 'shared/utils/fileviewer'
import CoverageLineIndicator from 'ui/CodeRenderer/CoverageLineIndicator'

import { useScrollToLine } from '../hooks'

function DiffLine({
  getTokenProps,
  lineContent,
  headNumber,
  baseNumber,
  headCoverage,
  baseCoverage,
  path,
  hitCount,
}) {
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
  })

  const {
    lineRef: headLineRef,
    handleClick: headHandleClick,
    targeted: headTargeted,
  } = useScrollToLine({
    number: headNumber,
    path,
    head: true,
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
          <span className="text-black">
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
          <span className="text-black">
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
            {lineContent?.map((token, key) => (
              <span key={key} {...getTokenProps({ token, key })} />
            ))}
          </div>
          <CoverageLineIndicator coverage={headLineState} hitCount={hitCount} />
        </div>
      </td>
    </tr>
  )
}

DiffLine.propTypes = {
  edgeOfFile: PropTypes.bool,
  lineContent: PropTypes.array.isRequired,
  headNumber: PropTypes.string,
  baseNumber: PropTypes.string,
  baseCoverage: PropTypes.oneOf(Object.values(LINE_TYPE)),
  headCoverage: PropTypes.oneOf(Object.values(LINE_TYPE)),
  getTokenProps: PropTypes.func,
  path: PropTypes.string,
  hitCount: PropTypes.number,
}

export default DiffLine
