import Highlight, { defaultProps } from 'prism-react-renderer'
import { useLayoutEffect, useRef } from 'react'

import { requestAnimationTimeout } from 'shared/utils/animationFrameUtils'
import { CODE_RENDERER_TYPE } from 'shared/utils/fileviewer'
import 'shared/utils/prisimTheme.css'
import { prismLanguageMapper } from 'shared/utils/prismLanguageMapper'

import './CodeRenderer.css'

interface LineComponentRenderProps {
  i: number
  line: any
  getLineProps: Highlight['getLineProps']
  getTokenProps: Highlight['getTokenProps']
}

type CodeRendererProps = {
  code: string
  fileName: string
  rendererType: keyof typeof CODE_RENDERER_TYPE
  LineComponent: ({
    i,
    line,
    getLineProps,
    getTokenProps,
  }: LineComponentRenderProps) => React.ReactElement
}

function CodeRenderer({
  code,
  fileName,
  LineComponent,
  rendererType,
}: CodeRendererProps) {
  const tableRef = useRef<HTMLTableElement>(null)
  const pointerEventsRaf = useRef<{ id: number } | null>(null)

  useLayoutEffect(() => {
    const onScroll = (_event: Event) => {
      if (!pointerEventsRaf.current && tableRef.current) {
        tableRef.current.style.pointerEvents = 'none'
      }

      if (pointerEventsRaf.current) {
        window.cancelAnimationFrame(pointerEventsRaf.current.id)
      }

      pointerEventsRaf.current = requestAnimationTimeout(() => {
        if (tableRef.current) {
          tableRef.current.style.pointerEvents = 'auto'
          pointerEventsRaf.current = null
        }
      }, 50)
    }

    if (tableRef) {
      window.addEventListener('scroll', onScroll, { passive: true })
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <table
      ref={tableRef}
      className="coderenderer box-border w-full table-auto border-collapse whitespace-pre-wrap border border-solid border-ds-gray-tertiary font-mono"
    >
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
