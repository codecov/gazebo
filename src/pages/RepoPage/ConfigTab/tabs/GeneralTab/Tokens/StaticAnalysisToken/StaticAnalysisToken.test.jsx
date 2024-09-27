import { render, screen, waitFor } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import StaticAnalysisToken from './StaticAnalysisToken'

const mocks = vi.hoisted(() => ({
  useAddNotification: vi.fn(),
}))

vi.mock('services/toastNotification', async () => {
  const actual = await vi.importActual('services/toastNotification')
  return {
    ...actual,
    useAddNotification: mocks.useAddNotification,
  }
})
vi.mock('copy-to-clipboard', () => ({ default: () => true }))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/codecov-client/config']}>
    <QueryClientProvider client={queryClient}>
      <Route path="/:provider/:owner/:repo/config">{children}</Route>
    </QueryClientProvider>
  </MemoryRouter>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
  vi.clearAllMocks()
})
afterAll(() => server.close())

describe('StaticAnalysisToken', () => {
  function setup(
    { error = null } = {
      error: null,
    }
  ) {
    const user = userEvent.setup()
    const addNotification = vi.fn()
    const mutate = vi.fn()

    mocks.useAddNotification.mockReturnValue(addNotification)

    server.use(
      graphql.query('CurrentUser', (info) => {
        return HttpResponse.json({
          data: { me: { id: 1, trackingMetadata: { ownerid: 1 } } },
        })
      }),
      graphql.mutation('RegenerateRepositoryToken', (info) => {
        mutate(info.request)
        return HttpResponse.json({
          data: {
            data: {
              regenerateRepositoryToken: {
                token: 'new token',
                error: { __typename: error },
              },
            },
          },
        })
      })
    )
    return { addNotification, mutate, user }
  }

  describe('renders StaticAnalysisToken component', () => {
    beforeEach(() => setup())
    it('renders title', () => {
      render(<StaticAnalysisToken staticAnalysisToken="old token" />, {
        wrapper,
      })

      const title = screen.getByText(/Static analysis token/)
      expect(title).toBeInTheDocument()
    })
    it('renders body', () => {
      render(<StaticAnalysisToken staticAnalysisToken="old token" />, {
        wrapper,
      })

      const p = screen.getByText('Required for static analysis only')
      expect(p).toBeInTheDocument()
      const badge = screen.getByText('BETA')
      expect(badge).toBeInTheDocument()
    })
    it('renders profiling token', () => {
      render(<StaticAnalysisToken staticAnalysisToken="old token" />, {
        wrapper,
      })

      const token = screen.getByText(/old token/)
      expect(token).toBeInTheDocument()
    })
    it('renders regenerate button', () => {
      render(<StaticAnalysisToken staticAnalysisToken="old token" />, {
        wrapper,
      })

      const button = screen.getByRole('button', { name: 'Regenerate' })
      expect(button).toBeInTheDocument()
    })
  })

  describe('when the user clicks on regenerate button', () => {
    describe('displays the regenerate profiling token modal', () => {
      it('renders title', async () => {
        const { user } = setup()
        render(<StaticAnalysisToken staticAnalysisToken="old token" />, {
          wrapper,
        })
        const button = await screen.findByRole('button', { name: 'Regenerate' })
        await user.click(button)

        const title = await screen.findByText('New static analysis token')
        expect(title).toBeInTheDocument()
      })
      it('renders body', async () => {
        const { user } = setup()
        render(<StaticAnalysisToken staticAnalysisToken="old token" />, {
          wrapper,
        })
        const button = await screen.findByRole('button', { name: 'Regenerate' })
        await user.click(button)

        const p = await screen.findByText(
          'If you save the new token, make sure to update your CI YAML'
        )
        expect(p).toBeInTheDocument()
      })
      it('renders generate new token button', async () => {
        const { user } = setup()
        render(<StaticAnalysisToken staticAnalysisToken="old token" />, {
          wrapper,
        })
        const button = await screen.findByRole('button', { name: 'Regenerate' })
        await user.click(button)

        const generateTokenButton = await screen.findByRole('button', {
          name: 'Generate New Token',
        })
        expect(generateTokenButton).toBeInTheDocument()
      })
      it('renders cancel button', async () => {
        const { user } = setup()
        render(<StaticAnalysisToken staticAnalysisToken="old token" />, {
          wrapper,
        })
        const button = await screen.findByRole('button', { name: 'Regenerate' })
        await user.click(button)

        const cancelButton = await screen.findByRole('button', {
          name: 'Cancel',
        })
        expect(cancelButton).toBeInTheDocument()
      })
    })

    describe('when user clicks on Cancel button', () => {
      it('does not call the mutation', async () => {
        const { user, mutate } = setup()
        render(<StaticAnalysisToken staticAnalysisToken="old token" />, {
          wrapper,
        })

        await user.click(
          await screen.findByRole('button', { name: 'Regenerate' })
        )

        expect(mutate).not.toHaveBeenCalled()
      })

      it('does not render the modal', async () => {
        const { user } = setup()
        render(<StaticAnalysisToken staticAnalysisToken="old token" />, {
          wrapper,
        })

        await user.click(
          await screen.findByRole('button', { name: 'Regenerate' })
        )

        const modal = await screen.findByText('New static analysis token')
        expect(modal).toBeInTheDocument()

        const cancelButton = await screen.findByRole('button', {
          name: 'Cancel',
        })
        await user.click(cancelButton)

        const afterCancel = screen.queryByText('New static analysis token')
        expect(afterCancel).not.toBeInTheDocument()
      })
    })
  })

  describe('when user clicks on Generate New Token button', () => {
    it('calls the mutation', async () => {
      const { user, mutate } = setup()
      render(<StaticAnalysisToken staticAnalysisToken="new token" />, {
        wrapper,
      })

      const regenerate = await screen.findByRole('button', {
        name: 'Regenerate',
      })
      await user.click(regenerate)
      const generate = await screen.findByRole('button', {
        name: 'Generate New Token',
      })
      await user.click(generate)

      await waitFor(() => expect(mutate).toHaveBeenCalled())
    })
  })

  describe('when mutation is not successful', () => {
    it('calls the mutation', async () => {
      const { user, mutate } = setup({
        error: 'Authentication Error',
      })
      render(<StaticAnalysisToken staticAnalysisToken="old token" />, {
        wrapper,
      })

      const regenerate = await screen.findByRole('button', {
        name: 'Regenerate',
      })
      await user.click(regenerate)
      const generate = await screen.findByRole('button', {
        name: 'Generate New Token',
      })
      await user.click(generate)

      await waitFor(() => expect(mutate).toHaveBeenCalled())
    })
  })

  describe('when render with no token', () => {
    it('does not render title', () => {
      render(<StaticAnalysisToken staticAnalysisToken={null} />, { wrapper })

      const title = screen.queryByText(/Static analysis token/)
      expect(title).not.toBeInTheDocument()
    })
  })
})
