import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'
import { useFlags as useFlagsOriginal } from 'shared/featureFlags'

import Summary from './Summary'

const useFlags = useFlagsOriginal as jest.MockedFunction<
  typeof useFlagsOriginal
>

jest.mock('shared/featureFlags')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()
type WrapperClosure = (
  initialEntries?: string[]
) => React.FC<React.PropsWithChildren>

const wrapper: WrapperClosure =
  (initialEntries = ['/gh/codecov/test-repo/pull/1']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path={['/:provider/:owner/:repo/pull/:pullId']}>
            {children}
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
  multipleTiers?: boolean
  tierValue?: (typeof TierNames)[keyof typeof TierNames]
  privateRepo?: boolean
}
describe('Summary', () => {
  function setup(
    {
      multipleTiers = false,
      tierValue = TierNames.BASIC,
      privateRepo = false,
    }: SetupOptions = {
      multipleTiers: false,
      tierValue: TierNames.BASIC,
      privateRepo: false,
    }
  ) {
    useFlags.mockReturnValue({
      multipleTiers,
    })
    server.use(
      graphql.query('OwnerTier', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: { plan: { tierName: tierValue.toLowerCase() } },
          })
        )
      ),
      graphql.query('GetRepoSettings', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: { repository: { private: privateRepo } },
          })
        )
      )
    )
  }
  describe.each`
    multipleTiers | tierValue          | privateRepo
    ${true}       | ${TierNames.BASIC} | ${true}
    ${true}       | ${TierNames.BASIC} | ${false}
    ${true}       | ${TierNames.TEAM}  | ${false}
    ${false}      | ${TierNames.BASIC} | ${true}
    ${false}      | ${TierNames.BASIC} | ${false}
    ${false}      | ${TierNames.TEAM}  | ${true}
    ${false}      | ${TierNames.TEAM}  | ${false}
  `(
    'renders the normal summary',
    ({ multipleTiers, tierValue, privateRepo }) => {
      it(`multipleTiers: ${multipleTiers}, tierValue: ${tierValue}, privateRepo: ${privateRepo}`, async () => {
        setup()
        render(<Summary />, { wrapper: wrapper() })

        await waitFor(() => queryClient.isFetching())
        await waitFor(() => !queryClient.isFetching())

        const head = await screen.findByText('HEAD')
        expect(head).toBeInTheDocument()

        const patch = await screen.findByText('Patch')
        expect(patch).toBeInTheDocument()

        const coverage = await screen.findByText('Coverage data is unknown')
        expect(coverage).toBeInTheDocument()
      })
    }
  )

  it('renders the team summary', async () => {
    setup({
      multipleTiers: true,
      tierValue: TierNames.TEAM,
      privateRepo: true,
    })
    render(<Summary />, { wrapper: wrapper() })

    await waitFor(() => queryClient.isFetching())
    await waitFor(() => !queryClient.isFetching())

    const head = screen.queryByText('HEAD')
    expect(head).not.toBeInTheDocument()

    const patch = screen.queryByText('Patch')
    expect(patch).not.toBeInTheDocument()

    const coverage = screen.queryByText('Coverage data is unknown')
    expect(coverage).not.toBeInTheDocument()
  })
})
