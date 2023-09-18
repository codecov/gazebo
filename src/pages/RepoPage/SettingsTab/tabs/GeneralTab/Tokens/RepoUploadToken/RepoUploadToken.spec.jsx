import { render, screen, waitFor } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'

import RepoUploadToken from './RepoUploadToken'

jest.mock('services/toastNotification')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
  logger: {
    error: () => {},
  },
})
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/codecov-client/settings']}>
      <Route path="/:provider/:owner/:repo/settings">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
  jest.resetAllMocks()
})
afterAll(() => {
  server.close()
})

describe('RepoUploadToken', () => {
  function setup(
    { uploadToken = undefined, triggerError = false } = {
      uploadToken: undefined,
      triggerError: false,
    }
  ) {
    const user = userEvent.setup()
    const mutate = jest.fn()
    const addNotification = jest.fn()

    useAddNotification.mockReturnValue(addNotification)

    server.use(
      rest.patch(
        `/internal/github/codecov/repos/codecov-client/regenerate-upload-token/`,
        (req, res, ctx) => {
          mutate(req)
          if (triggerError) {
            return res(ctx.status(500))
          } else {
            return res(
              ctx.status(200),
              ctx.json({
                data: { uploadToken },
              })
            )
          }
        }
      )
    )

    return { mutate, addNotification, user }
  }

  describe('renders RepoUploadToken component', () => {
    beforeEach(() => setup())
    afterEach(() => jest.resetAllMocks())

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
  })

  describe('when the user clicks on regenerate button', () => {
    afterEach(() => jest.resetAllMocks())

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
        'If you save the new token, make sure to update your CI yml'
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
    afterEach(() => jest.resetAllMocks())

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
    afterEach(() => jest.resetAllMocks())

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
    afterEach(() => jest.resetAllMocks())

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
        })
      )
    })
  })

  describe('when render with no token', () => {
    afterEach(() => jest.resetAllMocks())

    it('does not render component', () => {
      render(<RepoUploadToken uploadToken={null} />, { wrapper })

      const title = screen.queryByText(/Repository upload token/)
      expect(title).not.toBeInTheDocument()
    })
  })
})
