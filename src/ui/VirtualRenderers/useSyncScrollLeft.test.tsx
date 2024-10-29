import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useRef } from 'react'

import { useSyncScrollLeft } from './useSyncScrollLeft'

const mockAddEventListener = vi.fn()

const NullRefComponent = () => {
  const ref = useRef(null)
  useSyncScrollLeft(
    // @ts-expect-error - testing null ref
    { current: null, addEventListener: mockAddEventListener },
    [ref]
  )
  return <div ref={ref} />
}

const TestComponent = () => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  useSyncScrollLeft(textAreaRef, [overlayRef])
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
