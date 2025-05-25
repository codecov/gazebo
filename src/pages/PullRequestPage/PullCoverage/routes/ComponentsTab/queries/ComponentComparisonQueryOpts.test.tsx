import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
  useQuery as useQueryV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { ComponentComparisonQueryOpts } from './ComponentComparisonQueryOpts'

const mockResponse = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        compareWithBase: {
          __typename: 'Comparison',
          componentComparisons: [
            {
              name: 'test-component',
              patchTotals: { percentCovered: 31.46 },
              headTotals: { percentCovered: 71.46 },
              baseTotals: { percentCovered: 51.46 },
            },
          ],
        },
        head: { branchName: 'abc' },
      },
    },
  },
}

const mockNotFoundError = {
  owner: {
    repository: {
      __typename: 'NotFoundError',
      message: 'commit not found',
    },
  },
}

const mockOwnerNotActivatedError = {
  owner: {
    repository: {
      __typename: 'OwnerNotActivatedError',
      message: 'owner not activated',
    },
  },
}

const mockUnsuccessfulParseError = {}

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <MemoryRouter
      initialEntries={['/gh/test-org/test-repo/pull/123/components']}
    >
      <Route path="/:provider/:owner/:repo/pull/:pullId/components">
        {children}
      </Route>
    </MemoryRouter>
  </QueryClientProviderV5>
)

const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClientV5.clear()
})
afterAll(() => server.close())

interface SetupArgs {
  isNotFoundError?: boolean
  isOwnerNotActivatedError?: boolean
  isUnsuccessfulParseError?: boolean
}

describe('useComponentComparison', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
  }: SetupArgs) {
    const componentsMock = vi.fn()

    server.use(
      graphql.query('PullComponentComparison', (info) => {
        if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivatedError })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else {
          if (info.variables?.filters?.components) {
            componentsMock(info.variables.filters.components)
          }

          return HttpResponse.json({ data: mockResponse })
        }
      })
    )

    return { componentsMock }
  }

  describe('when called', () => {
    describe('repository typename of Repository', () => {
      it('returns data for the owner page', async () => {
        setup({})

        const { result } = renderHook(
          () =>
            useQueryV5(
              ComponentComparisonQueryOpts({
                provider: 'gh',
                owner: 'test-org',
                repo: 'test-repo',
                pullId: '123',
              })
            ),
          { wrapper }
        )

        await waitFor(() =>
          expect(result.current.data).toStrictEqual({
            pull: {
              compareWithBase: {
                __typename: 'Comparison',
                componentComparisons: [
                  {
                    name: 'test-component',
                    patchTotals: { percentCovered: 31.46 },
                    headTotals: { percentCovered: 71.46 },
                    baseTotals: { percentCovered: 51.46 },
                  },
                ],
              },
              head: { branchName: 'abc' },
            },
          })
        )
      })
    })

    describe('returns NotFoundError __typename', () => {
      const oldConsoleError = console.error

      beforeEach(() => {
        console.error = () => null
      })

      afterEach(() => {
        console.error = oldConsoleError
      })

      it('throws a 404', async () => {
        setup({ isNotFoundError: true })
        const { result } = renderHook(
          () =>
            useQueryV5(
              ComponentComparisonQueryOpts({
                provider: 'gh',
                owner: 'test-org',
                repo: 'test-repo',
                pullId: '123',
              })
            ),
          { wrapper }
        )

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 404,
            })
          )
        )
      })
    })

    describe('returns OwnerNotActivatedError __typename', () => {
      const oldConsoleError = console.error

      beforeEach(() => {
        console.error = () => null
      })

      afterEach(() => {
        console.error = oldConsoleError
      })

      it('throws a 403', async () => {
        setup({ isOwnerNotActivatedError: true })
        const { result } = renderHook(
          () =>
            useQueryV5(
              ComponentComparisonQueryOpts({
                provider: 'gh',
                owner: 'test-org',
                repo: 'test-repo',
                pullId: '123',
              })
            ),
          { wrapper }
        )

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 403,
            })
          )
        )
      })
    })

    describe('unsuccessful parse of zod schema', () => {
      const oldConsoleError = console.error

      beforeEach(() => {
        console.error = () => null
      })

      afterEach(() => {
        console.error = oldConsoleError
      })

      it('throws a 404', async () => {
        setup({ isUnsuccessfulParseError: true })
        const { result } = renderHook(
          () =>
            useQueryV5(
              ComponentComparisonQueryOpts({
                provider: 'gh',
                owner: 'test-org',
                repo: 'test-repo',
                pullId: '123',
              })
            ),
          { wrapper }
        )

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              dev: 'ComponentComparisonQueryOpts - Parsing Error',
              status: 400,
            })
          )
        )
      })
    })
  })

  describe('when called with filters', () => {
    it('sends filters to API', async () => {
      const { componentsMock } = setup({})
      const componentsFilter = ['component1', 'component2']

      const { result } = renderHook(
        () =>
          useQueryV5(
            ComponentComparisonQueryOpts({
              provider: 'gh',
              owner: 'test-org',
              repo: 'test-repo',
              pullId: '123',
              filters: {
                components: componentsFilter,
              },
            })
          ),
        { wrapper }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() => expect(componentsMock).toHaveBeenCalledTimes(1))
      await waitFor(() =>
        expect(componentsMock).toHaveBeenCalledWith(componentsFilter)
      )
    })
  })
})
