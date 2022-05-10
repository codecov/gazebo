import Highlight, { defaultProps } from 'prism-react-renderer'
import PropTypes from 'prop-types'

import 'shared/utils/prisimTheme.css'
import { LINE_TYPE } from 'shared/utils/fileviewerLines'
import { prismLanguageMapper } from 'shared/utils/prismLanguageMapper'
import './CodeRenderer.css'

import SingleLine from './SingleLine'

function CodeRenderer({
  code,
  coverage = {},
  showCovered = false,
  showUncovered = false,
  showPartial = false,
  fileName,
}) {
  const showLines = { showCovered, showUncovered, showPartial }

  return (
    <table className="w-full border-collapse table-auto box-border whitespace-pre-wrap border-solid border-ds-gray-tertiary border font-mono">
      <colgroup>
        <col width="40" />
        <col />
      </colgroup>
      <tbody>
        <Highlight
          {...defaultProps}
          code={code}
          language={prismLanguageMapper(fileName)}
          theme={undefined}
        >
          {({ tokens, getLineProps, getTokenProps }) =>
            tokens.map((line, i) => (
              <SingleLine
                key={i}
                line={line}
                number={i + 1}
                coverage={coverage && coverage[i + 1]}
                showLines={showLines}
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
  coverage: PropTypes.objectOf(
    PropTypes.oneOf([LINE_TYPE.HIT, LINE_TYPE.MISS, LINE_TYPE.PARTIAL])
  ),
  showCovered: PropTypes.bool,
  showUncovered: PropTypes.bool,
  showPartial: PropTypes.bool,
  fileName: PropTypes.string.isRequired,
}

export default CodeRenderer
