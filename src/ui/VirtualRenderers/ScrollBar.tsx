import { LINE_ROW_HEIGHT } from './constants'

interface ScrollBarProps {
  scrollBarRef: React.RefObject<HTMLDivElement>
  wrapperWidth: number | '100%'
}

export const ScrollBar = ({ scrollBarRef, wrapperWidth }: ScrollBarProps) => {
  return (
    <div
      ref={scrollBarRef}
      style={{ height: `${LINE_ROW_HEIGHT - 3}px` }}
      data-testid="virtual-renderer-scroll-bar"
      className="pointer-events-auto sticky bottom-0 z-[2] w-full overflow-x-auto overflow-y-hidden"
    >
      <div style={{ width: wrapperWidth, height: '1px' }}></div>
    </div>
  )
}
