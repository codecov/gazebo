import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useBranchCoverageMeasurements } from './useBranchCoverageMeasurements'

const mockBranchMeasurements = {
  owner: {
    repository: {
      __typename: 'Repository',
      measurements: [
        {
          timestamp: '2023-01-01T00:00:00+00:00',
          max: 85,
        },
        {
          timestamp: '2023-01-02T00:00:00+00:00',
          max: 80,
        },
        {
          timestamp: '2023-01-03T00:00:00+00:00',
          max: 90,
        },
        {
          timestamp: '2023-01-04T00:00:00+00:00',
          max: 100,
        },
      ],
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

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
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

interface SetupArgs {
  isNotFoundError?: boolean
  isOwnerNotActivatedError?: boolean
  isUnsuccessfulParseError?: boolean
  isNullOwner?: boolean
}

describe('useBranchCoverageMeasurements', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    server.use(
      graphql.query('GetBranchCoverageMeasurements', (req, res, ctx) => {
        if (isNotFoundError) {
          return res(ctx.status(200), ctx.data(mockNotFoundError))
        } else if (isOwnerNotActivatedError) {
          return res(ctx.status(200), ctx.data(mockOwnerNotActivatedError))
        } else if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockUnsuccessfulParseError))
        } else if (isNullOwner) {
          return res(ctx.status(200), ctx.data(mockNullOwner))
        } else {
          return res(ctx.status(200), ctx.data(mockBranchMeasurements))
        }
      })
    )
  }

  describe('when called', () => {
    describe('returns Repository as the __typename', () => {
      describe('there is valid data', () => {
        it('returns coverage information', async () => {
          setup({})
          const { result } = renderHook(
            () =>
              useBranchCoverageMeasurements({
                provider: 'gh',
                owner: 'codecov',
                repo: 'cool-repo',
                interval: 'INTERVAL_7_DAY',
                before: new Date('2023/03/02'),
                after: new Date('2022/03/02'),
                branch: 'main',
              }),
            { wrapper }
          )

          const expectedData = {
            measurements: [
              {
                timestamp: '2023-01-01T00:00:00+00:00',
                max: 85,
              },
              {
                timestamp: '2023-01-02T00:00:00+00:00',
                max: 80,
              },
              {
                timestamp: '2023-01-03T00:00:00+00:00',
                max: 90,
              },
              {
                timestamp: '2023-01-04T00:00:00+00:00',
                max: 100,
              },
            ],
          }

          await waitFor(() =>
            expect(result.current.data).toStrictEqual(expectedData)
          )
        })
      })

      describe('owner is returned as null', () => {
        it('returns empty array', async () => {
          setup({ isNullOwner: true })
          const { result } = renderHook(
            () =>
              useBranchCoverageMeasurements({
                provider: 'gh',
                owner: 'codecov',
                repo: 'cool-repo',
                interval: 'INTERVAL_7_DAY',
                before: new Date('2023/03/02'),
                after: new Date('2022/03/02'),
                branch: 'main',
              }),
            { wrapper }
          )

          await waitFor(() =>
            expect(result.current.data).toStrictEqual({ measurements: [] })
          )
        })
      })
    })
  })

  describe('returns NotFoundError __typename', () => {
    let oldConsoleError = console.error

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
          useBranchCoverageMeasurements({
            provider: 'gh',
            owner: 'codecov',
            repo: 'cool-repo',
            interval: 'INTERVAL_7_DAY',
            before: new Date('2023/03/02'),
            after: new Date('2022/03/02'),
            branch: 'main',
          }),
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
    let oldConsoleError = console.error

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
          useBranchCoverageMeasurements({
            provider: 'gh',
            owner: 'codecov',
            repo: 'cool-repo',
            interval: 'INTERVAL_7_DAY',
            before: new Date('2023/03/02'),
            after: new Date('2022/03/02'),
            branch: 'main',
          }),
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
    let oldConsoleError = console.error

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
          useBranchCoverageMeasurements({
            provider: 'gh',
            owner: 'codecov',
            repo: 'cool-repo',
            interval: 'INTERVAL_7_DAY',
            before: new Date('2023/03/02'),
            after: new Date('2022/03/02'),
            branch: 'main',
          }),
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
})
