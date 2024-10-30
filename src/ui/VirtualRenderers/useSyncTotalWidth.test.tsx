import { render, screen, waitFor } from '@testing-library/react'
import { useRef } from 'react'

import { useSyncTotalWidth } from './useSyncTotalWidth'

window.requestAnimationFrame = (cb) => {
  cb(1)
  return 1
}
window.cancelAnimationFrame = () => {}

const scrollToMock = vi.fn()
window.scrollTo = scrollToMock
window.scrollY = 100

class ResizeObserverMock {
  callback = (x: any) => null

  constructor(callback: any) {
    this.callback = callback
  }

  observe() {
    this.callback([
      {
        contentRect: { width: 100 },
        target: {
          scrollWidth: 100,
          getAttribute: () => ({ scrollWidth: 100 }),
          getBoundingClientRect: () => ({ top: 100 }),
        },
      },
    ])
  }
  unobserve() {
    // do nothing
  }
  disconnect() {
    // do nothing
  }
}
global.window.ResizeObserver = ResizeObserverMock

const TestComponent = () => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const widthDivRef = useRef<HTMLDivElement>(null)
  useSyncTotalWidth({ textAreaRef, widthDivRef })

  return (
    <div>
      <textarea
        data-testid="text-area"
        style={{ width: '100px' }}
        ref={textAreaRef}
      />
      <div data-testid="width-div" ref={widthDivRef} />
    </div>
  )
}

describe('useSyncTotalWidth', () => {
  it('should update the width of the width div to the width of the text area', async () => {
    render(<TestComponent />)
    const widthDiv = screen.getByTestId('width-div')
    await waitFor(() => expect(widthDiv).toHaveStyle({ width: '100px' }))
  })
})
