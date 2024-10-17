import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { type MockInstance } from 'vitest'

import A from 'ui/A'

import { useRepoComponents } from './useRepoComponents'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo/components']}>
    <Route path="/:provider/:owner/:repo/components">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const server = setupServer()
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

const expectedData = [
  {
    name: 'component1',
    componentId: 'component1Id',
    percentCovered: 93.26,
    percentChange: 1.65,
    lastUploaded: '2021-09-30T00:00:00Z',
    measurements: [
      { avg: 91.74637512820512 },
      { avg: 91.85559083333332 },
      { avg: 91.95588104166666 },
      { avg: 91.96796811111112 },
    ],
  },
  {
    name: 'component2',
    componentId: 'component2Id',
    percentCovered: 92.72,
    percentChange: 1.58,
    lastUploaded: null,
    measurements: [
      { avg: 92.44361365466449 },
      { avg: 92.55269245333334 },
      { avg: 92.84718477040816 },
      { avg: 92.91016116666667 },
      { avg: 92.92690138723546 },
    ],
  },
]

describe('ComponentMeasurements', () => {
  function setup({
    isSchemaInvalid = false,
    isOwnerActivationError = false,
    isNotFoundError = false,
  } = {}) {
    server.use(
      graphql.query('ComponentMeasurements', (info) => {
        if (isSchemaInvalid) {
          return HttpResponse.json({})
        }

        if (isOwnerActivationError) {
          return HttpResponse.json({
            data: {
              owner: {
                repository: {
                  __typename: 'OwnerNotActivatedError',
                  message: 'Owner not activated',
                },
              },
            },
          })
        }

        if (isNotFoundError) {
          return HttpResponse.json({
            data: {
              owner: {
                repository: {
                  __typename: 'NotFoundError',
                  message: 'Repo not found',
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
                coverageAnalytics: {
                  components: expectedData,
                },
              },
            },
          },
        })
      })
    )
  }

  describe('when called', () => {
    describe('when data is loaded', () => {
      it('returns the data', async () => {
        setup()
        const { result } = renderHook(
          () =>
            useRepoComponents({
              interval: 'INTERVAL_30_DAY',
              after: '2021-09-01',
              before: '2021-09-30',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() =>
          expect(result.current.data).toEqual({
            components: expectedData,
          })
        )
      })
    })
  })

  describe('when the schema is invalid', () => {
    let consoleSpy: MockInstance
    beforeAll(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      consoleSpy.mockRestore()
    })

    it('returns an error', async () => {
      setup({ isSchemaInvalid: true })
      const { result } = renderHook(
        () =>
          useRepoComponents({
            interval: 'INTERVAL_30_DAY',
            after: '2021-09-01',
            before: '2021-09-30',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() =>
        expect(result.current.error).toEqual({
          status: 404,
          data: {},
          dev: 'useRepoComponents - 404 failed to parse',
        })
      )
    })
  })

  describe('when repo is not found', () => {
    let consoleSpy: MockInstance
    beforeAll(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      consoleSpy.mockRestore()
    })

    it('returns an error', async () => {
      setup({ isNotFoundError: true })
      const { result } = renderHook(
        () =>
          useRepoComponents({
            interval: 'INTERVAL_30_DAY',
            after: '2021-09-01',
            before: '2021-09-30',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() =>
        expect(result.current.error).toEqual({
          status: 404,
          data: {},
          dev: 'useRepoComponents - 404 NotFoundError',
        })
      )
    })
  })

  describe('when owner is not activated', () => {
    let consoleSpy: MockInstance
    beforeAll(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      consoleSpy.mockRestore()
    })

    it('returns an error', async () => {
      setup({ isOwnerActivationError: true })
      const { result } = renderHook(
        () =>
          useRepoComponents({
            interval: 'INTERVAL_30_DAY',
            after: '2021-09-01',
            before: '2021-09-30',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() =>
        expect(result.current.error).toEqual({
          status: 403,
          data: {
            detail: (
              <p>
                Activation is required to view this repo, please{' '}
                <A
                  to={{ pageName: 'membersTab' }}
                  hook="activate-members"
                  isExternal={false}
                >
                  click here{' '}
                </A>{' '}
                to activate your account.
              </p>
            ),
          },
          dev: 'useRepoComponents - 403 OwnerNotActivatedError',
        })
      )
    })
  })
})
