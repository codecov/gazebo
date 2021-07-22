import PropTypes from 'prop-types'
import cs from 'classnames'
import Highlight, { defaultProps } from 'prism-react-renderer'
import 'shared/utils/prisimTheme.css'
import './CodeRenderer.css'
import Line from './Line'

function CodeRenderer({
  code,
  coverage = [],
  showCovered = false,
  showUncovered = false,
}) {
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
            <Line
              key={i}
              line={line}
              number={i}
              coverage={coverage[i + 1]}
              showCovered={showCovered}
              showUncovered={showUncovered}
              getLineProps={getLineProps}
              getTokenProps={getTokenProps}
            />
          ))}
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
