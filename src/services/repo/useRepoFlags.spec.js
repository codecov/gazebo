import { act, renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from 'react-query'
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
      measurements: [
        { timestamp: '2022-01-03T00:00:00+00:00', avg: 91.74637512820512 },
        { timestamp: '2022-01-10T00:00:00+00:00', avg: 91.85559083333332 },
        { timestamp: '2022-02-14T00:00:00+00:00', avg: 91.95588104166666 },
        { timestamp: '2022-02-21T00:00:00+00:00', avg: 91.96796811111112 },
      ],
    },
  },
  {
    node: {
      name: 'flag2',
      percentCovered: 92.72,
      measurements: [
        { timestamp: '2022-05-02T00:00:00+00:00', avg: 92.44361365466449 },
        { timestamp: '2022-05-09T00:00:00+00:00', avg: 92.55269245333334 },
        { timestamp: '2022-05-16T00:00:00+00:00', avg: 92.84718477040816 },
        { timestamp: '2022-05-23T00:00:00+00:00', avg: 92.91016116666667 },
        { timestamp: '2022-05-30T00:00:00+00:00', avg: 92.92690138723546 },
      ],
    },
  },
]

const expectedInitialData = [
  {
    name: 'flag1',
    percentCovered: 93.26,
    measurements: [
      { timestamp: '2022-01-03T00:00:00+00:00', avg: 91.74637512820512 },
      { timestamp: '2022-01-10T00:00:00+00:00', avg: 91.85559083333332 },
      { timestamp: '2022-02-14T00:00:00+00:00', avg: 91.95588104166666 },
      { timestamp: '2022-02-21T00:00:00+00:00', avg: 91.96796811111112 },
    ],
  },
  {
    name: 'flag2',
    percentCovered: 92.72,
    measurements: [
      { timestamp: '2022-05-02T00:00:00+00:00', avg: 92.44361365466449 },
      { timestamp: '2022-05-09T00:00:00+00:00', avg: 92.55269245333334 },
      { timestamp: '2022-05-16T00:00:00+00:00', avg: 92.84718477040816 },
      { timestamp: '2022-05-23T00:00:00+00:00', avg: 92.91016116666667 },
      { timestamp: '2022-05-30T00:00:00+00:00', avg: 92.92690138723546 },
    ],
  },
]

const nextPageData = [
  {
    node: {
      name: 'flag3',
      percentCovered: 92.95,
      measurements: [
        { timestamp: '2022-05-30T00:00:00+00:00', avg: 92.92690138723546 },
        { timestamp: '2022-06-06T00:00:00+00:00', avg: 92.99535449712643 },
        { timestamp: '2022-06-13T00:00:00+00:00', avg: 93.13587893358877 },
        { timestamp: '2022-06-20T00:00:00+00:00', avg: 93.04877792892155 },
        { timestamp: '2022-06-27T00:00:00+00:00', avg: 93.26297761904759 },
      ],
    },
  },
]

const expectedNextPageData = [
  {
    name: 'flag3',
    percentCovered: 92.95,
    measurements: [
      { timestamp: '2022-05-30T00:00:00+00:00', avg: 92.92690138723546 },
      { timestamp: '2022-06-06T00:00:00+00:00', avg: 92.99535449712643 },
      { timestamp: '2022-06-13T00:00:00+00:00', avg: 93.13587893358877 },
      { timestamp: '2022-06-20T00:00:00+00:00', avg: 93.04877792892155 },
      { timestamp: '2022-06-27T00:00:00+00:00', avg: 93.26297761904759 },
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
      await act(() => {
        return hookData.result.current.fetchNextPage()
      })
    })

    it('returns prev and next page flags data', () => {
      expect(hookData.result.current.data).toEqual([
        ...expectedInitialData,
        ...expectedNextPageData,
      ])
    })
  })
})
