import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import CreateTokenModal from './CreateTokenModal'

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    {children}
  </QueryClientProviderV5>
)

const server = setupServer()

beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('CreateTokenModal', () => {
  function setup() {
    const user = userEvent.setup()
    const closeModal = vi.fn()
    const mutateMock = vi.fn()

    server.use(
      graphql.mutation('CreateUserToken', (info) => {
        mutateMock(info.variables)
        return HttpResponse.json({
          data: { createUserToken: { fullToken: '111-222-333', error: null } },
        })
      })
    )

    return { mutateMock, closeModal, user }
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
        />,
        { wrapper }
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
        />,
        { wrapper }
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
        />,
        { wrapper }
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBe(2)
    })
  })

  describe('when the user types a token name and submits', () => {
    it('calls the mutation', async () => {
      const { mutateMock, closeModal, user } = setup()
      render(
        <CreateTokenModal
          provider="gh"
          showModal={true}
          closeModal={closeModal}
        />,
        { wrapper }
      )

      const input = screen.getByRole('textbox')
      await user.type(input, '2333')
      const generateToken = screen.getByText('Generate Token')
      await user.click(generateToken)

      await waitFor(() => expect(mutateMock).toHaveBeenCalled())
      expect(mutateMock).toHaveBeenCalledWith({
        input: { name: '2333', tokenType: 'api' },
      })
    })

    describe('when mutation is successful', () => {
      it('renders title', async () => {
        const { closeModal } = setup()
        render(
          <CreateTokenModal
            provider="gh"
            showModal={true}
            closeModal={closeModal}
          />,
          { wrapper }
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
          />,
          { wrapper }
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
          />,
          { wrapper }
        )

        const input = screen.getByRole('textbox')
        await user.type(input, '2333')

        const generateToken = screen.getByText('Generate Token')
        await user.click(generateToken)

        const button = await screen.findByRole('button', {
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
          />,
          { wrapper }
        )

        const input = screen.getByRole('textbox')
        await user.type(input, '2333')

        const generateToken = screen.getByText('Generate Token')
        await user.click(generateToken)

        const done = await screen.findByText('Done')
        await user.click(done)

        await waitFor(() => {
          expect(closeModal).toHaveBeenCalled()
        })
      })
    })
  })
})
