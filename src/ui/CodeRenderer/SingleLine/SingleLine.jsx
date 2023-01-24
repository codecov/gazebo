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
          targeted
            ? 'bg-ds-gray-octonary text-white'
            : 'text-ds-gray-quaternary',
          'flex line-number font-mono text-right border-solid select-none relative border-ds-gray-tertiary border-r',
          !targeted && classNamePerLineState[lineState]
        )}
      >
        <button onClick={handleClick} className="flex-1 text-right px-2">
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
