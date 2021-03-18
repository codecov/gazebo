import { render, screen, fireEvent } from '@testing-library/react'
import Message from '.'

describe('Message', () => {
  let props

  const defaultProps = {
    variant: 'info',
    children: 'hello',
    onClose: jest.fn(),
  }

  function setup(over = {}) {
    props = {
      ...defaultProps,
      ...over,
    }
    render(<Message {...props} />)
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the message', () => {
      expect(screen.getByText(props.children)).toBeInTheDocument()
    })
  })

  describe('when clicking on the close button', () => {
    beforeEach(() => {
      setup()
      fireEvent.click(screen.getByRole('button'))
    })

    it('calls the handler', () => {
      expect(props.onClose).toHaveBeenCalled()
    })
  })

  describe('when no onClose is passed', () => {
    beforeEach(() => {
      setup({ onClose: null })
    })

    it('doesnt render any button', () => {
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })
})
