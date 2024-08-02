import { useWindowVirtualizer } from '@tanstack/react-virtual'
// eslint-disable-next-line no-restricted-imports
import type { Dictionary } from 'lodash'
import Highlight, { defaultProps } from 'prism-react-renderer'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import { requestAnimationTimeout } from 'shared/utils/animationFrameUtils'
import { cn } from 'shared/utils/cn'
import { prismLanguageMapper } from 'shared/utils/prismLanguageMapper'

interface CoverageBarProps {
  locationHash?: string
  lineNumber: number
  coverage?: 'H' | 'M' | 'P'
}

// exporting for testing purposes
export const ColorBar = ({
  coverage,
  locationHash,
  lineNumber,
}: CoverageBarProps) => {
  if (locationHash && locationHash === `#L${lineNumber}`) {
    return (
      <div
        data-testid="highlighted-bar"
        className="pointer-events-none absolute left-[-72px] h-full w-[calc(100%+72px)] bg-ds-blue-medium opacity-25"
      />
    )
  } else if (coverage === 'M') {
    return (
      <div
        data-testid="uncovered-bar"
        className="pointer-events-none absolute left-[-72px] h-full w-[calc(100%+72px)] bg-ds-coverage-uncovered opacity-25"
      />
    )
  } else if (coverage === 'P') {
    return (
      <div
        data-testid="partial-bar"
        className="pointer-events-none absolute left-[-72px] h-full w-[calc(100%+72px)] bg-ds-coverage-partial opacity-25"
      />
    )
  } else if (coverage === 'H') {
    return (
      <div
        data-testid="covered-bar"
        className="pointer-events-none absolute left-[-72px] h-full w-[calc(100%+72px)] bg-ds-coverage-covered opacity-25"
      />
    )
  } else {
    return null
  }
}

// copied from prism-react-renderer
type Token = {
  types: string[]
  content: string
  empty?: boolean
}

interface CodeBodyProps {
  tokens: Token[][]
  getLineProps: Highlight['getLineProps']
  getTokenProps: Highlight['getTokenProps']
  coverage: Dictionary<'H' | 'M' | 'P'>
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

  const initialRender = useRef(true)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // virtualize code lines
  const virtualizer = useWindowVirtualizer({
    count: tokens.length,
    estimateSize: () => 18,
    overscan: 75,
    scrollMargin: codeDisplayOverlayRef.current?.offsetTop ?? 0,
  })

  const div = codeDisplayOverlayRef.current
  if (div) {
    // set the parent div height to the total size of the virtualizer
    div.style.height = `${virtualizer.getTotalSize()}px`
    div.style.position = 'relative'
  }

  // TODO - finalize this logic
  // scroll to line on the initial render
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false
      const index = parseInt(location.hash.slice(2), 10)
      virtualizer.scrollToIndex(index)
    }
  }, [location.hash, virtualizer])

  return (
    <div className="flex flex-1" ref={wrapperRef}>
      {/* this div contains the line numbers */}
      <div
        className="z-[2] h-full w-[82px] min-w-[82px] pr-[10px]"
        style={{ position: 'relative' }}
      >
        {virtualizer.getVirtualItems().map((item) => (
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
              `absolute left-0 top-0 w-full border-r border-ds-gray-tertiary bg-white px-4 text-right text-ds-gray-quaternary hover:cursor-pointer hover:text-black`,
              location.hash === `#L${item.index}` &&
                'font-semibold text-ds-gray-quinary',
              coverage[item.index] === 'H' && 'bg-ds-coverage-covered',
              coverage[item.index] === 'M' &&
                'bg-ds-coverage-uncovered after:absolute after:inset-y-0 after:right-0 after:border-r-2 after:border-ds-primary-red',
              coverage[item.index] === 'P' &&
                'bg-ds-coverage-partial after:absolute after:inset-y-0 after:right-0 after:border-r-2 after:border-dotted after:border-ds-primary-yellow'
            )}
            onClick={() => {
              if (location.hash === `#L${item.index}`) {
                location.hash = ''
              } else {
                location.hash = `#L${item.index}`
              }
              history.push(location)
            }}
          >
            {location.hash === `#L${item.index}` ? '#' : null}
            {item.index}
          </div>
        ))}
      </div>
      {/* this div contains the actual code lines */}
      <div
        // TODO - Update inert when inert is available in React 19
        // @ts-ignore
        inert=""
        className="pointer-events-none size-full"
      >
        {virtualizer.getVirtualItems().map((item) => {
          // get any specific things from code highlighting library for this given line
          const { style: lineStyle } = getLineProps({
            // casting this cause it is guaranteed to be present in the array
            line: tokens[item.index] as Token[],
            key: item.index,
          })

          return (
            <div
              ref={virtualizer.measureElement}
              key={item.index}
              data-index={item.index}
              style={{
                width: wrapperRef?.current
                  ? wrapperRef.current.clientWidth
                  : '100%',
                height: `${item.size}px`,
                transform: `translateY(${
                  item.start - virtualizer.options.scrollMargin
                }px)`,
              }}
              className="absolute left-0 top-0 pl-[92px]"
            >
              <ColorBar
                lineNumber={item.index}
                locationHash={location.hash}
                coverage={coverage[item.index]}
              />
              <div className="h-[18px] w-full" style={{ ...lineStyle }}>
                {tokens[item.index]?.map((token: any, key: any) => (
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

CodeBody.displayName = 'CodeBody'

interface VirtualFileRendererProps {
  code: string
  coverage: Dictionary<'H' | 'M' | 'P'>
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
       * We want to disable pointer events on the table while scrolling because
       * as the user is scrolling the page, the browser needs to also check to
       * see if the user if the pointer is over any interactive elements (like
       * the line number indicators) during the repaint. By disabling these
       * events, we can reduce the amount of work the browser needs to do
       * during the repaint, as it does not need to check these events.
       */
      if (!pointerEventsRaf.current && virtualCodeRendererRef.current) {
        virtualCodeRendererRef.current.style.pointerEvents = 'none'
      }

      /**
       * We then re-enable pointer events after the scroll event has finished so
       * the user can continue interacting with the line number indicators.
       */
      if (pointerEventsRaf.current) {
        window.cancelAnimationFrame(pointerEventsRaf.current.id)
      }

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
        style={{
          tabSize: '8',
          overscrollBehaviorX: 'none',
        }}
        className="absolute z-[1] size-full resize-none overflow-y-hidden whitespace-pre bg-[unset] pl-[92px] pt-px font-mono leading-[18px] text-transparent outline-none"
        // disable all the things for text area's so it doesn't interfere with the code display element
        autoCapitalize="false"
        autoCorrect="false"
        spellCheck="false"
        inputMode="none"
        aria-readonly="true"
        tabIndex={0}
        aria-multiline="true"
        aria-haspopup="false"
        value={code}
        readOnly={true}
      />
      <div
        ref={codeDisplayOverlayRef}
        className="overflow-y-hidden whitespace-pre font-mono"
        style={{
          // @ts-ignore
          overflowX: 'overlay',
        }}
      >
        <div ref={widthDivRef} className="w-full">
          {/* @ts-ignore */}
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
        </div>
      </div>
    </div>
  )
}
