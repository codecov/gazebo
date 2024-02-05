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

function SingleLine({
  line,
  number,
  coverage,
  getLineProps,
  getTokenProps,
  path,
  stickyPadding = 0,
}) {
  const lineState = getLineState({ coverage })
  const { lineRef, handleClick, targeted } = useScrollToLine({
    number,
    path,
    stickyPadding,
  })

  return (
    <tr
      {...getLineProps({ line, key: number })}
      data-testid="fv-single-line"
      ref={lineRef}
    >
      <td
        aria-label={lineStateToLabel[lineState]}
        className={cs(
          'line-number text-ds-gray-quaternary font-mono text-right border-solid px-2 select-none',
          [classNamePerLineState(targeted)[lineState]]
        )}
      >
        <button
          onClick={handleClick}
          className={cs('flex-1 text-right px-2', targeted && 'font-bold')}
        >
          <span className={cs({ invisible: !targeted })}>#</span>
          {number}
        </button>
      </td>
      <td
        className={cs(
          'pl-2 break-all',
          classNamePerLineContent(targeted)[lineState]
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            {line.map((token, key) => (
              <span key={key} {...getTokenProps({ token, key })} />
            ))}
          </div>
          <CoverageLineIndicator coverage={lineState} />
        </div>
      </td>
    </tr>
  )
}

SingleLine.propTypes = {
  line: PropTypes.array.isRequired,
  coverage: PropTypes.oneOf(Object.values(LINE_TYPE)),
  number: PropTypes.number.isRequired,
  getLineProps: PropTypes.func,
  getTokenProps: PropTypes.func,
  path: PropTypes.string,
  stickyPadding: PropTypes.number,
}

export default SingleLine
