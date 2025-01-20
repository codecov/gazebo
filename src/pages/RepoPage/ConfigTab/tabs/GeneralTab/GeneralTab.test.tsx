import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import GeneralTab from './GeneralTab'

vi.mock('./Tokens/TokensTeam', () => ({
  default: () => 'Tokens Team Component',
}))
vi.mock('./Tokens/Tokens', () => ({
  default: () => 'Tokens Component',
}))
vi.mock('./DangerZone', () => ({
  default: () => 'DangerZone Component',
}))
vi.mock('./DefaultBranch', () => ({
  default: () => 'Default Branch',
}))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/gh/codecov/codecov-client/config']}>
        <Route path="/:provider/:owner/:repo/config">
          <Suspense fallback={<p>Loading</p>}>{children}</Suspense>
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  </QueryClientProviderV5>
)

const server = setupServer()
beforeAll(() => {
  server.listen()
  console.error = () => {}
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
  hasDefaultBranch?: boolean
  isTeamPlan?: boolean
  isPrivate?: boolean
}

describe('GeneralTab', () => {
  function setup(
    {
      hasDefaultBranch = false,
      isTeamPlan = false,
      isPrivate = false,
    }: SetupArgs = {
      hasDefaultBranch: false,
      isTeamPlan: false,
      isPrivate: false,
    }
  ) {
    server.use(
      graphql.query('RepoDataTokensTeam', () => {
        if (hasDefaultBranch) {
          return HttpResponse.json({
            data: {
              owner: {
                repository: {
                  __typename: 'Repository',
                  defaultBranch: 'main',
                  private: isPrivate,
                },
              },
            },
          })
        }
        return HttpResponse.json({
          data: {
            owner: {
              repository: {
                __typename: 'Repository',
                defaultBranch: null,
                private: isPrivate,
              },
            },
          },
        })
      }),
      graphql.query('IsTeamPlan', () => {
        return HttpResponse.json({
          data: { owner: { plan: { isTeamPlan } } },
        })
      })
    )
  }

  describe('when rendered', () => {
    describe('when rendered with defaultBranch', () => {
      beforeEach(() => {
        setup({ hasDefaultBranch: true })
      })

      it('renders Default Branch component', async () => {
        render(<GeneralTab />, { wrapper })

        const title = await screen.findByText(/Default Branch/)
        expect(title).toBeInTheDocument()
      })
    })

    describe('when rendered with no defaultBranch', () => {
      beforeEach(() => {
        setup({ hasDefaultBranch: false })
      })

      it('does not render  Default Branch component', () => {
        render(<GeneralTab />, { wrapper })

        const title = screen.queryByText(/Default Branch/)
        expect(title).not.toBeInTheDocument()
      })
    })

    it('render tokens component', async () => {
      setup({ isTeamPlan: true })
      render(<GeneralTab />, { wrapper })

      const tokensComponent = await screen.findByText(/Tokens Component/)
      expect(tokensComponent).toBeInTheDocument()
    })

    it('render danger zone component', async () => {
      setup({ isTeamPlan: true })
      render(<GeneralTab />, { wrapper })

      const tokensComponent = await screen.findByText(/DangerZone Component/)
      expect(tokensComponent).toBeInTheDocument()
    })
  })

  describe('when rendered with team plan', () => {
    describe('when the repository is private', () => {
      beforeEach(() => {
        setup({ isTeamPlan: true, isPrivate: true })
      })

      it('render tokens team component', async () => {
        render(<GeneralTab />, { wrapper })

        const tokensComponent = await screen.findByText(/Tokens Team Component/)
        expect(tokensComponent).toBeInTheDocument()
      })

      it('render danger zone component', async () => {
        render(<GeneralTab />, { wrapper })

        const tokensComponent = await screen.findByText(/DangerZone Component/)
        expect(tokensComponent).toBeInTheDocument()
      })
    })

    describe('when the repository is public', () => {
      beforeEach(() => {
        setup({ isTeamPlan: true, isPrivate: false })
      })

      it('render tokens component', async () => {
        render(<GeneralTab />, { wrapper })

        const tokensComponent = await screen.findByText(/Tokens Component/)
        expect(tokensComponent).toBeInTheDocument()
      })

      it('render danger zone component', async () => {
        render(<GeneralTab />, { wrapper })

        const tokensComponent = await screen.findByText(/DangerZone Component/)
        expect(tokensComponent).toBeInTheDocument()
      })
    })
  })
})
