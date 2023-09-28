import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import EnterpriseLandingPage from './EnterpriseLandingPage'

jest.mock('config')

const server = setupServer()
const queryClient = new QueryClient()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/']}>
      <Route path="/">{children}</Route>
    </MemoryRouter>
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
      graphql.query('GetServiceProviders', (req, res, ctx) => {
        if (sendProviders) {
          return res(ctx.status(200), ctx.data(mockServiceProviders))
        }

        return res(
          ctx.status(200),
          ctx.data({ config: { loginProviders: [] } })
        )
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
