import cs from 'classnames'
import PropTypes from 'prop-types'

function Line({
  showUncovered,
  showCovered,
  line,
  number,
  coverage,
  getLineProps,
  getTokenProps,
}) {
  const LINE_STATE = Object.freeze({
    COVERED: 'COVERED',
    UNCOVERED: 'UNCOVERED',
    BLANK: 'BLANK',
  })

  const lineState = getLineState()

  const classNamePerLineState = {
    COVERED: 'bg-ds-coverage-covered border-ds-primary-green border-r-2',
    UNCOVERED: 'bg-ds-coverage-uncovered border-ds-primary-red border-r-2',
    BLANK: 'border-ds-gray-tertiary border-r',
  }

  function getLineState() {
    if (coverage === 0 && showUncovered) {
      return LINE_STATE.UNCOVERED
    } else if (coverage === 1 && showCovered) {
      return LINE_STATE.COVERED
    } else return LINE_STATE.BLANK
  }

  return (
    <div
      key={number}
      {...getLineProps({ line, key: number })}
      className={'table-row'}
    >
      <div
        aria-label={lineState}
        className={cs(
          'line-number text-ds-gray-quaternary font-mono table-cell pl-4 pr-2 text-right border-solid',
          classNamePerLineState[lineState]
        )}
      >
        {number + 1}
      </div>
      <div className="table-cell pl-2">
        {line.map((token, key) => (
          <span key={key} {...getTokenProps({ token, key })} />
        ))}
      </div>
    </div>
  )
}

Line.propTypes = {
  line: PropTypes.array.isRequired,
  coverage: PropTypes.number,
  showCovered: PropTypes.bool.isRequired,
  showUncovered: PropTypes.bool.isRequired,
  number: PropTypes.number.isRequired,
  getLineProps: PropTypes.func,
  getTokenProps: PropTypes.func,
}

export default Line
