import PropTypes from 'prop-types'
import cs from 'classnames'
import Highlight, { defaultProps } from 'prism-react-renderer'
import 'shared/utils/prisimTheme.css'
import './CodeRenderer.css'

function CodeRenderer({ code, coverage, showCovered, showUncovered }) {
  function isLineHighlighted(i) {
    if (coverage[i]?.coverage?.head === 1 && showUncovered) {
      return 'uncovered'
    } else if (coverage[i]?.coverage?.head === 0 && showCovered) {
      return 'covered'
    }
  }

  function isBaseLine(i) {
    if (coverage[i]?.coverage?.head === 1 && !showUncovered) {
      return true
    } else if (coverage[i]?.coverage?.head === 0 && !showCovered) {
      return true
    }
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
          {tokens.map((line, i) => (
            <div
              key={i}
              {...getLineProps({ line, key: i })}
              className={'table-row'}
            >
              <div
                className={cs(
                  'line-number text-ds-gray-quaternary font-mono table-cell pl-4 pr-2 text-right border-solid',
                  {
                    'bg-ds-coverage-uncovered border-ds-primary-red border-r-2':
                      isLineHighlighted(i) === 'uncovered',
                  },
                  {
                    'bg-ds-coverage-covered border-ds-primary-green border-r-2':
                      isLineHighlighted(i) === 'covered',
                  },
                  {
                    'border-ds-gray-tertiary border-r':
                      isBaseLine(i) ||
                      coverage[i]?.coverage?.head === null ||
                      coverage[i]?.coverage?.head === undefined,
                  }
                )}
              >
                {i + 1}
              </div>
              <div className="table-cell pl-2">
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  )
}

CodeRenderer.propTypes = {
  code: PropTypes.string.isRequired,
  coverage: PropTypes.array,
  showCovered: PropTypes.bool,
  showUncovered: PropTypes.bool,
}

export default CodeRenderer
