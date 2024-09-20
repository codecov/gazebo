import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route, Switch } from 'react-router-dom'
import { vi } from 'vitest'

import InstallationHelpBanner from './InstallationHelpBanner'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const server = setupServer()

beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

const wrapper =
  (initialEntries = ['/gh?setup_action=install']) =>
  ({ children }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Switch>
            <Route path="/:provider">{children}</Route>
          </Switch>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

describe('InstallationHelpBanner', () => {
  function setup() {
    const mutation = vi.fn()

    const mockSetItem = vi.spyOn(window.localStorage.__proto__, 'setItem')
    const mockGetItem = vi.spyOn(window.localStorage.__proto__, 'getItem')

    server.use(
      graphql.query('IsSyncing', (info) => {
        return HttpResponse.json({
          data: {
            me: {
              isSyncing: false,
            },
          },
        })
      }),
      graphql.mutation('SyncData', (info) => {
        mutation(info.variables)

        return HttpResponse.json({
          data: {
            syncWithGitProvider: {
              me: {
                isSyncing: true,
              },
            },
          },
        })
      })
    )

    return { user: userEvent.setup(), mutation, mockSetItem, mockGetItem }
  }

  describe('when rendered with github provider', () => {
    it('renders banner body', () => {
      setup()

      render(<InstallationHelpBanner />, {
        wrapper: wrapper(),
      })

      const body = screen.getByText(/Installed organization/)
      expect(body).toBeInTheDocument()

      const body2 = screen.getByText(
        /t may take a few minutes to appear as a selection/
      )
      expect(body2).toBeInTheDocument()
    })
  })

  describe('when rendered with a different setup action', () => {
    it('renders empty dom', () => {
      setup()

      const { container } = render(<InstallationHelpBanner />, {
        wrapper: wrapper(['/gh?setup_action=request']),
      })

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when user clicks on re-sync', () => {
    it('renders syncing status', async () => {
      const { user, mutation } = setup()

      render(<InstallationHelpBanner />, {
        wrapper: wrapper(),
      })

      const reSync = await screen.findByText(/resyncing/)
      expect(reSync).toBeInTheDocument()

      await user.click(reSync)

      await waitFor(() => expect(mutation).toHaveBeenCalledTimes(1))

      const syncing = await screen.findByText(/syncing/)
      expect(syncing).toBeInTheDocument()
    })
  })

  describe('when rendered with other providers', () => {
    it('does not render banner body', () => {
      setup()

      render(<InstallationHelpBanner />, {
        wrapper: wrapper(['/bb?setup_action=install']),
      })

      const body = screen.queryByText(/Installed organization/)
      expect(body).not.toBeInTheDocument()
    })
  })

  describe('user dismisses banner', () => {
    it('renders dismiss button', async () => {
      setup()

      render(<InstallationHelpBanner />, {
        wrapper: wrapper(),
      })

      const dismissButton = await screen.findByTestId(
        'dismiss-install-help-banner'
      )
      expect(dismissButton).toBeInTheDocument()
    })

    it('calls local storage', async () => {
      const { user, mockGetItem, mockSetItem } = setup()

      mockGetItem.mockReturnValue(null)

      render(<InstallationHelpBanner />, {
        wrapper: wrapper(),
      })

      const dismissButton = await screen.findByTestId(
        'dismiss-install-help-banner'
      )
      expect(dismissButton).toBeInTheDocument()
      await user.click(dismissButton)

      await waitFor(() =>
        expect(mockSetItem).toHaveBeenCalledWith(
          'dismissed-top-banners',
          JSON.stringify({ 'install-help-banner': 'true' })
        )
      )
    })

    it('hides the banner', async () => {
      const { user, mockGetItem } = setup()

      mockGetItem.mockReturnValue(null)

      const { container } = render(<InstallationHelpBanner />, {
        wrapper: wrapper(),
      })

      const dismissButton = await screen.findByTestId(
        'dismiss-install-help-banner'
      )
      expect(dismissButton).toBeInTheDocument()
      await user.click(dismissButton)

      await waitFor(() => expect(container).toBeEmptyDOMElement())
    })
  })
})
