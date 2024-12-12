import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'

import Summary from './Summary'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()
type WrapperClosure = (
  initialEntries?: string[]
) => React.FC<React.PropsWithChildren>

const wrapper: WrapperClosure =
  (initialEntries = ['/gh/codecov/test-repo/pull/1']) =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Route path={['/:provider/:owner/:repo/pull/:pullId']}>
          <Suspense fallback={'loading'}>{children}</Suspense>
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

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

interface SetupOptions {
  tierValue?: (typeof TierNames)[keyof typeof TierNames]
  privateRepo?: boolean
}
describe('Summary', () => {
  function setup(
    { tierValue = TierNames.BASIC, privateRepo = false }: SetupOptions = {
      tierValue: TierNames.BASIC,
      privateRepo: false,
    }
  ) {
    server.use(
      graphql.query('OwnerTier', () => {
        return HttpResponse.json({
          data: {
            owner: { plan: { tierName: tierValue.toLowerCase() } },
          },
        })
      }),
      graphql.query('GetRepoSettingsTeam', () => {
        return HttpResponse.json({
          data: {
            owner: {
              isCurrentUserPartOfOrg: true,
              repository: {
                __typename: 'Repository',
                defaultBranch: 'master',
                private: privateRepo,
                uploadToken: 'token',
                graphToken: 'token',
                yaml: 'yaml',
                bot: {
                  username: 'test',
                },
                activated: true,
              },
            },
          },
        })
      })
    )
  }
  describe.each`
    tierValue          | privateRepo
    ${TierNames.BASIC} | ${true}
    ${TierNames.BASIC} | ${false}
    ${TierNames.TEAM}  | ${false}
  `('renders the normal summary', ({ tierValue, privateRepo }) => {
    it(`tierValue: ${tierValue}, privateRepo: ${privateRepo}`, async () => {
      setup({ tierValue, privateRepo })
      render(<Summary />, { wrapper: wrapper() })

      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )

      const head = await screen.findByText('HEAD')
      expect(head).toBeInTheDocument()

      const patch = await screen.findByText('Patch')
      expect(patch).toBeInTheDocument()

      const coverage = await screen.findByText('Coverage data is unknown')
      expect(coverage).toBeInTheDocument()
    })
  })

  it('renders the team summary', async () => {
    setup({
      tierValue: TierNames.TEAM,
      privateRepo: true,
    })
    render(<Summary />, { wrapper: wrapper() })

    await waitFor(() =>
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
    )

    const head = screen.queryByText('HEAD')
    expect(head).not.toBeInTheDocument()

    const patch = screen.queryByText('Patch')
    expect(patch).not.toBeInTheDocument()

    const coverage = screen.queryByText('Coverage data is unknown')
    expect(coverage).not.toBeInTheDocument()
  })
})
