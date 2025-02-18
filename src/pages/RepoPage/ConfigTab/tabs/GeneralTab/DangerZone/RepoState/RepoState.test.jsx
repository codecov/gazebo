import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import RepoState from './RepoState'

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
  console.error = () => {}
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('RepoState', () => {
  function setup({ activated = false, failMutation = false } = {}) {
    const user = userEvent.setup()
    const mutate = vi.fn()
    const addNotification = vi.fn()

    server.use(
      graphql.query('GetRepoSettings', () => {
        return HttpResponse.json({
          data: {
            owner: {
              repository: {
                __typename: 'Repository',
                activated,
                defaultBranch: 'master',
                private: true,
                uploadToken: 'token',
                graphToken: null,
                yaml: 'yaml',
                bot: {
                  username: 'test',
                },
                staticAnalysisToken: null,
              },
            },
          },
        })
      }),
      http.patch('/internal/github/codecov/repos/codecov-client/', () => {
        mutate()

        if (failMutation) {
          return HttpResponse.error(500)
        }

        return HttpResponse.json({})
      })
    )

    mocks.useAddNotification.mockReturnValue(addNotification)

    return { mutate, addNotification, user }
  }

  describe('renders DeactivateRepo component', () => {
    beforeEach(() => {
      setup()
    })
    it('renders title', async () => {
      render(<RepoState />, { wrapper })

      const title = await screen.findByText(/Repo has been deactivated/)
      expect(title).toBeInTheDocument()
    })

    it('renders Activate Repo button', async () => {
      render(<RepoState />, { wrapper })

      const activationButton = await screen.findByRole('button', {
        name: 'Activate',
      })
      expect(activationButton).toBeInTheDocument()
    })
  })

  describe('when the user clicks on Activate button', () => {
    it('calls the mutation', async () => {
      const { mutate, user } = setup()

      render(<RepoState />, { wrapper })

      const activationButton = await screen.findByRole('button', {
        name: 'Activate',
      })
      await user.click(activationButton)

      await waitFor(() => expect(mutate).toHaveBeenCalled())
    })
  })

  describe('when mutation data has active set to true', () => {
    it('displays deactivate button', async () => {
      setup({ activated: true })
      render(<RepoState />, { wrapper })

      const deactivateButton = await screen.findByTestId('deactivate-repo')
      expect(deactivateButton).toBeInTheDocument()
    })

    it('displays the warning', async () => {
      setup({ activated: true })
      render(<RepoState />, { wrapper })

      const warning = await screen.findByText(
        'This will prevent any further uploads'
      )
      expect(warning).toBeInTheDocument()
    })

    describe('when the user clicks on Deactivate button', () => {
      it('displays Deactivate Repo Modal', async () => {
        const { user } = setup({ activated: true })

        render(<RepoState />, {
          wrapper,
        })

        const deactivateButton = await screen.findByTestId('deactivate-repo')
        await user.click(deactivateButton)

        const warning = await screen.findByText(
          'Are you sure you want to deactivate the repo?'
        )
        expect(warning).toBeInTheDocument()

        const modalDeactivateButton = await screen.findByTestId(
          'deactivate-repo-modal'
        )
        expect(modalDeactivateButton).toBeInTheDocument()

        const cancelButton = await screen.findByRole('button', {
          name: 'Cancel',
        })
        expect(cancelButton).toBeInTheDocument()
      })

      describe('when user clicks on Cancel button', () => {
        it('does not call the mutation', async () => {
          const { mutate, user } = setup({ activated: true })

          render(<RepoState />, {
            wrapper,
          })

          const deactivateButton = await screen.findByTestId('deactivate-repo')
          await user.click(deactivateButton)

          const cancelButton = await screen.findByRole('button', {
            name: 'Cancel',
          })
          await user.click(cancelButton)

          expect(mutate).not.toHaveBeenCalled()
        })
      })

      describe('when user clicks on Deactivate button', () => {
        it('calls the mutation', async () => {
          const { mutate, user } = setup({ activated: true })

          render(<RepoState />, {
            wrapper,
          })

          const deactivateButton = await screen.findByTestId('deactivate-repo')
          await user.click(deactivateButton)

          const modalDeactivateButton = await screen.findByTestId(
            'deactivate-repo-modal'
          )
          await user.click(modalDeactivateButton)
          await waitFor(() => expect(mutate).toHaveBeenCalled())
        })
      })
    })
  })

  describe('when activate mutation is not successful', () => {
    it('calls the mutation', async () => {
      const { mutate, user } = setup({ failMutation: true })

      render(<RepoState />, { wrapper })

      const activationButton = await screen.findByRole('button', {
        name: 'Activate',
      })
      expect(activationButton).toBeInTheDocument()

      await user.click(activationButton)
      await waitFor(() => expect(mutate).toHaveBeenCalled())
    })

    it('adds an error notification', async () => {
      const { addNotification, user } = setup({ failMutation: true })

      render(<RepoState />, { wrapper })

      const activationButton = await screen.findByRole('button', {
        name: 'Activate',
      })
      await user.click(activationButton)

      await waitFor(() =>
        expect(addNotification).toHaveBeenCalledWith({
          type: 'error',
          text: 'We were not able to activate this repo',
        })
      )
    })
  })

  describe('when deactivate mutation is not successful', () => {
    it('calls the mutation', async () => {
      const { mutate, user } = setup({ activated: true, failMutation: true })

      render(<RepoState />, {
        wrapper,
      })

      const deactivateButton = await screen.findByTestId('deactivate-repo')
      await user.click(deactivateButton)

      const modalDeactivateButton = await screen.findByTestId(
        'deactivate-repo-modal'
      )
      await user.click(modalDeactivateButton)

      await waitFor(() => expect(mutate).toHaveBeenCalled())
    })

    it('adds an error notification', async () => {
      const { addNotification, user } = setup({
        activated: true,
        failMutation: true,
      })

      render(<RepoState />, {
        wrapper,
      })

      const deactivateButton = await screen.findByTestId('deactivate-repo')
      await user.click(deactivateButton)

      const modalDeactivateButton = await screen.findByTestId(
        'deactivate-repo-modal'
      )
      await user.click(modalDeactivateButton)

      await waitFor(() =>
        expect(addNotification).toHaveBeenCalledWith({
          type: 'error',
          text: 'We were not able to deactivate this repo',
        })
      )
    })
  })
})
