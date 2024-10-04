import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useRef } from 'react'
import { type MockInstance } from 'vitest'

import { useDisablePointerEvents } from './useDisablePointerEvents'

window.requestAnimationFrame = (cb) => {
  cb(1)
  return 1
}
window.cancelAnimationFrame = () => {}

const TestComponent = () => {
  const elementRef = useRef<HTMLDivElement>(null)
  useDisablePointerEvents(elementRef)

  return <div ref={elementRef} data-testid="virtual-file-renderer"></div>
}

describe('useDisablePointerEvents', () => {
  describe('toggling pointer events', () => {
    let requestAnimationFrameSpy: MockInstance
    let cancelAnimationFrameSpy: MockInstance
    let dateNowSpy: MockInstance

    beforeEach(() => {
      requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame')
      cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame')
      dateNowSpy = vi.spyOn(Date, 'now')
    })

    afterEach(() => {
      requestAnimationFrameSpy.mockRestore()
      cancelAnimationFrameSpy.mockRestore()
      dateNowSpy.mockRestore()
      vi.clearAllMocks()
    })

    it('disables pointer events on scroll and resets after timeout', async () => {
      dateNowSpy
        .mockImplementationOnce(() => 1000)
        .mockImplementationOnce(() => 2000)
      requestAnimationFrameSpy.mockImplementation((cb) => {
        setTimeout(() => {
          cb()
        }, 50)
        return 1
      })

      render(<TestComponent />)

      await fireEvent.scroll(window, { target: { scrollX: 100 } })

      const codeRenderer = screen.getByTestId('virtual-file-renderer')
      await waitFor(() =>
        expect(codeRenderer).toHaveStyle('pointer-events: none')
      )
      await waitFor(() =>
        expect(codeRenderer).toHaveStyle('pointer-events: auto')
      )
    })

    it('calls cancelAnimationFrame', async () => {
      dateNowSpy
        .mockImplementationOnce(() => 1000)
        .mockImplementationOnce(() => 2000)
      requestAnimationFrameSpy.mockImplementation((cb) => {
        setTimeout(() => {
          cb()
        }, 50)
        return 1
      })

      const { container } = render(<TestComponent />)

      await fireEvent.scroll(window, { target: { scrollX: 100 } })

      // eslint-disable-next-line testing-library/no-container
      container.remove()
      await fireEvent.scroll(window, { target: { scrollX: 100 } })
      await fireEvent.scroll(window, { target: { scrollX: 100 } })

      await waitFor(() => expect(cancelAnimationFrameSpy).toHaveBeenCalled())
    })
  })
})
