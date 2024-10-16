import { render, screen, waitFor } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import RepoUploadToken from './RepoUploadToken'

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

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
  logger: {
    error: () => {},
  },
})
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/codecov-client/config']}>
      <Route path="/:provider/:owner/:repo/config">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
  vi.resetAllMocks()
})
afterAll(() => {
  server.close()
})

describe('RepoUploadToken', () => {
  function setup(
    {
      uploadToken = undefined,
      triggerError = false,
      uploadTokenRequired = false,
    } = {
      uploadToken: undefined,
      triggerError: false,
      uploadTokenRequired: false,
    }
  ) {
    const user = userEvent.setup()
    const mutate = vi.fn()
    const addNotification = vi.fn()

    mocks.useAddNotification.mockReturnValue(addNotification)

    server.use(
      graphql.query('GetUploadTokenRequired', () => {
        return HttpResponse.json({
          data: {
            owner: {
              orgUploadToken: 'test-mock-org-upload-token',
              isAdmin: true,
              uploadTokenRequired,
            },
          },
        })
      }),
      graphql.mutation('RegenerateRepositoryUploadToken', (info) => {
        mutate(info.request.variables)
        if (triggerError) {
          return HttpResponse.json({
            data: {
              regenerateRepositoryUploadToken: {
                error: {
                  __typename: 'ValidationError',
                },
              },
            },
          })
        }

        return HttpResponse.json({
          data: {
            regenerateRepositoryUploadToken: {
              value: 'test',
            },
          },
        })
      })
    )

    return { mutate, addNotification, user }
  }

  describe('renders RepoUploadToken component', () => {
    beforeEach(() => setup())
    afterEach(() => vi.resetAllMocks())

    it('renders title', () => {
      render(<RepoUploadToken uploadToken="old token" />, { wrapper })

      const title = screen.getByText(/Repository upload token/)
      expect(title).toBeInTheDocument()
    })

    it('renders body', () => {
      render(<RepoUploadToken uploadToken="old token" />, { wrapper })

      const p = screen.getByText('Used for uploading coverage reports')
      expect(p).toBeInTheDocument()

      const addTokenToCICD = screen.getByText(
        'If you’d like to add the token directly to your CI/CD Environment:'
      )
      expect(addTokenToCICD).toBeInTheDocument()
    })

    it('renders two formats of token', () => {
      render(<RepoUploadToken uploadToken="old token" />, { wrapper })

      const firstFormat = screen.getByText(/CODECOV_TOKEN=old token/)
      expect(firstFormat).toBeInTheDocument()
      const secondFormat = screen.getByText(/token: old token/)
      expect(secondFormat).toBeInTheDocument()
    })

    it('renders regenerate button', () => {
      render(<RepoUploadToken uploadToken="old token" />, { wrapper })

      const regenerate = screen.getByRole('button', { name: 'Regenerate' })
      expect(regenerate).toBeInTheDocument()
    })

    it('renders upload token required message when uploadTokenRequired is false', async () => {
      setup({ uploadTokenRequired: false, uploadToken: 'some-random-token' })
      render(<RepoUploadToken uploadToken="old token" />, { wrapper })

      const message = await screen.findByText(
        'Uploading with token is now not required. You can upload without a token. Contact your admins to manage the global upload token settings.'
      )
      expect(message).toBeInTheDocument()
    })

    it('does not render upload token required message when uploadTokenRequired is true', async () => {
      setup({ uploadTokenRequired: true, uploadToken: 'some-random-token' })
      render(<RepoUploadToken uploadToken="old token" />, { wrapper })

      await waitFor(() => expect(queryClient.isFetching()).toBe(0))

      const message = screen.queryByText(
        'Uploading with token is now not required. You can upload without a token. Contact your admins to manage the global upload token settings.'
      )
      expect(message).not.toBeInTheDocument()
    })
  })

  describe('when the user clicks on regenerate button', () => {
    afterEach(() => vi.resetAllMocks())

    it('displays the regenerate upload token modal', async () => {
      const { user } = setup()
      render(<RepoUploadToken uploadToken="old token" />, { wrapper })

      const regenerate = screen.getByRole('button', { name: 'Regenerate' })
      await user.click(regenerate)

      const newToken = screen.getByText('New repository upload token')
      expect(newToken).toBeInTheDocument()
      const repositoryAPIToken = screen.getByText('Repository API token')
      expect(repositoryAPIToken).toBeInTheDocument()
      const ifYouSaveTheNewToken = screen.getByText(
        'If you save the new token, make sure to update your CI YAML'
      )
      expect(ifYouSaveTheNewToken).toBeInTheDocument()
      const generateNewToken = screen.getByRole('button', {
        name: 'Generate New Token',
      })
      expect(generateNewToken).toBeInTheDocument()

      const cancel = screen.getByRole('button', { name: 'Cancel' })
      expect(cancel).toBeInTheDocument()
    })
  })

  describe('when user clicks on Cancel button', () => {
    afterEach(() => vi.resetAllMocks())

    it('does not call the mutation', async () => {
      const { mutate, user } = setup()
      render(<RepoUploadToken uploadToken="old token" />, { wrapper })

      const regenerate = screen.getByRole('button', { name: 'Regenerate' })
      await user.click(regenerate)
      const cancel = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancel)
      expect(mutate).not.toHaveBeenCalled()
    })

    it('renders the old token', async () => {
      const { user } = setup()
      render(<RepoUploadToken uploadToken="old token" />, { wrapper })

      const regenerate = screen.getByRole('button', { name: 'Regenerate' })
      await user.click(regenerate)
      const cancel = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancel)
      expect(screen.getByText('CODECOV_TOKEN=old token')).toBeInTheDocument()
    })
  })

  describe('when user clicks on Generate New Token button', () => {
    afterEach(() => vi.resetAllMocks())

    it('calls the mutation', async () => {
      const tokenName = 'new token'
      const { mutate, user } = setup({ uploadToken: tokenName })
      render(<RepoUploadToken uploadToken={tokenName} />, { wrapper })

      const regenerate = screen.getByRole('button', { name: 'Regenerate' })
      await user.click(regenerate)
      const generateNewTokenButton = await screen.findByRole('button', {
        name: 'Generate New Token',
      })
      await user.click(generateNewTokenButton)

      await waitFor(() => expect(mutate).toHaveBeenCalled())
    })

    it('renders the new token', async () => {
      const tokenName = 'new token'
      const { user } = setup({ uploadToken: tokenName })
      render(<RepoUploadToken uploadToken={tokenName} />, { wrapper })

      const regenerate = screen.getByRole('button', { name: 'Regenerate' })
      await user.click(regenerate)
      const generateNewToken = screen.getByRole('button', {
        name: 'Generate New Token',
      })
      await user.click(generateNewToken)

      const newToken = screen.getByText('CODECOV_TOKEN=new token')
      expect(newToken).toBeInTheDocument()
    })
  })

  describe('when mutation is not successful', () => {
    afterEach(() => vi.resetAllMocks())

    it('adds an error notification', async () => {
      const tokenName = 'new token'
      const { addNotification, user } = setup({
        uploadToken: tokenName,
        triggerError: true,
      })
      render(<RepoUploadToken uploadToken={tokenName} />, { wrapper })

      const regenerate = screen.getByRole('button', { name: 'Regenerate' })
      await user.click(regenerate)
      const generateNewToken = screen.getByRole('button', {
        name: 'Generate New Token',
      })
      await user.click(generateNewToken)

      await waitFor(() =>
        expect(addNotification).toHaveBeenCalledWith({
          type: 'error',
          text: 'Something went wrong',
          disappearAfter: 10000,
        })
      )
    })
  })

  describe('when render with no token', () => {
    afterEach(() => vi.resetAllMocks())

    it('does not render component', () => {
      render(<RepoUploadToken uploadToken={null} />, { wrapper })

      const title = screen.queryByText(/Repository upload token/)
      expect(title).not.toBeInTheDocument()
    })
  })
})
