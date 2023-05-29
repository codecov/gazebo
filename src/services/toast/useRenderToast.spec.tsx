/* eslint-disable react/prop-types */
import { render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toaster } from 'react-hot-toast'

import { ToastTypes, useRenderToast } from './useRenderToast'

// this is needed to stop react-hot-toast from failing
Object.defineProperty(window, 'matchMedia', {
  value: () => {
    return {
      matches: false,
      addListener: () => {},
      removeListener: () => {},
    }
  },
})

const TestComponent: React.FC<{ type: ToastTypes }> = ({ type }) => {
  const { renderToast } = useRenderToast()

  return (
    <div>
      <button
        onClick={() => {
          renderToast({
            title: 'Cool title',
            content: 'cool content',
            type,
            options: {
              duration: 5000,
            },
          })
        }}
      >
        click me
      </button>
      <Toaster />
    </div>
  )
}

describe('useRenderToast', () => {
  function setup() {
    const user = userEvent.setup()

    return { user }
  }

  describe('checking hook returns correct thing', () => {
    it('returns function', () => {
      const { result } = renderHook(() => useRenderToast(), {
        wrapper: ({ children }) => (
          <div>
            {children}
            <Toaster />
          </div>
        ),
      })

      expect(typeof result.current.renderToast).toBe('function')
    })
  })

  describe('triggering generic toast', () => {
    it('renders toast', async () => {
      const { user } = setup()
      render(<TestComponent type="generic" />)

      const button = screen.getByRole('button', { name: 'click me' })
      expect(button).toBeInTheDocument()
      await user.click(button)

      const title = screen.getByRole('heading', { name: /Cool title/ })
      expect(title).toBeInTheDocument()
    })
  })
})
