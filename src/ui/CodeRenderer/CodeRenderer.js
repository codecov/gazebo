import Highlight, { defaultProps } from 'prism-react-renderer'
import PropTypes from 'prop-types'

import 'shared/utils/prisimTheme.css'
import { prismLanguageMapper } from 'shared/utils/prismLanguageMapper'
import './CodeRenderer.css'

function CodeRenderer({ code, fileName, LineComponent }) {
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
            tokens.map((line, i) =>
              LineComponent({ i, line, getLineProps, getTokenProps })
            )
          }
        </Highlight>
      </tbody>
    </table>
  )
}

CodeRenderer.propTypes = {
  code: PropTypes.string.isRequired,
  fileName: PropTypes.string.isRequired,
  LineComponent: PropTypes.func.isRequired,
}

export default CodeRenderer
