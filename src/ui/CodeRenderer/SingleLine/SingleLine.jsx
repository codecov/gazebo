import cs from 'classnames'
import PropTypes from 'prop-types'

import {
  classNamePerLineContent,
  classNamePerLineState,
  getLineState,
  LINE_TYPE,
  lineStateToLabel,
} from 'shared/utils/fileviewer'
import CoverageSelectIcon from 'ui/Icon/CoverageSelectIcon'

import { useScrollToLine } from './useScrollToLine'

function SingleLine({ line, number, coverage, getLineProps, getTokenProps }) {
  const lineState = getLineState({ coverage })
  const { lineRef, handleClick, targeted } = useScrollToLine({ number })

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
          classNamePerLineState[lineState]
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
      <td className={cs('pl-2 break-all', classNamePerLineContent[lineState])}>
        <div className="flex items-center justify-between">
          <div>
            {line.map((token, key) => (
              <span key={key} {...getTokenProps({ token, key })} />
            ))}
          </div>
          <CoverageSelectIcon coverage={lineState} />
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
}

export default SingleLine
