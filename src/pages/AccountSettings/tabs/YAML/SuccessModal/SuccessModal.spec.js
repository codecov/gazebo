import ResModal from './SuccessModal'
import { render, screen } from 'custom-testing-library'
import { useGenerateToken } from 'services/access'

jest.mock('services/access')

describe('ResModal', () => {
  const closeModal = jest.fn()
  const defaultProps = {
    provider: 'gh',
    showModal: true,
    closeModal: closeModal,
  }
  const mutate = jest.fn()

  function setup(props) {
    useGenerateToken.mockReturnValue({
      mutate,
    })

    const _props = { ...defaultProps, ...props }
    render(<ResModal {..._props} />)
  }

  describe('renders initial ResModal', () => {
    beforeEach(() => {
      setup()
    })
    it('renders title', () => {
      const title = screen.getByText(/Generate new API access token/)
      expect(title).toBeInTheDocument()
    })
    it('renders body', () => {
      const label = screen.getByText(/Token Name/)
      expect(label).toBeInTheDocument()
      const input = document.querySelector('#token-name')
      expect(input).toBeInTheDocument()
    })
    it('renders footer', () => {
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBe(2)
    })
  })
})
