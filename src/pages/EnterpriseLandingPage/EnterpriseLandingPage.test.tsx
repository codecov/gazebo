import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { ThemeContextProvider } from 'shared/ThemeContext'

import EnterpriseLandingPage from './EnterpriseLandingPage'

vi.mock('config')

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <QueryClientProvider client={queryClient}>
      <ThemeContextProvider>
        <MemoryRouter initialEntries={['/']}>
          <Route path="/">{children}</Route>
        </MemoryRouter>
      </ThemeContextProvider>
    </QueryClientProvider>
  </QueryClientProviderV5>
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
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
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
      graphql.query('GetLoginProviders', () => {
        if (sendProviders) {
          return HttpResponse.json({ data: mockServiceProviders })
        }

        return HttpResponse.json({ data: { config: { loginProviders: [] } } })
      }),
      graphql.query('EnterpriseLandingPageUser', () => {
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
