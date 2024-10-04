import * as Sentry from '@sentry/react'
import Highlight, { defaultProps } from 'prism-react-renderer'
import { useLayoutEffect, useRef } from 'react'

import { requestAnimationTimeout } from 'shared/utils/animationFrameUtils'
import { CODE_RENDERER_TYPE } from 'shared/utils/fileviewer'
import 'shared/utils/prism/prismTheme.css'
import { prismLanguageMapper } from 'shared/utils/prism/prismLanguageMapper'

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
      /**
       * We want to disable pointer events on the table while scrolling because
       * as the user is scrolling the page, the browser needs to also check to
       * see if the user if the pointer is over any interactive elements (like
       * the line number indicators) during the repaint. By disabling these
       * events, we can reduce the amount of work the browser needs to do
       * during the repaint, as it does not need to check these events.
       */
      if (!pointerEventsRaf.current && tableRef.current) {
        tableRef.current.style.pointerEvents = 'none'
      }

      /**
       * We then re-enable pointer events after the scroll event has finished so
       * the user can continue interacting with the line number indicators.
       */
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

export default Sentry.withProfiler(CodeRenderer, {
  name: 'CodeRenderer',
})
