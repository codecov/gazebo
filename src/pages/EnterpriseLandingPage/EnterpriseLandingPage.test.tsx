import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { ThemeContextProvider } from 'shared/ThemeContext'

import EnterpriseLandingPage from './EnterpriseLandingPage'

vi.mock('config')
window.matchMedia = vi.fn().mockResolvedValue({ matches: false })

const server = setupServer()
const queryClient = new QueryClient()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <ThemeContextProvider>
      <MemoryRouter initialEntries={['/']}>
        <Route path="/">{children}</Route>
      </MemoryRouter>
    </ThemeContextProvider>
  </QueryClientProvider>
)

const mockServiceProviders = {
  config: {
    loginProviders: [
      'GITHUB',
      'GITHUB_ENTERPRISE',
      'GITLAB',
      'GITLAB_ENTERPRISE',
      'BITBUCKET',
      'BITBUCKET_SERVER',
      'OKTA',
    ],
  },
}

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  vi.clearAllMocks()
  server.close()
})

interface SetupArgs {
  sendProviders: boolean
}

describe('EnterpriseLandingPage', () => {
  function setup(
    { sendProviders = true }: SetupArgs = { sendProviders: true }
  ) {
    server.use(
      graphql.query('GetLoginProviders', (info) => {
        if (sendProviders) {
          return HttpResponse.json({ data: mockServiceProviders })
        }

        return HttpResponse.json({ data: { config: { loginProviders: [] } } })
      }),
      graphql.query('EnterpriseLandingPageUser', (info) => {
        return HttpResponse.json({ data: { me: undefined } })
      })
    )
  }

  describe('when systems are configured', () => {
    beforeEach(() => {
      setup()
    })

    it('displays github card', async () => {
      render(<EnterpriseLandingPage />, { wrapper })

      const element = await screen.findByRole('heading', { name: 'GitHub' })
      expect(element).toBeInTheDocument()
    })

    it('displays gitlab card', async () => {
      render(<EnterpriseLandingPage />, { wrapper })

      const element = await screen.findByRole('heading', { name: 'GitLab' })
      expect(element).toBeInTheDocument()
    })

    it('displays bitbucket card', async () => {
      render(<EnterpriseLandingPage />, { wrapper })

      const element = await screen.findByRole('heading', { name: 'Bitbucket' })
      expect(element).toBeInTheDocument()
    })

    it('displays okta card', async () => {
      render(<EnterpriseLandingPage />, { wrapper })

      const element = await screen.findByRole('heading', { name: 'Okta' })
      expect(element).toBeInTheDocument()
    })
  })

  describe('when no systems are configured', () => {
    beforeEach(() => {
      setup({ sendProviders: false })
    })

    it('displays github login button', () => {
      render(<EnterpriseLandingPage />, { wrapper })

      expect(screen.queryByText('GitHub')).toBeNull()
    })

    it('displays gitlab button', () => {
      render(<EnterpriseLandingPage />, { wrapper })

      expect(screen.queryByText('GitLab')).toBeNull()
    })

    it('displays bitbucket button', () => {
      render(<EnterpriseLandingPage />, { wrapper })

      expect(screen.queryByText('Bitbucket')).toBeNull()
    })
  })
})
