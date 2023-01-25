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
  const mutate = jest.fn()
  const addNotification = jest.fn()

  function setup(uploadToken = undefined, triggererror = false) {
    useAddNotification.mockReturnValue(addNotification)

    server.use(
      rest.patch(
        `/internal/github/codecov/repos/codecov-client/regenerate-upload-token/`,
        (req, res, ctx) => {
          mutate(req)
          if (triggererror) {
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
  }

  describe('renders RepoUploadToken componenet', () => {
    beforeEach(() => {
      setup()
    })
    it('renders title', () => {
      render(<RepoUploadToken uploadToken="old token" />, { wrapper })
      const title = screen.getByText(/Repository upload token/)
      expect(title).toBeInTheDocument()
    })
    it('renders body', () => {
      render(<RepoUploadToken uploadToken="old token" />, { wrapper })
      const p = screen.getByText('Token is used for uploading coverage reports')
      expect(p).toBeInTheDocument()
      const note = screen.getByText('Note:')
      expect(note).toBeInTheDocument()
      expect(
        screen.getByText(
          'If you’d like to add the token directly to your CI/CD Environment:'
        )
      ).toBeInTheDocument()
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
      expect(
        screen.getByRole('button', { name: 'Regenerate' })
      ).toBeInTheDocument()
    })
  })

  describe('when the user clicks on regenerate button', () => {
    beforeEach(() => {
      setup()
    })

    it('displays the regenerate upload token modal', () => {
      render(<RepoUploadToken uploadToken="old token" />, { wrapper })
      userEvent.click(screen.getByRole('button', { name: 'Regenerate' }))
      expect(
        screen.getByText('New repository upload token')
      ).toBeInTheDocument()
      expect(screen.getByText('Repository API token')).toBeInTheDocument()
      expect(
        screen.getByText(
          'If you save the new token, make sure to update your CI yml'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Generate New Token' })
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })
  })

  describe('when user clicks on Cancel button', () => {
    beforeEach(() => {
      setup()
    })

    it('does not call the mutation', () => {
      render(<RepoUploadToken uploadToken="old token" />, { wrapper })
      userEvent.click(screen.getByRole('button', { name: 'Regenerate' }))
      userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(mutate).not.toHaveBeenCalled()
    })

    it('renders the old token', () => {
      render(<RepoUploadToken uploadToken="old token" />, { wrapper })
      userEvent.click(screen.getByRole('button', { name: 'Regenerate' }))
      userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(screen.getByText('CODECOV_TOKEN=old token')).toBeInTheDocument()
    })
  })

  describe('when user clicks on Generate New Token button', () => {
    const tokenName = 'new token'
    beforeEach(() => {
      setup(tokenName)
    })
    it('calls the mutation', async () => {
      render(<RepoUploadToken uploadToken={tokenName} />, { wrapper })
      userEvent.click(screen.getByRole('button', { name: 'Regenerate' }))
      const generateNewTokenButton = await screen.findByRole('button', {
        name: 'Generate New Token',
      })
      userEvent.click(generateNewTokenButton)
      await waitFor(() => expect(mutate).toHaveBeenCalled())
    })

    it('renders the new token', () => {
      render(<RepoUploadToken uploadToken={tokenName} />, { wrapper })
      userEvent.click(screen.getByRole('button', { name: 'Regenerate' }))
      userEvent.click(
        screen.getByRole('button', { name: 'Generate New Token' })
      )
      expect(screen.getByText('CODECOV_TOKEN=new token')).toBeInTheDocument()
    })
  })

  describe('when mutation is not successful', () => {
    const tokenName = 'new token'
    beforeEach(() => {
      const triggerError = true
      setup(tokenName, triggerError)
    })

    it('adds an error notification', async () => {
      render(<RepoUploadToken uploadToken={tokenName} />, { wrapper })
      userEvent.click(screen.getByRole('button', { name: 'Regenerate' }))
      userEvent.click(
        screen.getByRole('button', { name: 'Generate New Token' })
      )
      await waitFor(() =>
        expect(addNotification).toHaveBeenCalledWith({
          type: 'error',
          text: 'Something went wrong',
        })
      )
    })
  })
})
