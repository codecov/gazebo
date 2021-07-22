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
  function isLineHighlighted() {
    if (coverage === 0 && showUncovered) {
      return 'uncovered'
    } else if (coverage === 1 && showCovered) {
      return 'covered'
    }
  }

  function isBaseLine() {
    if (coverage === 0 && !showUncovered) {
      return true
    } else if (coverage === 1 && !showCovered) {
      return true
    }
    return false
  }

  function getAriaLabel() {
    if (isLineHighlighted() === 'uncovered' && showUncovered) {
      return 'uncovered'
    } else if (isLineHighlighted() === 'covered' && showCovered) {
      return 'covered'
    }
    return 'code-line'
  }

  return (
    <div
      key={number}
      {...getLineProps({ line, key: number })}
      className={'table-row'}
    >
      <div
        aria-label={getAriaLabel()}
        className={cs(
          'line-number text-ds-gray-quaternary font-mono table-cell pl-4 pr-2 text-right border-solid',
          {
            'bg-ds-coverage-uncovered border-ds-primary-red border-r-2':
              isLineHighlighted() === 'uncovered',
          },
          {
            'bg-ds-coverage-covered border-ds-primary-green border-r-2':
              isLineHighlighted() === 'covered',
          },
          {
            'border-ds-gray-tertiary border-r':
              isBaseLine() || coverage === null || coverage === undefined,
          }
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
