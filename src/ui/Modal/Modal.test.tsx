import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import BaseModal from './BaseModal'
import Modal from './Modal'

describe('Modal', () => {
  describe('when the modal is closed', () => {
    it('renders nothing', () => {
      const { container } = render(
        <Modal
          isOpen={false}
          onClose={vi.fn()}
          body="hello"
          title="modal title"
        />
      )

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when the modal is open', () => {
    it('renders the title', () => {
      render(
        <Modal
          isOpen={true}
          onClose={vi.fn()}
          body="hello"
          title="modal title"
        />
      )

      expect(screen.getByRole('heading')).toHaveTextContent('modal title')
    })

    it('renders the children', () => {
      render(
        <Modal
          isOpen={true}
          onClose={vi.fn()}
          body="hello"
          title="modal title"
        />
      )

      expect(screen.getByText('hello')).toBeInTheDocument()
    })
  })

  describe('when clicking on the close button', () => {
    it('calls the close handler', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()
      render(
        <Modal
          isOpen={true}
          onClose={onClose}
          body="hello"
          title="modal title"
        />
      )
      await user.click(screen.getByLabelText('Close'))
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('renders a footer', () => {
    it('renders footer', () => {
      render(
        <Modal
          isOpen={true}
          onClose={vi.fn()}
          body="hello"
          title="modal title"
          footer={<span>this is the footer</span>}
        />
      )

      expect(screen.getByText(/this is the footer/)).toBeInTheDocument()
    })
  })

  describe('renders a subtitle', () => {
    it('renders subtitle', () => {
      render(
        <Modal
          isOpen={true}
          onClose={vi.fn()}
          body="hello"
          title="modal title"
          subtitle="to complete the title"
        />
      )

      expect(screen.getByText(/to complete the title/)).toBeInTheDocument()
    })
  })

  describe('when hasCloseButton is false', () => {
    it(`doesn't render close button`, () => {
      render(
        <Modal
          isOpen={false}
          hasCloseButton={false}
          onClose={vi.fn()}
          body="hello"
          title="modal title"
          subtitle="to complete the title"
        />
      )

      expect(screen.queryByLabelText('Close')).not.toBeInTheDocument()
    })
  })

  describe('When rendered BaseModal', () => {
    it('renders it', () => {
      render(<BaseModal title="title" body="body" onClose={() => null} />)

      expect(screen.getByText(/title/)).toBeInTheDocument()
      expect(screen.getByText(/body/)).toBeInTheDocument()
    })
  })
})
