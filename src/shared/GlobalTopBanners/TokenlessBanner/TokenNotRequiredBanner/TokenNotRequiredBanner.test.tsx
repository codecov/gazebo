import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'
import ResizeObserver from 'resize-observer-polyfill'

import { useFlags } from 'shared/featureFlags'

import TokenNotRequiredBanner from './TokenNotRequiredBanner'

vi.mock('shared/featureFlags')
global.ResizeObserver = ResizeObserver
const mockedUseFlags = useFlags as jest.Mock

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const server = setupServer()
beforeAll(() => {
  console.error = () => {}
  server.listen()
})
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov']}>
      <Route path="/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('TokenNotRequiredBanner', () => {
  function setup({
    isAdmin = true,
    orgUploadToken = 'test-mock-org-upload-token',
  }: {
    isAdmin?: boolean
    orgUploadToken?: string | null
  } = {}) {
    mockedUseFlags.mockReturnValue({ tokenlessSection: true })

    server.use(
      graphql.query('GetUploadTokenRequired', () => {
        return HttpResponse.json({
          data: {
            owner: {
              orgUploadToken,
              isAdmin,
              uploadTokenRequired: false,
            },
          },
        })
      })
    )

    return { user: userEvent.setup() }
  }

  describe('when user is admin', () => {
    it('should render content of AdminTokenNotRequiredBanner', async () => {
      setup({ isAdmin: true })
      render(<TokenNotRequiredBanner />, { wrapper })

      const content = await screen.findByText(
        /Your org no longer requires upload tokens./
      )
      expect(content).toBeInTheDocument()
    })

    it('should render link to global upload token settings', async () => {
      setup({ isAdmin: true })
      render(<TokenNotRequiredBanner />, { wrapper })

      const link = await screen.findByRole('link', {
        name: /global upload token settings./,
      })

      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        '/account/gh/codecov/org-upload-token'
      )
    })

    it('should render "the global upload token" copy without tooltip when orgUploadToken is null', async () => {
      setup({ isAdmin: true, orgUploadToken: null })
      render(<TokenNotRequiredBanner />, { wrapper })

      const globalTokenText = await screen.findByText(/the global upload token/)
      expect(globalTokenText).toBeInTheDocument()

      const trigger = screen.queryByTestId(/token-trigger/)
      expect(trigger).not.toBeInTheDocument()
    })
  })

  describe('when user is not admin', () => {
    it('should render content of MemberTokenNotRequiredBanner', async () => {
      setup({ isAdmin: false })
      render(<TokenNotRequiredBanner />, { wrapper })

      const content = await screen.findByText(
        /Your org no longer requires upload tokens./
      )
      expect(content).toBeInTheDocument()
    })

    it('should render reach to admin copy', async () => {
      setup({ isAdmin: false })
      render(<TokenNotRequiredBanner />, { wrapper })

      const copy = await screen.findByText(
        /Contact your admins to manage the global upload token settings./
      )
      expect(copy).toBeInTheDocument()
    })
  })

  it('should render dismiss button', async () => {
    setup()
    render(<TokenNotRequiredBanner />, { wrapper })

    const dismissButton = await screen.findByRole('button', { name: /Dismiss/ })
    expect(dismissButton).toBeInTheDocument()
  })
})
