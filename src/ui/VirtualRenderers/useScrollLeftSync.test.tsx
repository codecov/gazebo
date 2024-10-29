import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useRef } from 'react'

import { useScrollLeftSync } from './useScrollLeftSync'

const mockAddEventListener = vi.fn()

const NullRefComponent = () => {
  const ref = useRef(null)
  useScrollLeftSync({
    // @ts-expect-error - testing null ref
    scrollingRef: { current: null, addEventListener: mockAddEventListener },
    refsToSync: [ref],
  })

  return <div ref={ref} />
}

const TestComponent = () => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  useScrollLeftSync({
    scrollingRef: textAreaRef,
    refsToSync: [overlayRef],
  })
  return (
    <div>
      <textarea ref={textAreaRef} data-testid="text-area" />
      <div ref={overlayRef} data-testid="overlay" />
    </div>
  )
}

describe('useLeftScrollSync', () => {
  describe('refs are null', () => {
    it('early returns', () => {
      render(<NullRefComponent />)

      expect(mockAddEventListener).not.toHaveBeenCalled()
    })
  })

  describe('refs are set', () => {
    it('syncs scroll left', async () => {
      render(<TestComponent />)

      const textArea = screen.getByTestId('text-area')
      fireEvent.scroll(textArea, {
        target: { scrollLeft: 100 },
      })

      const overlay = screen.getByTestId('overlay')
      await waitFor(() => expect(overlay.scrollLeft).toBe(100))
    })
  })
})
