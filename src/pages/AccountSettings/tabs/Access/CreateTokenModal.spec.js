import CreateTokenModal from './CreateTokenModal'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { useGenerateToken } from 'services/access'
import userEvent from '@testing-library/user-event'

jest.mock('services/access')

describe('CreateTokenModal', () => {
  const defaultProps = {
    provider: 'gh',
    showModal: true,
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
  describe('renders initial TokenCreatedModal', () => {
    beforeEach(() => {
      setup()

      fireEvent.change(document.querySelector('#token-name'), {
        target: { value: '23' },
      })
      userEvent.click(screen.getByText(/Generate Token/))
    })

    it('calls the mutation', () => {
      expect(mutate).toHaveBeenCalled()
    })

    describe('when mutation is successfull', () => {
      beforeEach(() => {
        act(() => {
          mutate.mock.calls[0][1].onSuccess({
            data: {
              createApiToken: {
                fullToken: '111-222-333',
              },
            },
          })
        })
      })
      it('renders title', () => {
        const title = screen.getByText(/API access token/)
        expect(title).toBeInTheDocument()
      })
      it('renders body', () => {
        const label = screen.getByText(/Personal API token/)
        expect(label).toBeInTheDocument()
        const copyElements = screen.getAllByText(/copy/)
        expect(copyElements.length).toBe(3)
        const warning = screen.getByText(/Make sure to copy your token now/)
        expect(warning).toBeInTheDocument()
      })
      it('renders footer', () => {
        const buttons = screen.getAllByRole('button')
        expect(buttons.length).toBe(1)
      })
    })
  })
})
