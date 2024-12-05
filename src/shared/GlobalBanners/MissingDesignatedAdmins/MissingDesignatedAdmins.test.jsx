import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import MissingDesignatedAdmins from './MissingDesignatedAdmins'

vi.mock('config')

const mockApiSelfHostedSetUpCorrectly = { config: { hasAdmins: true } }
const mockApiSelfHostedSetUpIncorrectly = { config: { hasAdmins: false } }
const mockApiCloud = { config: undefined }

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const server = setupServer()
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

const wrapper =
  (initialEntries = ['/gh/test-org/test-repo/pull/12']) =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

describe('MissingDesignatedAdmins', () => {
  function setup(overrideData) {
    server.use(
      graphql.query('HasAdmins', () => {
        if (overrideData) {
          return HttpResponse.json({ data: overrideData })
        }

        return HttpResponse.json({ data: mockApiSelfHostedSetUpCorrectly })
      })
    )
  }

  describe('cloud mode', () => {
    beforeEach(() => {
      config.IS_SELF_HOSTED = false
      setup(mockApiCloud)
    })

    afterEach(() => {
      vi.resetAllMocks()
    })

    it('does not render when there is no provider', () => {
      render(<MissingDesignatedAdmins />, { wrapper: wrapper(['']) })

      const bannerHeader = screen.queryByText(/Missing designated admins/)
      expect(bannerHeader).not.toBeInTheDocument()
    })

    it('does not render the banner when a provider is present', () => {
      render(<MissingDesignatedAdmins />, { wrapper: wrapper() })

      const bannerHeader = screen.queryByText(/Missing designated admins/)
      expect(bannerHeader).not.toBeInTheDocument()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })
  })

  describe('self hosted mode with no admins', () => {
    beforeEach(() => {
      config.IS_SELF_HOSTED = true
      setup(mockApiSelfHostedSetUpIncorrectly)
    })

    afterEach(() => {
      vi.resetAllMocks()
    })

    it('does not render when there is no provider', () => {
      render(<MissingDesignatedAdmins />, { wrapper: wrapper(['']) })

      const bannerHeader = screen.queryByText(/Missing designated admins/)
      expect(bannerHeader).not.toBeInTheDocument()
    })

    it('renders the banner when a provider is present', async () => {
      render(<MissingDesignatedAdmins />, { wrapper: wrapper() })

      const bannerHeader = await screen.findByText(/Missing designated admins/)
      expect(bannerHeader).toBeInTheDocument()
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        'https://docs.codecov.com/v5.0/docs/configuration#instance-wide-admins'
      )
    })
  })

  describe('self hosted mode with admins setup', () => {
    beforeEach(() => {
      config.IS_SELF_HOSTED = true
      setup(mockApiSelfHostedSetUpCorrectly)
    })

    afterEach(() => {
      vi.resetAllMocks()
    })

    it('does not render when there is no provider', () => {
      render(<MissingDesignatedAdmins />, { wrapper: wrapper(['']) })

      const bannerHeader = screen.queryByText(/Missing designated admins/)
      expect(bannerHeader).not.toBeInTheDocument()
    })

    it('does not render the banner when a provider is present', () => {
      render(<MissingDesignatedAdmins />, { wrapper: wrapper() })

      const bannerHeader = screen.queryByText(/Missing designated admins/)
      expect(bannerHeader).not.toBeInTheDocument()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })
  })
})
