import { render, screen } from 'custom-testing-library'
import userEvent from '@testing-library/user-event'
import Modal from './Modal'

describe('Modal', () => {
  let wrapper, props

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: 'hello',
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
      expect(screen.queryByText(props.children)).toBeInTheDocument()
    })
  })

  describe('when clicking on the close button', () => {
    beforeEach(() => {
      setup()
      userEvent.click(wrapper.getByRole('button'))
    })

    it('calls the close handler', () => {
      expect(props.onClose).toHaveBeenCalled()
    })
  })
})
