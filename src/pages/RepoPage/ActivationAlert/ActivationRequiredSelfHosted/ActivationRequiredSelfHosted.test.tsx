import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { vi } from 'vitest'

import ActivationRequiredSelfHosted from './ActivationRequiredSelfHosted'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      suspense: false,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/gazebo/new']}>
      <Route path="/:provider/:owner/:repo/new">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

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

  it('renders the banner with correct heading', async () => {
    setup(false)
    render(<ActivationRequiredSelfHosted />, { wrapper })

    const bannerHeading = await screen.findByRole('heading', {
      name: /Activation Required/,
    })
    expect(bannerHeading).toBeInTheDocument()
  })

  it('renders the banner with correct description', async () => {
    setup(false)
    render(<ActivationRequiredSelfHosted />, { wrapper })

    const description = await screen.findByText(
      /You have available seats, but activation is needed./
    )
    expect(description).toBeInTheDocument()
  })

  it('renders copy for the user', async () => {
    setup(false)
    render(<ActivationRequiredSelfHosted />, { wrapper })

    const copy = await screen.findByText(/Contact your admin for activation./)
    expect(copy).toBeInTheDocument()
  })

  it('does not render the link if the user is not an admin', async () => {
    setup(false)
    render(<ActivationRequiredSelfHosted />, { wrapper })

    await waitFor(() => queryClient.isFetching)
    await waitFor(() => !queryClient.isFetching)

    const link = screen.queryByRole('link', {
      name: /Manage members/,
    })
    expect(link).not.toBeInTheDocument()
  })

  it('renders the correct img', async () => {
    setup(false)
    render(<ActivationRequiredSelfHosted />, { wrapper })

    const img = await screen.findByAltText('Forbidden')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute(
      'src',
      '/src/layouts/shared/NetworkErrorBoundary/assets/error-upsidedown-umbrella.svg'
    )
  })

  describe('when the user is an admin', () => {
    it('renders the correct link', async () => {
      setup(true)
      render(<ActivationRequiredSelfHosted />, { wrapper })

      const link = await screen.findByRole('link', {
        name: /Manage members/,
      })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/admin/gh/access')
    })
  })
})
