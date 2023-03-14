import { render, screen } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'

import Modal from './Modal'

describe('Modal', () => {
  describe('when the modal is closed', () => {
    it('renders nothing', () => {
      const { container } = render(
        <Modal isOpen={false} onClose={jest.fn()} title="modal title">
          hello
        </Modal>
      )
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when the modal is open', () => {
    it('renders the title', () => {
      render(
        <Modal isOpen={true} onClose={jest.fn()} title="modal title">
          hello
        </Modal>
      )
      expect(screen.getByRole('heading')).toHaveTextContent('modal title')
    })

    it('renders the children', () => {
      render(
        <Modal isOpen={true} onClose={jest.fn()} title="modal title">
          hello
        </Modal>
      )
      expect(screen.getByText('hello')).toBeInTheDocument()
    })
  })

  describe('when clicking on the close button', () => {
    it('calls the close handler', async () => {
      const user = userEvent.setup()
      const onClose = jest.fn()
      render(
        <Modal isOpen={true} onClose={onClose} title="modal title">
          hello
        </Modal>
      )

      await user.click(screen.getByRole('button'))

      expect(onClose).toHaveBeenCalled()
    })
  })
})
