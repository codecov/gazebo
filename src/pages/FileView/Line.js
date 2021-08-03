import cs from 'classnames'
import PropTypes from 'prop-types'

const LINE_STATE = Object.freeze({
  COVERED: 'COVERED',
  UNCOVERED: 'UNCOVERED',
  BLANK: 'BLANK',
  PARTIAL: 'PARTIAL',
})

const classNamePerLineState = {
  [LINE_STATE.COVERED]:
    'bg-ds-coverage-covered border-ds-primary-green border-r-2',
  [LINE_STATE.UNCOVERED]:
    'bg-ds-coverage-uncovered border-ds-primary-red border-r-2',
  [LINE_STATE.BLANK]: 'border-ds-gray-tertiary border-r',
  [LINE_STATE.PARTIAL]:
    'bg-ds-coverage-partial border-ds-primary-yellow border-r-2',
}

const lineStateToLabel = {
  [LINE_STATE.COVERED]: 'covered line of code',
  [LINE_STATE.UNCOVERED]: 'uncovered line of code',
  [LINE_STATE.BLANK]: 'line of code',
  [LINE_STATE.PARTIAL]: 'partial line of code',
}

function Line({
  showUncovered,
  showCovered,
  line,
  number,
  showPartial,
  coverage,
  getLineProps,
  getTokenProps,
}) {
  const lineState = getLineState()

  // eslint-disable-next-line complexity
  function getLineState() {
    if (coverage === 0 && showUncovered) {
      return LINE_STATE.UNCOVERED
    } else if (coverage === 1 && showCovered) {
      return LINE_STATE.COVERED
    } else if (coverage === 2 && showPartial) {
      return LINE_STATE.PARTIAL
    } else return LINE_STATE.BLANK
  }

  return (
    <div {...getLineProps({ line, key: number })} className={'table-row'}>
      <div
        aria-label={lineStateToLabel[lineState]}
        className={cs(
          'line-number text-ds-gray-quaternary font-mono table-cell pl-4 pr-2 text-right border-solid',
          classNamePerLineState[lineState]
        )}
      >
        {number}
      </div>
      <div
        className={cs('table-cell pl-2', {
          'opacity-50': lineState === LINE_STATE.BLANK,
        })}
      >
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
  showPartial: PropTypes.bool.isRequired,
}

export default Line
