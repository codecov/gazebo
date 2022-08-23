import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepoFlags } from './useRepoFlags'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo/flags']}>
    <Route path="/:provider/:owner/:repo/flags">
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
      name: 'flag1',
      percentCovered: 93.26,
      percentChanged: 1.65,
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
      name: 'flag2',
      percentCovered: 92.72,
      percentChanged: 1.58,
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
    name: 'flag1',
    percentCovered: 93.26,
    percentChanged: 1.65,

    measurements: [
      { avg: 91.74637512820512 },
      { avg: 91.85559083333332 },
      { avg: 91.95588104166666 },
      { avg: 91.96796811111112 },
    ],
  },
  {
    name: 'flag2',
    percentCovered: 92.72,
    percentChanged: 1.58,

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
      name: 'flag3',
      percentCovered: 92.95,
      percentChanged: 1.38,
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
    name: 'flag3',
    percentCovered: 92.95,
    percentChanged: 1.38,

    measurements: [
      { avg: 92.92690138723546 },
      { avg: 92.99535449712643 },
      { avg: 93.13587893358877 },
      { avg: 93.04877792892155 },
      { avg: 93.26297761904759 },
    ],
  },
]

const provider = 'gh'
const owner = 'codecov'
const repo = 'gazebo'

describe('FlagMeasurements', () => {
  let hookData

  function setup() {
    server.use(
      graphql.query('FlagMeasurements', (req, res, ctx) => {
        const dataReturned = {
          owner: {
            repository: {
              flags: {
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

    hookData = renderHook(() => useRepoFlags({ provider, owner, repo }), {
      wrapper,
    })
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('renders isLoading true', () => {
      expect(hookData.result.current.isLoading).toBeTruthy()
    })

    describe('when data is loaded', () => {
      beforeEach(() => {
        return hookData.waitFor(() => hookData.result.current.isSuccess)
      })

      it('returns the data', () => {
        expect(hookData.result.current.data).toEqual(expectedInitialData)
      })
    })
  })

  describe('when fetchNextPage is called', () => {
    beforeEach(async () => {
      setup()
      await hookData.waitFor(() => hookData.result.current.isSuccess)

      hookData.result.current.fetchNextPage()

      await hookData.waitFor(() => hookData.result.current.isFetching)
      await hookData.waitFor(() => !hookData.result.current.isFetching)
    })

    it('returns prev and next page flags data', async () => {
      expect(hookData.result.current.data).toEqual([
        ...expectedInitialData,
        ...expectedNextPageData,
      ])
    })
  })
})
