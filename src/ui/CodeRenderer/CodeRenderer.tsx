import Highlight, { defaultProps } from 'prism-react-renderer'

import 'shared/utils/prisimTheme.css'
import { CODE_RENDERER_TYPE } from 'shared/utils/fileviewer'
import { prismLanguageMapper } from 'shared/utils/prismLanguageMapper'
import './CodeRenderer.css'

type CodeRendererProps = {
  code: string
  fileName: string
  rendererType: keyof typeof CODE_RENDERER_TYPE
  LineComponent: React.FC<{}>
}

function CodeRenderer({
  code,
  fileName,
  LineComponent,
  rendererType,
}: CodeRendererProps) {
  return (
    <table className="coderenderer box-border w-full table-auto border-collapse whitespace-pre-wrap border border-solid border-ds-gray-tertiary font-mono">
      <colgroup>
        <col width="40" />
        {rendererType === CODE_RENDERER_TYPE.DIFF && <col width="40" />}
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

export default CodeRenderer
