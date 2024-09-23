import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Message from '.'

describe('Message', () => {
  let props

  const defaultProps = {
    variant: 'info',
    children: 'hello',
    onClose: vi.fn(),
  }

  function setup(over = {}) {
    props = {
      ...defaultProps,
      ...over,
    }

    const user = userEvent.setup()

    return { user }
  }

  describe('when rendered', () => {
    it('renders the message', () => {
      setup()
      render(<Message {...props} />)

      const message = screen.getByText(props.children)
      expect(message).toBeInTheDocument()
    })
  })

  describe('when clicking on the close button', () => {
    it('calls the handler', async () => {
      const { user } = setup()
      render(<Message {...props} />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(props.onClose).toHaveBeenCalled()
    })
  })

  describe('when no onClose is passed', () => {
    it('does not render any button', () => {
      setup({ onClose: null })
      render(<Message {...props} />)

      const button = screen.queryByRole('button')
      expect(button).not.toBeInTheDocument()
    })
  })
})
