import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
  useQuery as useQueryV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { CoverageTabDataQueryOpts } from './CoverageTabDataQueryOpts'

const mockCoverageTabData = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          coverageAnalytics: {
            totals: {
              fileCount: 10,
            },
          },
        },
      },
    },
  },
}

const mockNotFoundError = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'NotFoundError',
      message: 'commit not found',
    },
  },
}

const mockOwnerNotActivatedError = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'OwnerNotActivatedError',
      message: 'owner not activated',
    },
  },
}

const mockNullOwner = {
  owner: null,
}

const mockUnsuccessfulParseError = {}

const server = setupServer()
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (
    initialEntries = '/gh/codecov/cool-repo'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProviderV5 client={queryClientV5}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route
          path={[
            '/:provider/:owner/:repo/tree/:branch',
            '/:provider/:owner/:repo',
          ]}
        >
          {children}
        </Route>
      </MemoryRouter>
    </QueryClientProviderV5>
  )

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  isNotFoundError?: boolean
  isOwnerNotActivatedError?: boolean
  isUnsuccessfulParseError?: boolean
  isNullOwner?: boolean
}

describe('CoverageTabDataQueryOpts', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    server.use(
      graphql.query('CoverageTabData', () => {
        if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivatedError })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else if (isNullOwner) {
          return HttpResponse.json({ data: mockNullOwner })
        } else {
          return HttpResponse.json({ data: mockCoverageTabData })
        }
      })
    )
  }

  describe('valid data response', () => {
    it('returns the data for the passed branch', async () => {
      setup({})
      const { result } = renderHook(
        () =>
          useQueryV5(
            CoverageTabDataQueryOpts({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
              branch: 'main',
            })
          ),
        { wrapper: wrapper() }
      )

      await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
      await waitFor(() =>
        expect(result.current.data).toEqual({
          branch: {
            head: {
              coverageAnalytics: {
                totals: {
                  fileCount: 10,
                },
              },
            },
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
            CoverageTabDataQueryOpts({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
              branch: 'main',
            })
          ),
        { wrapper: wrapper() }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'useCoverageTabData - 404 NotFoundError',
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
            CoverageTabDataQueryOpts({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
              branch: 'main',
            })
          ),
        { wrapper: wrapper() }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 403,
            dev: 'useCoverageTabData - 403 OwnerNotActivatedError',
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
            CoverageTabDataQueryOpts({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
              branch: 'main',
            })
          ),
        { wrapper: wrapper() }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'useCoverageTabData - 404 schema parsing failed',
          })
        )
      )
    })
  })
})
