import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useSingularImpactedFileComparison } from './useSingularImpactedFileComparison'
import { transformImpactedFileData } from './utils'

console.error = () => {}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

const mockNotFoundError = {
  owner: {
    repository: {
      __typename: 'NotFoundError',
      message: 'repo not found',
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

const mockIncorrectResponse = {
  owner: {
    repository: {
      invalid: 'invalid',
    },
  },
}

const mockResponse = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        compareWithBase: {
          __typename: 'Comparison',
          impactedFile: {
            __typename: 'ImpactedFile',
            hashedPath: 'hashedPath',
            headName: 'headName',
            isRenamedFile: false,
            isNewFile: false,
            isDeletedFile: false,
            isCriticalFile: false,
            baseCoverage: {
              percentCovered: 23,
            },
            headCoverage: {
              percentCovered: 24,
            },
            patchCoverage: {
              percentCovered: 25,
            },
            changeCoverage: 0,
            segments: {
              __typename: 'SegmentComparisons',
              results: [
                {
                  header: 'header',
                  hasUnintendedChanges: false,
                  lines: [
                    {
                      baseNumber: '1',
                      headNumber: '1',
                      baseCoverage: 'M',
                      headCoverage: 'H',
                      content: 'content',
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    },
  },
}

const mockMissingBaseCommitResponse = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        compareWithBase: {
          __typename: 'MissingBaseCommit',
          message: 'missing base commit',
        },
      },
    },
  },
}

describe('useSingularImpactedFileComparison', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isMissingBaseCommit = false,
  }) {
    server.use(
      graphql.query('ImpactedFileComparison', (req, res, ctx) => {
        if (isNotFoundError) {
          return res(ctx.status(200), ctx.data(mockNotFoundError))
        } else if (isOwnerNotActivatedError) {
          return res(ctx.status(200), ctx.data(mockOwnerNotActivatedError))
        } else if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockIncorrectResponse))
        } else if (isMissingBaseCommit) {
          return res(ctx.status(200), ctx.data(mockMissingBaseCommitResponse))
        }
        return res(ctx.status(200), ctx.data(mockResponse))
      })
    )
  }

  describe('when called with successful res', () => {
    beforeEach(() => {
      setup({})
    })
    afterEach(() => server.resetHandlers())

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result } = renderHook(
          () =>
            useSingularImpactedFileComparison({
              provider: 'gh',
              owner: 'codecov',
              repo: 'gazebo',
              pullId: '1',
              path: 'path',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.data).toEqual(
            transformImpactedFileData(
              mockResponse.owner.repository.pull.compareWithBase.impactedFile
            )
          )
        )
      })
    })
  })

  describe('when failed to parse data', () => {
    it('returns a failed to parse error', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(
        () =>
          useSingularImpactedFileComparison({
            provider: 'gh',
            owner: 'codecov',
            repo: 'gazebo',
            pullId: '1',
            path: 'path',
          }),
        {
          wrapper,
        }
      )
      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'useSingularImpactedFileComparison - 404 failed to parse',
          })
        )
      )
    })
  })

  describe('when data not found', () => {
    it('returns a not found error', async () => {
      setup({ isNotFoundError: true })
      const { result } = renderHook(
        () =>
          useSingularImpactedFileComparison({
            provider: 'gh',
            owner: 'codecov',
            repo: 'gazebo',
            pullId: '1',
            path: 'path',
          }),
        {
          wrapper,
        }
      )
      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            data: {},
          })
        )
      )
    })
  })

  describe('when owner is not activated', () => {
    it('returns an owner not activated error', async () => {
      setup({ isOwnerNotActivatedError: true })
      const { result } = renderHook(
        () =>
          useSingularImpactedFileComparison({
            provider: 'gh',
            owner: 'codecov',
            repo: 'gazebo',
            pullId: '1',
            path: 'path',
          }),
        {
          wrapper,
        }
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

  describe('when comparison is of other type', () => {
    it('returns error rejected', async () => {
      setup({ isMissingBaseCommit: true })
      const { result } = renderHook(
        () =>
          useSingularImpactedFileComparison({
            provider: 'gh',
            owner: 'codecov',
            repo: 'gazebo',
            pullId: '1',
            path: 'path',
          }),
        {
          wrapper,
        }
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
