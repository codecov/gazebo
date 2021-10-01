import PropTypes from 'prop-types'
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
  language = 'html',
}) {
  return (
    <table className="w-full border-collapse table-auto box-border whitespace-pre-wrap border-solid border-ds-gray-tertiary border">
      <colgroup>
        <col width="40" />
        <col />
      </colgroup>
      <tbody>
        <Highlight
          {...defaultProps}
          code={code}
          language={language}
          theme={undefined}
        >
          {({ tokens, getLineProps, getTokenProps }) =>
            tokens.map((line, i) => (
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
            ))
          }
        </Highlight>
      </tbody>
    </table>
  )
}

CodeRenderer.propTypes = {
  code: PropTypes.string.isRequired,
  coverage: PropTypes.shape(),
  showCovered: PropTypes.bool,
  showUncovered: PropTypes.bool,
  showPartial: PropTypes.bool,
  language: PropTypes.string,
}

export default CodeRenderer
