import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import ActivationRequiredSelfHosted from './ActivationRequiredSelfHosted'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const server = setupServer()

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
  console.error = () => {}
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
  vi.clearAllMocks()
})

afterAll(() => {
  server.close()
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/gazebo/new']}>
      <Route path="/:provider/:owner/:repo/new">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('ActivationRequiredSelfHosted', () => {
  function setup(isAdmin: boolean) {
    server.use(
      http.get('/internal/users/current', (info) =>
        HttpResponse.json({
          isAdmin,
          email: 'user@example.com',
          name: 'Test User',
          ownerid: 1,
          username: 'testuser',
          activated: true,
        })
      )
    )
  }
  it('renders the banner with correct content', async () => {
    setup(false)
    render(<ActivationRequiredSelfHosted />, { wrapper })

    const bannerHeading = await screen.findByRole('heading', {
      name: /Activation Required/,
    })
    expect(bannerHeading).toBeInTheDocument()

    const description = await screen.findByText(
      /You have available seats, but activation is needed./
    )
    expect(description).toBeInTheDocument()
  })

  it('renders contact admin copy if not admin', async () => {
    setup(false)
    render(<ActivationRequiredSelfHosted />, { wrapper })

    const contactAdminCopy = await screen.findByText(
      /Contact your admin for activation./
    )
    expect(contactAdminCopy).toBeInTheDocument()
  })

  it('does not render manage members link if not admin', async () => {
    setup(false)
    render(<ActivationRequiredSelfHosted />, { wrapper })

    await waitFor(() => queryClient.isFetching)
    await waitFor(() => !queryClient.isFetching)

    const manageMembersLink = screen.queryByRole('link', {
      name: /Manage members/,
    })
    expect(manageMembersLink).not.toBeInTheDocument()
  })

  describe('when admin', () => {
    it('renders manage members link', async () => {
      setup(true)
      render(<ActivationRequiredSelfHosted />, { wrapper })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const manageMembersLink = await screen.findByRole('link', {
        name: /Manage members/,
      })
      expect(manageMembersLink).toBeInTheDocument()
      expect(manageMembersLink).toHaveAttribute('href', '/admin/gh/access')
    })
  })
})
