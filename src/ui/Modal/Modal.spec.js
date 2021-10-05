import { render, screen } from 'custom-testing-library'
import userEvent from '@testing-library/user-event'
import Modal from './Modal'

describe('Modal', () => {
  let wrapper, props

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    body: 'hello',
    title: 'modal title',
  }

  function setup(over = {}) {
    props = {
      ...over,
      ...defaultProps,
    }
    wrapper = render(<Modal {...props} />)
  }

  describe('when the modal is closed', () => {
    beforeEach(() => {
      setup({
        isOpen: false,
      })
    })

    it('renders nothing', () => {
      expect(wrapper.container).toBeEmptyDOMElement()
    })
  })

  describe('when the modal is open', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the title', () => {
      expect(screen.getByRole('heading')).toHaveTextContent(props.title)
    })

    it('renders the children', () => {
      expect(screen.queryByText(props.body)).toBeInTheDocument()
    })
  })

  describe('when clicking on the close button', () => {
    beforeEach(() => {
      setup()
      userEvent.click(wrapper.getByLabelText('Close'))
    })

    it('calls the close handler', () => {
      expect(props.onClose).toHaveBeenCalled()
    })
  })

  describe('renders a footer', () => {
    beforeEach(() => {
      setup({ footer: <span>this is the footer</span> })
    })

    it('redners footer', () => {
      expect(screen.queryByText(/this is the footer/)).toBeInTheDocument()
    })
  })

  describe('renders a subtitle', () => {
    beforeEach(() => {
      setup({ subtitle: 'to complete the title' })
    })

    it('renders subtitle', () => {
      expect(screen.queryByText(/to complete the title/)).toBeInTheDocument()
    })
  })

  describe('when hasCloseButton is false', () => {
    beforeEach(() => {
      setup({ hasCloseButton: false })
    })

    it('doesnt render close button', () => {
      expect(wrapper.queryByLabelText('Close')).not.toBeInTheDocument()
    })
  })
})
