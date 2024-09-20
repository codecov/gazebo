import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useTruncation } from './hooks'
import TruncatedMessage from './TruncatedMessage'

vi.mock('./hooks')

afterEach(() => {
  cleanup()
})

describe('TruncatedMessage', () => {
  function setup({ canTruncate = false }) {
    // @ts-expect-error
    useTruncation.mockImplementation(() => ({
      ref: () => {},
      canTruncate,
    }))

    const user = userEvent.setup()

    return {
      user,
    }
  }

  describe('canTruncate is set to false', () => {
    beforeEach(() => {
      setup({ canTruncate: false })
    })

    it('displays content', () => {
      render(<TruncatedMessage>Cool Message</TruncatedMessage>)

      const text = screen.getByText('Cool Message')
      expect(text).toBeInTheDocument()
    })

    it('does not display expander button', () => {
      render(<TruncatedMessage>Cool Message</TruncatedMessage>)

      const button = screen.queryByRole('button', { name: 'see more' })
      expect(button).not.toBeInTheDocument()
    })
  })

  describe('canTruncate is set to true', () => {
    it('displays content', () => {
      setup({ canTruncate: true })

      render(<TruncatedMessage>Cool Message</TruncatedMessage>)

      const text = screen.getByText('Cool Message')
      expect(text).toBeInTheDocument()
    })

    it('sets the line clamp class to text', () => {
      setup({ canTruncate: true })

      render(<TruncatedMessage>Cool Message</TruncatedMessage>)

      const text = screen.getByText('Cool Message')
      expect(text).toBeInTheDocument()
      expect(text).toHaveClass('line-clamp-1')
    })

    it('displays expander button', () => {
      setup({ canTruncate: true })

      render(<TruncatedMessage>Cool Message</TruncatedMessage>)

      const button = screen.queryByRole('button', { name: 'see more' })
      expect(button).toBeInTheDocument()
    })

    describe('user interacts with button', () => {
      it('removes the line clamp class', async () => {
        const { user } = setup({ canTruncate: true })

        render(<TruncatedMessage>Cool Message</TruncatedMessage>)

        const btn = screen.getByRole('button', { name: 'see more' })
        await user.click(btn)

        const text = screen.getByText('Cool Message')
        expect(text).toBeInTheDocument()
        expect(text).not.toHaveClass('line-clamp-1')
      })

      it('changes the button text content', async () => {
        const { user } = setup({ canTruncate: true })

        render(<TruncatedMessage>Cool Message</TruncatedMessage>)

        const initialBtn = screen.getByRole('button', { name: 'see more' })
        await user.click(initialBtn)

        const updatedBtn = screen.getByRole('button', { name: 'see less' })
        expect(updatedBtn).toBeInTheDocument()
      })

      it('re-truncates message after second click', async () => {
        const { user } = setup({ canTruncate: true })

        render(<TruncatedMessage>Cool Message</TruncatedMessage>)

        const initialBtn = screen.getByRole('button', { name: 'see more' })
        await user.click(initialBtn)

        const updatedBtn = screen.getByRole('button', { name: 'see less' })
        await user.click(updatedBtn)

        const finalBtn = screen.getByRole('button', { name: 'see more' })
        expect(finalBtn).toBeInTheDocument()
      })
    })
  })
})
