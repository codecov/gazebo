/**
 * The VirtualFileRenderer component is used to render code files in a
 * virtualized way that enables us to render large files without performance
 * issues. This component uses TanStack Virtual to handle the virtualization of
 * the code blocks we want to render. There are a few tricks hidden within
 * these components to enable features to provide a better UX.
 *
 * We use a textarea element that is "transparent" from the user but still
 * accessible to the browser. This textarea element is used to store the code
 * content and is used to sync the scroll position of the code display element,
 * highlight/select code for copy pasting, and also to enable users to cmd/ctrl
 * + f to search for text in the code. We also use the width of the textarea to
 * set the width of the code display element so the code display element can
 * scroll horizontally in sync with the text area.
 */
import * as Sentry from '@sentry/react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
// eslint-disable-next-line no-restricted-imports
import { Dictionary } from 'lodash'
import isNaN from 'lodash/isNaN'
import Highlight, { defaultProps } from 'prism-react-renderer'
import { memo, useEffect, useRef } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import { useDisablePointerEvents } from 'shared/useDisablePointerEvents'
import { prismLanguageMapper } from 'shared/utils/prism/prismLanguageMapper'

import { ColorBar } from './ColorBar'
import { LINE_ROW_HEIGHT } from './constants'
import { LineNumber } from './LineNumber'
import { Token } from './types'
import { useLeftScrollSync } from './useLeftScrollSync'
import { useSyncScrollMargin } from './useSyncScrollMargin'
import { useSyncWrapperWidth } from './useSyncWrapperWidth'

import './VirtualFileRenderer.css'
import 'shared/utils/prism/prismTheme.css'

interface CodeBodyProps {
  tokens: Token[][]
  getLineProps: Highlight['getLineProps']
  getTokenProps: Highlight['getTokenProps']
  coverage?: Dictionary<'H' | 'M' | 'P'>
  codeDisplayOverlayRef: React.RefObject<HTMLDivElement>
}

const CodeBody = ({
  tokens,
  getLineProps,
  getTokenProps,
  coverage,
  codeDisplayOverlayRef,
}: CodeBodyProps) => {
  const history = useHistory()
  const location = useLocation()
  const { wrapperWidth, setWrapperRefState } = useSyncWrapperWidth()
  const scrollMargin = useSyncScrollMargin({
    overlayRef: codeDisplayOverlayRef,
  })

  const virtualizer = useWindowVirtualizer({
    count: tokens.length,
    estimateSize: () => LINE_ROW_HEIGHT,
    overscan: 45,
    scrollMargin: scrollMargin ?? 0,
  })

  const initializeRender = useRef(true)
  useEffect(() => {
    if (!initializeRender.current) {
      return
    }
    if (!codeDisplayOverlayRef.current) {
      return
    }
    initializeRender.current = false

    // set the parent div height to the total size of the virtualizer
    codeDisplayOverlayRef.current.style.height = `${virtualizer.getTotalSize()}px`
    codeDisplayOverlayRef.current.style.position = 'relative'

    const index = parseInt(location.hash.slice(2), 10)
    // need to check !isNaN because parseInt return NaN if the string is not a number which is still a valid number.
    if (!isNaN(index) && index > 0 && index <= tokens.length) {
      // need to adjust from line number back to array index
      virtualizer.scrollToIndex(index - 1, { align: 'start' })
    } else {
      Sentry.captureMessage(
        `Invalid line number in file renderer hash: ${location.hash}`,
        { fingerprint: ['file-renderer-invalid-line-number'] }
      )
    }
  }, [codeDisplayOverlayRef, location.hash, tokens.length, virtualizer])

  return (
    // setting this function handler to this directly seems to solve the re-render issues.
    <div className="flex flex-1" ref={setWrapperRefState}>
      {/* this div contains the line numbers */}
      <div className="relative z-[2] h-full w-[86px] min-w-[86px] pr-[10px]">
        {virtualizer.getVirtualItems().map((item) => {
          const lineNumber = item.index + 1
          const coverageValue = coverage?.[lineNumber]

          return (
            <LineNumber
              key={item.index}
              index={item.index}
              virtualizer={virtualizer}
              lineNumber={lineNumber.toString()}
              item={item}
              isHighlighted={location.hash === `#L${lineNumber}`}
              coverageValue={coverageValue}
              onClick={() => {
                location.hash =
                  location.hash === `#L${lineNumber}` ? '' : `#L${lineNumber}`
                history.push(location)
              }}
            />
          )
        })}
      </div>
      {/* this div contains the actual code lines */}
      <div
        // @ts-expect-error - TODO - Update inert when inert is available in React 19
        inert=""
        className="pointer-events-none size-full"
      >
        {virtualizer.getVirtualItems().map((item) => {
          const lineNumber = item.index + 1
          // get any specific things from code highlighting library for this given line
          const { style: lineStyle } = getLineProps({
            // casting this cause it is guaranteed to be present in the array
            line: tokens[item.index]!,
            key: item.index,
          })

          return (
            <div
              ref={virtualizer.measureElement}
              key={item.index}
              data-index={item.index}
              style={{
                width: wrapperWidth,
                height: `${item.size}px`,
                transform: `translateY(${
                  item.start - virtualizer.options.scrollMargin
                }px)`,
              }}
              className="absolute left-0 top-0 pl-[94px]"
            >
              <div className="grid">
                <div className="z-[-1] col-start-1 row-start-1">
                  <ColorBar
                    isHighlighted={location.hash === `#L${lineNumber}`}
                    coverage={coverage?.[lineNumber]}
                  />
                </div>
                <div
                  className="col-start-1 row-start-1"
                  style={{
                    ...lineStyle,
                    height: `${LINE_ROW_HEIGHT}px`,
                    lineHeight: `${LINE_ROW_HEIGHT}px`,
                  }}
                >
                  {tokens[item.index]?.map((token: Token, key: React.Key) => (
                    <span {...getTokenProps({ token, key })} key={key} />
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface MemoedHighlightProps {
  code: string
  fileType: string
  coverage?: Dictionary<'H' | 'M' | 'P'>
  codeDisplayOverlayRef: React.RefObject<HTMLDivElement>
}

const MemoedHighlight = memo(
  ({
    code,
    coverage,
    fileType,
    codeDisplayOverlayRef,
  }: MemoedHighlightProps) => (
    <Highlight
      {...defaultProps}
      code={code}
      theme={undefined}
      language={prismLanguageMapper(fileType)}
    >
      {({ tokens, getLineProps, getTokenProps }) => (
        <CodeBody
          tokens={tokens}
          coverage={coverage}
          getLineProps={getLineProps}
          getTokenProps={getTokenProps}
          codeDisplayOverlayRef={codeDisplayOverlayRef}
        />
      )}
    </Highlight>
  )
)

MemoedHighlight.displayName = 'MemoedHighlight'

interface VirtualFileRendererProps {
  code: string
  coverage?: Dictionary<'H' | 'M' | 'P'>
  fileName: string
}

function VirtualFileRendererComponent({
  code,
  coverage,
  fileName: fileType,
}: VirtualFileRendererProps) {
  const widthDivRef = useRef<HTMLDivElement>(null)
  const codeDisplayOverlayRef = useRef<HTMLDivElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const virtualCodeRendererRef = useRef<HTMLDivElement>(null)
  useDisablePointerEvents(virtualCodeRendererRef)
  useLeftScrollSync({ textAreaRef, overlayRef: codeDisplayOverlayRef })

  return (
    <div
      data-testid="virtual-file-renderer"
      style={{ tabSize: '8' }}
      ref={virtualCodeRendererRef}
      className="relative w-full overflow-x-auto border border-solid  border-ds-gray-tertiary"
    >
      {/**
       * This text area is used to store the code content and is used to sync
       * the scroll position of the code display element, highlight/select code
       * for copy pasting, and also to enable users to cmd/ctrl + f to search
       * for text in the code.
       */}
      <textarea
        ref={textAreaRef}
        data-testid="virtual-file-renderer-text-area"
        style={{
          tabSize: '8',
          overscrollBehaviorX: 'none',
          lineHeight: `${LINE_ROW_HEIGHT}px`,
        }}
        className="absolute z-[1] size-full resize-none overflow-y-hidden whitespace-pre bg-[unset] pl-[94px] font-mono text-transparent outline-none"
        // Directly setting the value of the text area to the code content
        value={code}
        // need to set to true since we're setting a value without an onChange handler
        readOnly={true}
        // disable all the things for text area's so it doesn't interfere with the code display element
        autoCapitalize="false"
        autoCorrect="false"
        spellCheck="false"
        inputMode="none"
        aria-readonly="true"
        tabIndex={0}
        aria-multiline="true"
        aria-haspopup="false"
      />
      <div
        ref={codeDisplayOverlayRef}
        data-testid="virtual-file-renderer-overlay"
        className="overflow-y-hidden whitespace-pre font-mono"
        style={{
          // @ts-expect-error - it is a legacy value that is still valid
          // you can read more about it here: https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-x#values
          overflowX: 'overlay',
        }}
      >
        <div ref={widthDivRef} className="w-full">
          <MemoedHighlight
            code={code}
            fileType={fileType}
            coverage={coverage}
            codeDisplayOverlayRef={codeDisplayOverlayRef}
          />
        </div>
      </div>
    </div>
  )
}

export const VirtualFileRenderer = Sentry.withProfiler(
  VirtualFileRendererComponent,
  {
    name: 'VirtualFileRenderer',
  }
)
