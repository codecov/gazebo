import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useRef } from 'react'

import { useLeftScrollSync } from './useLeftScrollSync'

const mockAddEventListener = vi.fn()

const NullRefComponent = () => {
  const ref = useRef(null)
  useLeftScrollSync({
    // @ts-expect-error - testing something
    textAreaRef: { current: null, addEventListener: mockAddEventListener },
    overlayRef: ref,
  })
  return <div ref={ref} />
}

const TestComponent = () => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  useLeftScrollSync({ textAreaRef, overlayRef })
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
      await fireEvent.scroll(textArea, {
        target: { scrollLeft: 100 },
      })

      const overlay = screen.getByTestId('overlay')
      await waitFor(() => expect(overlay.scrollLeft).toBe(100))
    })
  })
})
