import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast, Toaster } from 'react-hot-toast'

import { renderToast, type ToastArgs } from './renderToast'

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

const TestComponent: React.FC<{
  type?: ToastArgs['type']
  options?: object
}> = ({ type, options }) => {
  return (
    <div>
      <button
        onClick={() => {
          renderToast({
            title: 'Cool title',
            content: 'cool content',
            type,
            options,
          })
        }}
      >
        click me
      </button>
      <button
        onClick={() => {
          // this is required because the toasts aren't
          // being removed between render calls
          toast.remove()
        }}
      >
        clear toasts
      </button>
      <Toaster />
    </div>
  )
}

describe('renderToast', () => {
  function setup() {
    const user = userEvent.setup()

    return { user }
  }

  describe('triggering generic toast', () => {
    describe('with options and type passed', () => {
      it('renders toast', async () => {
        const { user } = setup()

        render(<TestComponent type="generic" options={{ duration: 5000 }} />)

        const button = screen.getByRole('button', { name: 'click me' })
        expect(button).toBeInTheDocument()
        await user.click(button)

        const title = screen.getByRole('heading', { name: /Cool title/ })
        expect(title).toBeInTheDocument()

        const clearToasts = screen.getByRole('button', { name: 'clear toasts' })
        expect(clearToasts).toBeInTheDocument()
        await user.click(clearToasts)
      })
    })

    describe('no options are passed', () => {
      it('renders toast', async () => {
        const { user } = setup()

        render(<TestComponent type="generic" />)

        const button = screen.getByRole('button', { name: 'click me' })
        expect(button).toBeInTheDocument()
        await user.click(button)

        const title = screen.getByRole('heading', { name: /Cool title/ })
        expect(title).toBeInTheDocument()

        const clearToasts = screen.getByRole('button', { name: 'clear toasts' })
        expect(clearToasts).toBeInTheDocument()
        await user.click(clearToasts)
      })
    })

    describe('no type passed', () => {
      it('renders toast', async () => {
        const { user } = setup()

        render(<TestComponent />)

        const button = screen.getByRole('button', { name: 'click me' })
        expect(button).toBeInTheDocument()
        await user.click(button)

        const title = screen.getByRole('heading', { name: /Cool title/ })
        expect(title).toBeInTheDocument()

        const clearToasts = screen.getByRole('button', { name: 'clear toasts' })
        expect(clearToasts).toBeInTheDocument()
        await user.click(clearToasts)
      })
    })
  })

  describe('triggering error toast', () => {
    describe('with options and type passed', () => {
      it('renders toast', async () => {
        const { user } = setup()

        render(<TestComponent type="error" options={{ duration: 5000 }} />)

        const button = screen.getByRole('button', { name: 'click me' })
        expect(button).toBeInTheDocument()
        await user.click(button)

        const title = screen.getByRole('heading', { name: /Cool title/ })
        expect(title).toBeInTheDocument()

        const clearToasts = screen.getByRole('button', { name: 'clear toasts' })
        expect(clearToasts).toBeInTheDocument()
        await user.click(clearToasts)
      })
    })

    describe('no options are passed', () => {
      it('renders toast', async () => {
        const { user } = setup()

        render(<TestComponent type="error" />)

        const button = screen.getByRole('button', { name: 'click me' })
        expect(button).toBeInTheDocument()
        await user.click(button)

        const title = screen.getByRole('heading', { name: /Cool title/ })
        expect(title).toBeInTheDocument()

        const clearToasts = screen.getByRole('button', { name: 'clear toasts' })
        expect(clearToasts).toBeInTheDocument()
        await user.click(clearToasts)
      })
    })
  })
})
