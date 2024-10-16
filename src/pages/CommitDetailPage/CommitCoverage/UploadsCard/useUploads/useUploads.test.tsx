import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse, RequestHandler } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import {
  commitEmptyUploads,
  commitErrored,
  commitOneCarriedForward,
  commitOnePending,
  compareTotalsEmpty,
} from 'services/commit/mocks'
import { TierNames, TTierNames } from 'services/tier'

import { useUploads } from './useUploads'

const mockOverview = {
  owner: {
    isCurrentUserActivated: true,
    repository: {
      __typename: 'Repository',
      private: true,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      languages: ['typescript'],
      testAnalyticsEnabled: false,
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/test/test-repo/1234']}>
    <Route path="/:provider/:owner/:repo/:commit">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useUploads', () => {
  function setup(query: RequestHandler, tierValue: TTierNames = TierNames.PRO) {
    server.use(query, compareTotalsEmpty)

    server.use(
      graphql.query('OwnerTier', (info) => {
        return HttpResponse.json({
          data: {
            owner: { plan: { tierName: tierValue } },
          },
        })
      }),
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({ data: mockOverview })
      })
    )
  }

  describe('empty uploads', () => {
    beforeEach(() => {
      setup(commitEmptyUploads)
    })

    afterEach(() => {
      server.resetHandlers()
    })

    describe('when data is loaded', () => {
      it('returns groupedUploads', () => {
        const { result } = renderHook(() => useUploads({}), {
          wrapper,
        })

        expect(result.current.groupedUploads).toMatchObject({})
      })

      it('returns a uploadsProviderList', () => {
        const { result } = renderHook(() => useUploads({}), {
          wrapper,
        })

        expect(result.current.uploadsProviderList).toEqual([])
      })

      it('returns a hasNoUploads', () => {
        const { result } = renderHook(() => useUploads({}), {
          wrapper,
        })

        expect(result.current.hasNoUploads).toEqual(true)
      })
    })
  })

  describe('mix of upload states', () => {
    beforeEach(() => {
      setup(commitErrored)
    })

    afterEach(() => {
      server.resetHandlers()
    })

    describe('when data is loaded', () => {
      it('returns uploadsOverview', async () => {
        const { result } = renderHook(() => useUploads({}), {
          wrapper,
        })

        const initUploadsOverview = result.current.uploadsOverview

        await waitFor(() =>
          expect(initUploadsOverview).not.toBe(result.current.uploadsOverview)
        )

        expect(result.current.uploadsOverview).toEqual(
          '3 started, 2 errored, 1 successful'
        )
      })

      it('returns groupedUploads', async () => {
        const { result } = renderHook(() => useUploads({}), {
          wrapper,
        })

        const initgroupedUploads = result.current.groupedUploads

        await waitFor(() =>
          expect(initgroupedUploads).not.toMatchObject(
            result.current.groupedUploads
          )
        )

        expect(result.current.groupedUploads).toMatchObject({
          'github actions': [
            {
              createdAt: '2020-08-25T16:36:25.820340+00:00',
              errors: [],
              flags: ['front-end'],
              jobCode: '1234',
              provider: 'github actions',
              state: 'PROCESSED',
              updatedAt: '2020-08-25T16:36:25.859889+00:00',
              uploadType: 'UPLOADED',
            },
            {
              buildCode: '1234',
              ciUrl: 'https://example.com',
              createdAt: '2020-08-25T16:36:19.559474+00:00',
              downloadUrl: '/test.txt',
              errors: [
                {
                  errorCode: 'FILE_NOT_IN_STORAGE',
                },
                {
                  errorCode: 'REPORT_EXPIRED',
                },
                {
                  errorCode: 'REPORT_EMPTY',
                },
              ],
              jobCode: '1234',
              provider: 'github actions',
              state: 'ERROR',
              updatedAt: '2020-08-25T16:36:19.679868+00:00',
              uploadType: 'UPLOADED',
            },
          ],
          travis: [
            {
              buildCode: '1234',
              createdAt: '2020-08-25T16:36:19.559474+00:00',
              downloadUrl: '/test.txt',
              errors: [],
              flags: ['backend', 'front-end'],
              jobCode: '1234',
              provider: 'travis',
              state: 'STARTED',
              updatedAt: '2020-08-25T16:36:19.679868+00:00',
              uploadType: 'UPLOADED',
            },
            {
              buildCode: '1234',
              createdAt: '2020-08-25T16:36:19.559474+00:00',
              downloadUrl: '/test.txt',
              errors: [],
              flags: ['backend', 'front-end'],
              jobCode: '1234',
              provider: 'travis',
              state: 'STARTED',
              updatedAt: '2020-08-25T16:36:19.679868+00:00',
              uploadType: 'UPLOADED',
            },
            {
              buildCode: '1234',
              createdAt: '2020-08-25T16:36:19.559474+00:00',
              downloadUrl: '/test.txt',
              errors: [],
              flags: ['backend', 'front-end', 'end2end', 'unit', 'worker'],
              jobCode: '1234',
              provider: 'travis',
              state: 'STARTED',
              updatedAt: '2020-08-25T16:36:19.679868+00:00',
              uploadType: 'UPLOADED',
            },
            {
              buildCode: '1234',
              ciUrl: 'https://example.com',
              createdAt: '2020-08-25T16:36:19.559474+00:00',
              downloadUrl: '/test.txt',
              errors: [
                {
                  errorCode: 'REPORT_EMPTY',
                },
              ],
              flags: ['unit'],
              jobCode: '1234',
              provider: 'travis',
              state: 'ERROR',
              updatedAt: '2020-08-25T16:36:19.679868+00:00',
              uploadType: 'UPLOADED',
            },
          ],
        })
      })

      it('returns a uploadsProviderList', async () => {
        const { result } = renderHook(() => useUploads({}), {
          wrapper,
        })

        const initUploadsProviderList = result.current.uploadsProviderList

        await waitFor(() =>
          expect(initUploadsProviderList).not.toMatchObject(
            result.current.uploadsProviderList
          )
        )

        expect(result.current.uploadsProviderList).toEqual([
          'travis',
          'github actions',
        ])
      })

      it('returns a hasNoUploads', async () => {
        const { result } = renderHook(() => useUploads({}), {
          wrapper,
        })

        const initHasNoUploads = result.current.hasNoUploads

        await waitFor(() =>
          expect(initHasNoUploads).not.toEqual(result.current.hasNoUploads)
        )

        expect(result.current.hasNoUploads).toEqual(false)
      })
    })
  })

  describe('handles carried forward', () => {
    describe('commit with a carried forward flag', () => {
      beforeEach(() => {
        setup(commitOneCarriedForward)
      })

      afterEach(() => {
        server.resetHandlers()
      })

      it('returns uploadsOverview', async () => {
        const { result } = renderHook(() => useUploads({}), {
          wrapper,
        })

        const initUploadsOverview = result.current.uploadsOverview

        await waitFor(() =>
          expect(initUploadsOverview).not.toBe(result.current.uploadsOverview)
        )

        expect(result.current.uploadsOverview).toEqual('1 carried forward')
      })
    })

    describe('commit with out a carried forward flag', () => {
      beforeEach(() => {
        setup(commitOnePending)
      })

      afterEach(() => {
        server.resetHandlers()
      })

      it('returns uploadsOverview', async () => {
        const { result } = renderHook(() => useUploads({}), {
          wrapper,
        })

        const initUploadsOverview = result.current.uploadsOverview

        await waitFor(() =>
          expect(initUploadsOverview).not.toBe(result.current.uploadsOverview)
        )

        expect(result.current.uploadsOverview).not.toContain(
          '1 carried forward'
        )
      })
    })
  })

  describe('user is on team plan', () => {
    beforeEach(() => {
      setup(commitOnePending, TierNames.TEAM)
    })

    afterEach(() => {
      server.resetHandlers()
    })

    it('skips fetching flag related data', async () => {
      const { result } = renderHook(() => useUploads({}), {
        wrapper,
      })
      const initUploadsOverview = result.current.uploadsOverview

      await waitFor(() =>
        expect(initUploadsOverview).not.toBe(result.current.uploadsOverview)
      )

      expect(result.current.groupedUploads).toHaveProperty('travisTeam')
      expect(result.current.uploadsProviderList).toStrictEqual(['travisTeam'])
    })
  })
})
