import CreateTokenModal from './CreateTokenModal'
import { render, screen, act } from 'custom-testing-library'
import { useGenerateToken } from 'services/access'
import userEvent from '@testing-library/user-event'

jest.mock('services/access')

describe('CreateTokenModal', () => {
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
    render(<CreateTokenModal {..._props} />)
  }

  describe('renders initial CreateTokenModal', () => {
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

  describe('when the user types a token name and submits', () => {
    beforeEach(() => {
      setup()
      userEvent.type(screen.getByRole('textbox'), '2333')
      return act(() => {
        userEvent.click(screen.getByText('Generate Token'))
        return Promise.resolve()
      })
    })

    it('calls the mutation', () => {
      expect(mutate).toHaveBeenCalled()
    })

    describe('when mutation is successfull', () => {
      beforeEach(() => {
        return act(() => {
          mutate.mock.calls[0][1].onSuccess({
            data: {
              createApiToken: {
                fullToken: '111-222-333',
              },
            },
          })
          return Promise.resolve()
        })
      })

      it('renders title', () => {
        const title = screen.getByText(/API access token/)
        expect(title).toBeInTheDocument()
      })

      it('renders body', () => {
        const label = screen.getByText(/Personal API token/)
        expect(label).toBeInTheDocument()
        const copyElements = screen.getByText('copy', { exact: true })
        expect(copyElements).toBeInTheDocument()
        window.prompt = jest.fn()
        userEvent.click(copyElements)
        expect(window.prompt).toHaveBeenCalled()
        const warning = screen.getByText(/Make sure to copy your token now/)
        expect(warning).toBeInTheDocument()
      })
      it('renders footer', () => {
        const button = screen.getByRole('button', {
          name: /done/i,
        })
        expect(button).toBeInTheDocument()
      })
      it('close modals', () => {
        userEvent.click(screen.getByText('Done'))
        expect(closeModal).toHaveBeenCalled()
      })
    })
  })
})
