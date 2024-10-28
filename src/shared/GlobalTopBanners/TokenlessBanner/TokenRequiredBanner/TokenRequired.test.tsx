import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import ResizeObserver from 'resize-observer-polyfill'

import TokenRequiredBanner from './TokenRequiredBanner'

const mocks = vi.hoisted(() => ({
  useFlags: vi.fn(),
}))

vi.mock('shared/featureFlags', () => ({
  useFlags: mocks.useFlags,
}))

global.ResizeObserver = ResizeObserver

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

describe('TokenRequiredBanner', () => {
  function setup({
    isAdmin = true,
    orgUploadToken = 'mock-token',
  }: {
    isAdmin?: boolean
    orgUploadToken?: string | null
  } = {}) {
    mocks.useFlags.mockReturnValue({ tokenlessSection: true })

    server.use(
      graphql.query('GetUploadTokenRequired', () => {
        return HttpResponse.json({
          data: {
            owner: {
              orgUploadToken,
              isAdmin,
              uploadTokenRequired: true,
            },
          },
        })
      })
    )

    return { user: userEvent.setup() }
  }

  describe('when user is admin', () => {
    it('should render content of AdminTokenRequiredBanner', async () => {
      setup({ isAdmin: true })
      render(<TokenRequiredBanner />, { wrapper })

      const content = await screen.findByText(
        /You must now upload using a token./
      )
      expect(content).toBeInTheDocument()
    })

    it('should return token copy without tooltip if token is not provided', async () => {
      setup({ orgUploadToken: null })
      render(<TokenRequiredBanner />, { wrapper })

      const token = await screen.findByText(/the global upload token/)
      expect(token).toBeInTheDocument()
    })

    it('should render token tooltip', async () => {
      setup({ isAdmin: true })
      render(<TokenRequiredBanner />, { wrapper })

      const trigger = await screen.findByTestId(/token-trigger/)
      expect(trigger).toBeInTheDocument()
    })

    it('should render global upload token copy without tooltip if token is not provided', async () => {
      setup({ isAdmin: true, orgUploadToken: null })
      render(<TokenRequiredBanner />, { wrapper })

      const token = await screen.findByText(/the global upload token/)
      expect(token).toBeInTheDocument()

      const trigger = screen.queryByTestId(/token-trigger/)
      expect(trigger).not.toBeInTheDocument()
    })

    it('should render link to global upload token settings', async () => {
      setup({ isAdmin: true })
      render(<TokenRequiredBanner />, { wrapper })

      const link = await screen.findByRole('link', {
        name: /global upload token settings./,
      })

      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        '/account/gh/codecov/org-upload-token'
      )
    })
  })

  describe('when user is not admin', () => {
    it('should render content of MemberTokenRequiredBanner', async () => {
      setup({ isAdmin: false })
      render(<TokenRequiredBanner />, { wrapper })

      const content = await screen.findByText(
        /You must now upload using a token./
      )
      expect(content).toBeInTheDocument()
    })

    it('should return token copy without tooltip if token is not provided', async () => {
      setup({ isAdmin: false, orgUploadToken: null })
      render(<TokenRequiredBanner />, { wrapper })

      const token = await screen.findByText(/the global upload token/)
      expect(token).toBeInTheDocument()
    })

    it('should render token tooltip', async () => {
      setup({ isAdmin: false })
      render(<TokenRequiredBanner />, { wrapper })

      const trigger = await screen.findByTestId(/token-trigger/)
      expect(trigger).toBeInTheDocument()
    })

    it('should render reach to admin copy', async () => {
      setup({ isAdmin: false })
      render(<TokenRequiredBanner />, { wrapper })

      const copy = await screen.findByText(
        /Contact your admins to manage the upload token settings./
      )
      expect(copy).toBeInTheDocument()
    })
  })

  describe('org upload token tooltip', () => {
    it('should render the tooltip', async () => {
      setup()
      render(<TokenRequiredBanner />, { wrapper })

      const tooltip = await screen.findByText(/the global upload token/)
      expect(tooltip).toBeInTheDocument()
    })

    it('should render the content of the tooltip on hover', async () => {
      const { user } = setup()
      render(<TokenRequiredBanner />, { wrapper })

      await waitFor(() => screen.findByTestId(/token-trigger/))
      const trigger = screen.getByTestId(/token-trigger/)
      await user.hover(trigger)

      const tooltip = await screen.findByRole('tooltip')
      const tooltipContent = within(tooltip).getByText(/mock-token/)
      expect(tooltipContent).toBeInTheDocument()
    })

    it('should be rendered with eye off icon', async () => {
      const { user } = setup()
      render(<TokenRequiredBanner />, { wrapper })

      await waitFor(() => screen.findByTestId(/token-trigger/))
      const trigger = screen.getByTestId(/token-trigger/)
      await user.hover(trigger)

      const tooltip = await screen.findByRole('tooltip')
      const eyeIcon = within(tooltip).getByTestId('hide-token')
      expect(eyeIcon).toBeInTheDocument()
    })

    it('switches to eye on icon on click', async () => {
      const { user } = setup()
      render(<TokenRequiredBanner />, { wrapper })

      await waitFor(() => screen.findByTestId(/token-trigger/))
      const trigger = screen.getByTestId(/token-trigger/)
      await user.hover(trigger)

      const tooltip = await screen.findByRole('tooltip')
      const eyeIcon = within(tooltip).getByTestId('hide-token')
      expect(eyeIcon).toBeInTheDocument()

      await user.click(eyeIcon)

      const eyeOnIcon = within(tooltip).getByTestId('show-token')
      expect(eyeOnIcon).toBeInTheDocument()
    })

    it('renders encoded token on eye icon click', async () => {
      const { user } = setup()
      render(<TokenRequiredBanner />, { wrapper })

      await waitFor(() => screen.findByTestId(/token-trigger/))
      const trigger = screen.getByTestId(/token-trigger/)
      await user.hover(trigger)

      const tooltip = await screen.findByRole('tooltip')
      const eyeIcon = within(tooltip).getByTestId('hide-token')
      expect(eyeIcon).toBeInTheDocument()

      await user.click(eyeIcon)

      const encodedToken = await screen.findByText(/xxxx-xxxxx/, {
        selector: '[role="tooltip"] div',
      })
      expect(encodedToken).toBeInTheDocument()
    })

    it('renders copy token to clipboard', async () => {
      const { user } = setup()
      render(<TokenRequiredBanner />, { wrapper })

      await waitFor(() => screen.findByTestId(/token-trigger/))
      const trigger = screen.getByTestId(/token-trigger/)
      await user.hover(trigger)

      const tooltip = await screen.findByRole('tooltip')
      const copyButton = within(tooltip).getByTestId('clipboard-copy-token')
      expect(copyButton).toBeInTheDocument()
    })
  })
})
