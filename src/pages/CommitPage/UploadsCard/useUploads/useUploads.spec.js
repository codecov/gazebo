import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import {
  commitEmptyUploads,
  commitErrored,
  commitOneCarriedForward,
  commitOnePending,
  compareTotalsEmpty,
} from 'services/commit/mocks'

import { useUploads } from './useUploads'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper = ({ children }) => (
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
  let hookData

  function setup(query) {
    server.use(query, compareTotalsEmpty)

    hookData = renderHook(() => useUploads(), {
      wrapper,
    })
  }

  describe('empty uploads', () => {
    beforeEach(() => {
      setup(commitEmptyUploads)
    })
    afterEach(() => server.resetHandlers())

    describe('when data is loaded', () => {
      it('returns sortedUploads', () => {
        expect(hookData.result.current.sortedUploads).toMatchObject({})
      })

      it('returns a uploadsProviderList', () => {
        expect(hookData.result.current.uploadsProviderList).toEqual([])
      })

      it('returns a hasNoUploads', () => {
        expect(hookData.result.current.hasNoUploads).toEqual(true)
      })
    })
  })

  describe('mix of upload states', () => {
    beforeEach(() => {
      setup(commitErrored)
    })
    afterEach(() => server.resetHandlers())

    describe('when data is loaded', () => {
      it('returns uploadsOverview', async () => {
        const initUploadsOverview = hookData.result.current.uploadsOverview

        await hookData.waitFor(() =>
          expect(initUploadsOverview).not.toBe(
            hookData.result.current.uploadsOverview
          )
        )

        expect(hookData.result.current.uploadsOverview).toEqual(
          '2 errored, 3 are pending, 1 successful, 1 carried forward'
        )
      })

      it('returns sortedUploads', async () => {
        const initSortedUploads = hookData.result.current.sortedUploads

        await hookData.waitFor(() =>
          expect(initSortedUploads).not.toMatchObject(
            hookData.result.current.sortedUploads
          )
        )
        expect(hookData.result.current.sortedUploads).toMatchObject({
          'github actions': [
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
              createdAt: '2020-08-25T16:36:25.820340+00:00',
              errors: [],
              flags: ['front-end'],
              jobCode: '1234',
              provider: 'github actions',
              state: 'COMPLETE',
              updatedAt: '2020-08-25T16:36:25.859889+00:00',
              uploadType: 'CARRIEDFORWARD',
            },
          ],
          travis: [
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
            {
              buildCode: '1234',
              createdAt: '2020-08-25T16:36:19.559474+00:00',
              downloadUrl: '/test.txt',
              errors: [],
              flags: ['backend', 'front-end', 'end2end', 'unit', 'worker'],
              jobCode: '1234',
              provider: 'travis',
              state: 'PENDING',
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
              state: 'PENDING',
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
              state: 'PENDING',
              updatedAt: '2020-08-25T16:36:19.679868+00:00',
              uploadType: 'UPLOADED',
            },
          ],
        })
      })

      it('returns a uploadsProviderList', async () => {
        const initUploadsProviderList =
          hookData.result.current.uploadsProviderList

        await hookData.waitFor(() =>
          expect(initUploadsProviderList).not.toMatchObject(
            hookData.result.current.uploadsProviderList
          )
        )

        expect(hookData.result.current.uploadsProviderList).toEqual([
          'travis',
          'github actions',
        ])
      })

      it('returns a hasNoUploads', async () => {
        const initHasNoUploads = hookData.result.current.hasNoUploads

        await hookData.waitFor(() =>
          expect(initHasNoUploads).not.toEqual(
            hookData.result.current.hasNoUploads
          )
        )

        expect(hookData.result.current.hasNoUploads).toEqual(false)
      })
    })
  })

  describe('handles carried forward', () => {
    describe('commit with a carried forward flag', () => {
      beforeEach(() => {
        setup(commitOneCarriedForward)
      })
      afterEach(() => server.resetHandlers())
      it('returns uploadsOverview', async () => {
        const initUploadsOverview = hookData.result.current.uploadsOverview

        await hookData.waitFor(() =>
          expect(initUploadsOverview).not.toBe(
            hookData.result.current.uploadsOverview
          )
        )

        expect(hookData.result.current.uploadsOverview).toEqual(
          '1 carried forward'
        )
      })
    })
    describe('commit with out a carried forward flag', () => {
      beforeEach(() => {
        setup(commitOnePending)
      })
      afterEach(() => server.resetHandlers())
      it('returns uploadsOverview', async () => {
        const initUploadsOverview = hookData.result.current.uploadsOverview

        await hookData.waitFor(() =>
          expect(initUploadsOverview).not.toBe(
            hookData.result.current.uploadsOverview
          )
        )

        expect(hookData.result.current.uploadsOverview).not.toContain(
          '1 carried forward'
        )
      })
    })
  })

  describe('handles singular pending case', () => {
    beforeEach(async () => {
      setup(commitOnePending)
    })
    afterEach(() => server.resetHandlers())

    describe('when data is loaded', () => {
      it('returns uploadsOverview', async () => {
        const initUploadsOverview = hookData.result.current.uploadsOverview

        await hookData.waitFor(() =>
          expect(initUploadsOverview).not.toBe(
            hookData.result.current.uploadsOverview
          )
        )

        expect(hookData.result.current.uploadsOverview).toEqual('1 is pending')
      })
    })
  })
})
