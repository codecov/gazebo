import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import A from 'ui/A'

import { useRepoComponents } from './useRepoComponents'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo/components']}>
    <Route path="/:provider/:owner/:repo/components">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const initialData = [
  {
    node: {
      name: 'component1',
      percentCovered: 93.26,
      percentChange: 1.65,
      measurements: [
        { avg: 91.74637512820512 },
        { avg: 91.85559083333332 },
        { avg: 91.95588104166666 },
        { avg: 91.96796811111112 },
      ],
    },
  },
  {
    node: {
      name: 'component2',
      percentCovered: 92.72,
      percentChange: 1.58,
      measurements: [
        { avg: 92.44361365466449 },
        { avg: 92.55269245333334 },
        { avg: 92.84718477040816 },
        { avg: 92.91016116666667 },
        { avg: 92.92690138723546 },
      ],
    },
  },
]

const expectedInitialData = [
  {
    name: 'component1',
    percentCovered: 93.26,
    percentChange: 1.65,

    measurements: [
      { avg: 91.74637512820512 },
      { avg: 91.85559083333332 },
      { avg: 91.95588104166666 },
      { avg: 91.96796811111112 },
    ],
  },
  {
    name: 'component2',
    percentCovered: 92.72,
    percentChange: 1.58,

    measurements: [
      { avg: 92.44361365466449 },
      { avg: 92.55269245333334 },
      { avg: 92.84718477040816 },
      { avg: 92.91016116666667 },
      { avg: 92.92690138723546 },
    ],
  },
]

const nextPageData = [
  {
    node: {
      name: 'component3',
      percentCovered: 92.95,
      percentChange: 1.38,
      measurements: [
        { avg: 92.92690138723546 },
        { avg: 92.99535449712643 },
        { avg: 93.13587893358877 },
        { avg: 93.04877792892155 },
        { avg: 93.26297761904759 },
      ],
    },
  },
]

const expectedNextPageData = [
  {
    name: 'component3',
    percentCovered: 92.95,
    percentChange: 1.38,

    measurements: [
      { avg: 92.92690138723546 },
      { avg: 92.99535449712643 },
      { avg: 93.13587893358877 },
      { avg: 93.04877792892155 },
      { avg: 93.26297761904759 },
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
      graphql.query('ComponentMeasurements', (req, res, ctx) => {
        if (isSchemaInvalid) {
          return res(ctx.status(200), ctx.data({}))
        }

        if (isOwnerActivationError) {
          return res(
            ctx.status(200),
            ctx.data({
              owner: {
                repository: {
                  __typename: 'OwnerNotActivatedError',
                  message: 'Owner not activated',
                },
              },
            })
          )
        }

        if (isNotFoundError) {
          return res(
            ctx.status(200),
            ctx.data({
              owner: {
                repository: {
                  __typename: 'NotFoundError',
                  message: 'Repo not found',
                },
              },
            })
          )
        }

        const dataReturned = {
          owner: {
            repository: {
              __typename: 'Repository',
              components: {
                edges: req.variables.after
                  ? [...nextPageData]
                  : [...initialData],
                pageInfo: {
                  hasNextPage: !req.variables.after,
                  endCursor: req.variables.after ? 'aabb' : 'dW5pdA==',
                },
              },
            },
          },
        }
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result } = renderHook(
          () =>
            useRepoComponents({
              interval: 'INTERVAL_30_DAY',
              afterDate: '2021-09-01',
              beforeDate: '2021-09-30',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.data).toEqual(expectedInitialData)
        )
      })
    })
  })

  describe('when fetchNextPage is called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns prev and next page components data', async () => {
      const { result } = renderHook(
        () =>
          useRepoComponents({
            interval: 'INTERVAL_30_DAY',
            afterDate: '2021-09-01',
            beforeDate: '2021-09-30',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

      result.current.fetchNextPage()

      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

      await waitFor(() =>
        expect(result.current.data).toEqual([
          ...expectedInitialData,
          ...expectedNextPageData,
        ])
      )
    })
  })

  describe('when the schema is invalid', () => {
    beforeEach(() => {
      setup({ isSchemaInvalid: true })
    })

    it('returns an error', async () => {
      const { result } = renderHook(
        () =>
          useRepoComponents({
            interval: 'INTERVAL_30_DAY',
            afterDate: '2021-09-01',
            beforeDate: '2021-09-30',
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
    beforeEach(() => {
      setup({ isNotFoundError: true })
    })

    it('returns an error', async () => {
      const { result } = renderHook(
        () =>
          useRepoComponents({
            interval: 'INTERVAL_30_DAY',
            afterDate: '2021-09-01',
            beforeDate: '2021-09-30',
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
    beforeEach(() => {
      setup({ isOwnerActivationError: true })
    })

    it('returns an error', async () => {
      const { result } = renderHook(
        () =>
          useRepoComponents({
            interval: 'INTERVAL_30_DAY',
            afterDate: '2021-09-01',
            beforeDate: '2021-09-30',
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
