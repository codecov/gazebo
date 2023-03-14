import { act, render, screen } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'

import { useGenerateUserToken } from 'services/access'

import CreateTokenModal from './CreateTokenModal'

jest.mock('services/access')

describe('CreateTokenModal', () => {
  function setup() {
    const closeModal = jest.fn()
    const success = {
      data: {
        createUserToken: {
          fullToken: '111-222-333',
        },
      },
    }
    const mutate = jest.fn((_, { onSuccess }) => {
      return onSuccess(success)
    })
    useGenerateUserToken.mockReturnValue({
      mutate,
    })

    return { mutate, closeModal }
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
      const user = userEvent.setup()
      const { mutate, closeModal } = setup()
      render(
        <CreateTokenModal
          provider="gh"
          showModal={true}
          closeModal={closeModal}
        />
      )

      const input = screen.getByRole('textbox')
      const generateToken = screen.getByText('Generate Token')
      await user.type(input, '2333')
      await act(async () => {
        await user.click(generateToken)
      })

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
        const user = userEvent.setup()
        const { closeModal } = setup()
        render(
          <CreateTokenModal
            provider="gh"
            showModal={true}
            closeModal={closeModal}
          />
        )

        const input = screen.getByRole('textbox')
        const generateToken = screen.getByText('Generate Token')
        await user.type(input, '2333')
        await act(async () => {
          await user.click(generateToken)
        })

        const label = screen.getByText(/Personal API token/)
        expect(label).toBeInTheDocument()
        const copyElements = screen.getByText('copy', { exact: true })
        expect(copyElements).toBeInTheDocument()
        window.prompt = jest.fn()
        await user.click(copyElements)
        expect(window.prompt).toHaveBeenCalled()
        const warning = screen.getByText(/Make sure to copy your token now/)
        expect(warning).toBeInTheDocument()
      })
      it('renders footer', async () => {
        const user = userEvent.setup()
        const { closeModal } = setup()
        render(
          <CreateTokenModal
            provider="gh"
            showModal={true}
            closeModal={closeModal}
          />
        )

        const input = screen.getByRole('textbox')
        const generateToken = screen.getByText('Generate Token')
        await user.type(input, '2333')
        await act(async () => {
          await user.click(generateToken)
        })

        const button = screen.getByRole('button', {
          name: /done/i,
        })
        expect(button).toBeInTheDocument()
      })
      it('close modals', async () => {
        const user = userEvent.setup()
        const { closeModal } = setup()
        render(
          <CreateTokenModal
            provider="gh"
            showModal={true}
            closeModal={closeModal}
          />
        )

        const input = screen.getByRole('textbox')
        const generateToken = screen.getByText('Generate Token')
        await user.type(input, '2333')
        await act(async () => {
          await user.click(generateToken)
        })

        await user.click(screen.getByText('Done'))
        expect(closeModal).toHaveBeenCalled()
      })
    })
  })
})
