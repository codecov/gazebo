import { render, screen, waitFor } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'

import { useGenerateUserToken } from 'services/access'

import CreateTokenModal from './CreateTokenModal'

vi.mock('services/access')

describe('CreateTokenModal', () => {
  function setup() {
    const user = userEvent.setup()
    const closeModal = vi.fn()
    const success = {
      data: {
        createUserToken: {
          fullToken: '111-222-333',
        },
      },
    }
    const mutate = vi.fn((_, { onSuccess }) => {
      return onSuccess(success)
    })
    useGenerateUserToken.mockReturnValue({
      mutate,
    })

    return { mutate, closeModal, user }
  }

  describe('renders initial CreateTokenModal', () => {
    beforeEach(() => setup())
    it('renders title', () => {
      const { closeModal } = setup()
      render(
        <CreateTokenModal
          provider="gh"
          showModal={true}
          closeModal={closeModal}
        />
      )

      const title = screen.getByText(/Generate new API access token/)
      expect(title).toBeInTheDocument()
    })

    it('renders body', () => {
      const { closeModal } = setup()
      render(
        <CreateTokenModal
          provider="gh"
          showModal={true}
          closeModal={closeModal}
        />
      )

      const label = screen.getByText(/Token Name/)
      expect(label).toBeInTheDocument()
      const input = screen.getByRole('textbox', { name: /token name/ })
      expect(input).toBeInTheDocument()
    })

    it('renders footer', () => {
      const { closeModal } = setup()
      render(
        <CreateTokenModal
          provider="gh"
          showModal={true}
          closeModal={closeModal}
        />
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBe(2)
    })
  })

  describe('when the user types a token name and submits', () => {
    it('calls the mutation', async () => {
      const { mutate, closeModal, user } = setup()
      render(
        <CreateTokenModal
          provider="gh"
          showModal={true}
          closeModal={closeModal}
        />
      )

      const input = screen.getByRole('textbox')
      await user.type(input, '2333')
      const generateToken = screen.getByText('Generate Token')
      await user.click(generateToken)

      expect(mutate).toHaveBeenCalled()
    })

    describe('when mutation is successful', () => {
      it('renders title', async () => {
        const { closeModal } = setup()
        render(
          <CreateTokenModal
            provider="gh"
            showModal={true}
            closeModal={closeModal}
          />
        )

        const title = await screen.findByText(/API access token/)
        expect(title).toBeInTheDocument()
      })

      it('renders body', async () => {
        const { closeModal, user } = setup()
        render(
          <CreateTokenModal
            provider="gh"
            showModal={true}
            closeModal={closeModal}
          />
        )

        const input = screen.getByRole('textbox')
        await user.type(input, '2333')
        const generateToken = screen.getByText('Generate Token')
        await user.click(generateToken)

        const label = screen.getByText(/Personal API token/)
        expect(label).toBeInTheDocument()
        const copyElements = screen.getByTestId('clipboard-copy-token')
        expect(copyElements).toBeInTheDocument()
        window.prompt = vi.fn()
        await user.click(copyElements)

        expect(window.prompt).toHaveBeenCalled()
        const warning = screen.getByText(/Make sure to copy your token now/)
        expect(warning).toBeInTheDocument()
      })
      it('renders footer', async () => {
        const { closeModal, user } = setup()
        render(
          <CreateTokenModal
            provider="gh"
            showModal={true}
            closeModal={closeModal}
          />
        )

        const input = screen.getByRole('textbox')
        await user.type(input, '2333')
        const generateToken = screen.getByText('Generate Token')
        await user.click(generateToken)

        const button = screen.getByRole('button', {
          name: /done/i,
        })
        expect(button).toBeInTheDocument()
      })
      it('close modals', async () => {
        const { closeModal, user } = setup()
        render(
          <CreateTokenModal
            provider="gh"
            showModal={true}
            closeModal={closeModal}
          />
        )

        const input = screen.getByRole('textbox')
        await user.type(input, '2333')
        const generateToken = screen.getByText('Generate Token')
        await user.click(generateToken)
        const done = screen.getByText('Done')
        await user.click(done)

        await waitFor(() => {
          expect(closeModal).toHaveBeenCalled()
        })
      })
    })
  })
})
