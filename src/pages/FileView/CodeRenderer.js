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
  showPartial = false,
}) {
  return (
    <Highlight
      {...defaultProps}
      code={code}
      language="python"
      theme={undefined}
    >
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
              number={i + 1}
              coverage={coverage[i + 1]}
              showCovered={showCovered}
              showPartial={showPartial}
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
  showPartial: PropTypes.bool,
}

export default CodeRenderer
