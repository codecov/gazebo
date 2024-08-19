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
import { memo, useLayoutEffect, useRef, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import { requestAnimationTimeout } from 'shared/utils/animationFrameUtils'
import { cn } from 'shared/utils/cn'
import { prismLanguageMapper } from 'shared/utils/prismLanguageMapper'
import Icon from 'ui/Icon'

import { ColorBar } from './ColorBar'

import './VirtualFileRenderer.css'
import 'shared/utils/prismTheme.css'

const LINE_ROW_HEIGHT = 18 as const

// copied from prism-react-renderer since they don't export it
type Token = {
  types: string[]
  content: string
  empty?: boolean
}

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
  const [wrapperWidth, setWrapperWidth] = useState<number | '100%'>('100%')

  const initializeRender = useRef(true)
  const [wrapperRef, setWrapperRef] = useState<HTMLDivElement | null>(null)

  const virtualizer = useWindowVirtualizer({
    count: tokens.length,
    // this is the height of each line in the code block based off of not having any line wrapping, if we add line wrapping this will need to be updated to dynamically measure the height of each line.
    estimateSize: () => LINE_ROW_HEIGHT,
    overscan: 45, // update to be based off of the height of the window
    scrollMargin: codeDisplayOverlayRef.current?.offsetTop ?? 0,
  })

  useLayoutEffect(() => {
    if (!wrapperRef) return

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries?.[0]
      if (entry) {
        setWrapperWidth(entry.contentRect.width)
      }
    })

    resizeObserver.observe(wrapperRef)

    return () => {
      resizeObserver.disconnect()
    }
  }, [wrapperRef])

  useLayoutEffect(() => {
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
    /**
     * we're not using a dep array here, because there aren't any deps that
     * cause a state update and in turn trigger the effect to run again. We do
     * have early checks at the beginning of the effect to prevent any
     * unnecessary work.
     */
  })

  return (
    // setting this function handler to this directly seems to solve the re-render issues.
    <div className="flex flex-1" ref={setWrapperRef}>
      {/* this div contains the line numbers */}
      <div className="relative z-[2] h-full w-[86px] min-w-[86px] pr-[10px]">
        {virtualizer.getVirtualItems().map((item) => {
          const lineNumber = item.index + 1
          const coverageValue = coverage?.[item.index]

          return (
            <div
              ref={virtualizer.measureElement}
              key={item.index}
              data-index={item.index}
              style={{
                height: `${item.size}px`,
                transform: `translateY(${
                  item.start - virtualizer.options.scrollMargin
                }px)`,
              }}
              className={cn(
                'absolute left-0 top-0 w-full select-none border-r border-ds-gray-tertiary bg-ds-container px-4 text-right text-ds-gray-senary hover:cursor-pointer hover:text-black',
                coverageValue === 'H' && 'bg-ds-coverage-covered',
                coverageValue === 'M' &&
                  'bg-ds-coverage-uncovered after:absolute after:inset-y-0 after:right-0 after:border-r-2 after:border-ds-primary-red',
                coverageValue === 'P' &&
                  'bg-ds-coverage-partial after:absolute after:inset-y-0 after:right-0 after:border-r-2 after:border-dotted after:border-ds-primary-yellow',
                // this needs to come last as it overrides the coverage colors
                location.hash === `#L${lineNumber}` &&
                  'bg-ds-blue-medium/25 font-semibold'
              )}
              onClick={() => {
                location.hash =
                  location.hash === `#L${lineNumber}` ? '' : `#L${lineNumber}`
                history.push(location)
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn({
                    'text-ds-primary-red': coverageValue === 'M',
                    'text-ds-primary-yellow pl-1': coverageValue === 'P',
                  })}
                >
                  {coverageValue === 'M' ? (
                    <Icon
                      name="exclamationTriangle"
                      size="sm"
                      variant="outline"
                      className="inline"
                      label="missing-coverage-icon"
                    />
                  ) : coverageValue === 'P' ? (
                    <span data-testid="partial-coverage-icon">!</span>
                  ) : null}
                </span>
                <span>
                  {location.hash === `#L${lineNumber}` ? '#' : null}
                  {lineNumber}
                </span>
              </div>
            </div>
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
              <ColorBar
                lineNumber={lineNumber}
                locationHash={location.hash}
                coverage={coverage?.[item.index]}
              />
              <div
                className="w-full"
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

export function VirtualFileRenderer({
  code,
  coverage,
  fileName: fileType,
}: VirtualFileRendererProps) {
  const widthDivRef = useRef<HTMLDivElement>(null)
  const codeDisplayOverlayRef = useRef<HTMLDivElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const virtualCodeRendererRef = useRef<HTMLDivElement>(null)

  // this ref is actually used to store the ID of the requestAnimationFrame hence Raf instead of Ref
  const pointerEventsRaf = useRef<{ id: number } | null>(null)

  useLayoutEffect(() => {
    const onScroll = (_event: Event) => {
      /**
       * We want to disable pointer events on the virtual file renderer while
       * scrolling because as the user is scrolling the page, the browser needs
       * to also check to see if the user if the pointer is over any
       * interactive elements (like the line number indicators) during the
       * repaint. By disabling these events, we can reduce the amount of work
       * the browser needs to do during the repaint, as it does not need to
       * check these events.
       */
      if (!pointerEventsRaf.current && virtualCodeRendererRef.current) {
        virtualCodeRendererRef.current.style.pointerEvents = 'none'
      }

      /**
       * If there is a requestAnimationFrame already scheduled, we cancel it
       * and schedule a new one. This is to prevent the pointer events from
       * being re-enabled while the user is still scrolling.
       */
      if (pointerEventsRaf.current) {
        window.cancelAnimationFrame(pointerEventsRaf.current.id)
      }

      /**
       * We then re-enable pointer events after the scroll event has finished so
       * the user can continue interacting with the line number indicators.
       */
      pointerEventsRaf.current = requestAnimationTimeout(() => {
        if (virtualCodeRendererRef.current) {
          virtualCodeRendererRef.current.style.pointerEvents = 'auto'
          pointerEventsRaf.current = null
        }
      }, 50)
    }

    if (virtualCodeRendererRef) {
      window.addEventListener('scroll', onScroll, { passive: true })
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // this effect syncs the scroll position of the text area with the parent div
  useLayoutEffect(() => {
    // if the text area or code display element ref is not available, return
    if (!textAreaRef.current || !codeDisplayOverlayRef.current) return
    // copy the ref into a variable so we can use it in the cleanup function
    const clonedTextAreaRef = textAreaRef.current

    // sync the scroll position of the text area with the code highlight div
    const onScroll = () => {
      if (!clonedTextAreaRef || !codeDisplayOverlayRef.current) return
      codeDisplayOverlayRef.current.scrollLeft = clonedTextAreaRef?.scrollLeft
    }

    // add the scroll event listener
    clonedTextAreaRef.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      // remove the scroll event listener
      clonedTextAreaRef?.removeEventListener('scroll', onScroll)
    }
  }, [])

  // this effect sets an empty div to the width of the text area so the code highlight div can scroll horizontally
  useLayoutEffect(() => {
    // if the text area or width div ref is not available, return
    if (!textAreaRef.current || !widthDivRef.current) return

    // create a resize observer to watch the text area for changes in width so once the text area is resized, the width div can be updated
    const resize = new ResizeObserver((entries) => {
      const entry = entries?.[0]
      if (widthDivRef.current && entry) {
        widthDivRef.current.style.width = `${entry.target.scrollWidth}px`
      }
    })

    // observe the text area for changes
    resize.observe(textAreaRef.current)

    return () => {
      // disconnect the resize observer
      resize.disconnect()
    }
  }, [])

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
        className="absolute z-[1] size-full resize-none overflow-y-hidden whitespace-pre bg-[unset] pl-[94px] pt-px font-mono text-transparent outline-none"
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
