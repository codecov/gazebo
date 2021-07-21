import PropTypes from 'prop-types'
import cs from 'classnames'
import Highlight, { defaultProps } from 'prism-react-renderer'
import 'shared/utils/prisimTheme.css'
import './CodeRenderer.css'

function CodeRenderer({
  code,
  coverage = [],
  showCovered = false,
  showUncovered = false,
}) {
  function isLineHighlighted(i) {
    if (coverage[i] === 0 && showUncovered) {
      return 'uncovered'
    } else if (coverage[i] === 1 && showCovered) {
      return 'covered'
    }
  }

  function isBaseLine(i) {
    if (coverage[i] === 0 && !showUncovered) {
      return true
    } else if (coverage[i] === 1 && !showCovered) {
      return true
    }
    return false
  }

  function getAriaLabel(report) {
    if (isLineHighlighted(report) === 'uncovered' && showUncovered) {
      return 'uncovered'
    } else if (isLineHighlighted(report) === 'covered' && showCovered) {
      return 'covered'
    }
    return 'code-line'
  }

  return (
    <Highlight {...defaultProps} code={code} language="yaml" theme={undefined}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={cs(
            className,
            'border-solid border-ds-gray-tertiary border'
          )}
          style={style}
        >
          {tokens.map((line, i) => {
            const j = i + 1
            return (
              <div
                key={i}
                {...getLineProps({ line, key: i })}
                className={'table-row'}
              >
                <div
                  aria-label={getAriaLabel(j)}
                  className={cs(
                    'line-number text-ds-gray-quaternary font-mono table-cell pl-4 pr-2 text-right border-solid',
                    {
                      'bg-ds-coverage-uncovered border-ds-primary-red border-r-2':
                        isLineHighlighted(j) === 'uncovered',
                    },
                    {
                      'bg-ds-coverage-covered border-ds-primary-green border-r-2':
                        isLineHighlighted(j) === 'covered',
                    },
                    {
                      'border-ds-gray-tertiary border-r':
                        isBaseLine(j) ||
                        coverage[j] === null ||
                        coverage[j] === undefined,
                    }
                  )}
                >
                  {j}
                </div>
                <div className="table-cell pl-2">
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token, key })} />
                  ))}
                </div>
              </div>
            )
          })}
        </pre>
      )}
    </Highlight>
  )
}

CodeRenderer.propTypes = {
  code: PropTypes.string.isRequired,
  coverage: PropTypes.shape(),
  showCovered: PropTypes.bool,
  showUncovered: PropTypes.bool,
}

export default CodeRenderer
