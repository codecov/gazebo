import cs from 'classnames'
import PropTypes from 'prop-types'

import {
  classNamePerLineContent,
  classNamePerLineState,
  getLineState,
  LINE_TYPE,
  lineStateToLabel,
} from 'shared/utils/fileviewer'

function SingleLine({ line, number, coverage, getLineProps, getTokenProps }) {
  const lineState = getLineState({ coverage })

  return (
    <tr {...getLineProps({ line, key: number })} data-testid="fv-single-line">
      <td
        aria-label={lineStateToLabel[lineState]}
        className={cs(
          'line-number text-ds-gray-quaternary font-mono text-right border-solid px-2 select-none',
          classNamePerLineState[lineState]
        )}
      >
        {number}
      </td>
      <td className={cs('pl-2 break-all', classNamePerLineContent[lineState])}>
        {line.map((token, key) => (
          <span key={key} {...getTokenProps({ token, key })} />
        ))}
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
