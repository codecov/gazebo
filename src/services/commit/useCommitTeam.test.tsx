import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { type MockInstance } from 'vitest'

import { useCommitTeam } from './useCommitTeam'

const mockCompareData = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        compareWithParent: {
          __typename: 'Comparison',
          state: 'processed',
          patchTotals: {
            coverage: 100,
          },
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: [
              { headName: 'src/App.tsx', patchCoverage: { coverage: 100 } },
            ],
          },
        },
      },
    },
  },
}

const mockCommitData = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        branchName: null,
        commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
        pullId: 10,
        createdAt: '2020-08-25T16:35:32',
        author: {
          username: 'febg',
        },
        state: 'complete',
        uploads: {
          edges: [
            {
              node: {
                id: 0,
                state: 'PROCESSED',
                provider: 'travis',
                createdAt: '2020-08-25T16:36:19.55947400:00',
                updatedAt: '2020-08-25T16:36:19.67986800:00',
                flags: [],
                downloadUrl:
                  '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
                ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065746',
                uploadType: 'UPLOADED',
                errors: null,
                name: 'upload name',
                jobCode: null,
                buildCode: null,
              },
            },
            {
              node: {
                id: 1,
                state: 'PROCESSED',
                provider: 'travis',
                createdAt: '2020-08-25T16:36:25.82034000:00',
                updatedAt: '2020-08-25T16:36:25.85988900:00',
                flags: [],
                downloadUrl:
                  '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/18b19f8d-5df6-48bd-90eb-50578ed8812f.txt',
                ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065763',
                uploadType: 'UPLOADED',
                errors: null,
                name: 'upload name',
                jobCode: null,
                buildCode: null,
              },
            },
          ],
        },
        message: 'paths test',
        ciPassed: true,
        compareWithParent: {
          __typename: 'Comparison',
          state: 'pending',
          indirectChangedFilesCount: 1,
          directChangedFilesCount: 1,
          patchTotals: {
            coverage: 100,
          },
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: [
              {
                headName: 'src/App.jsx',
                missesCount: 0,
                patchCoverage: {
                  coverage: 100,
                },
              },
            ],
          },
        },
        parent: {
          commitid: 'd773f5bc170caec7f6e64420b0967e7bac978a8f',
          coverageAnalytics: {
            totals: {
              coverage: 38.30846,
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
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  vi.useRealTimers()
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

describe('useCommitTeam', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    server.use(
      graphql.query('GetCommitTeam', (info) => {
        if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivatedError })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else if (isNullOwner) {
          return HttpResponse.json({ data: mockNullOwner })
        } else {
          return HttpResponse.json({ data: mockCommitData })
        }
      }),
      graphql.query('GetCompareTotalsTeam', (info) => {
        return HttpResponse.json({ data: mockCompareData })
      })
    )
  }

  describe('when useCommit is called', () => {
    describe('api returns valid response', () => {
      it('returns commit info', async () => {
        setup({})

        const { result } = renderHook(
          () =>
            useCommitTeam({
              provider: 'gh',
              owner: 'febg',
              repo: 'repo-test',
              commitid: 'a23sda3',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        const expectedResult = {
          commit: {
            author: {
              username: 'febg',
            },
            branchName: null,
            ciPassed: true,
            commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
            compareWithParent: {
              __typename: 'Comparison',
              impactedFiles: {
                __typename: 'ImpactedFiles',
                results: [
                  {
                    headName: 'src/App.tsx',
                    patchCoverage: {
                      coverage: 100,
                    },
                  },
                ],
              },
              patchTotals: {
                coverage: 100,
              },
              state: 'processed',
            },
            createdAt: '2020-08-25T16:35:32',
            message: 'paths test',
            pullId: 10,
            state: 'complete',
            uploads: [
              {
                buildCode: null,
                ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065746',
                createdAt: '2020-08-25T16:36:19.55947400:00',
                downloadUrl:
                  '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
                errors: [],
                flags: [],
                id: 0,
                jobCode: null,
                name: 'upload name',
                provider: 'travis',
                state: 'PROCESSED',
                updatedAt: '2020-08-25T16:36:19.67986800:00',
                uploadType: 'UPLOADED',
              },
              {
                buildCode: null,
                ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065763',
                createdAt: '2020-08-25T16:36:25.82034000:00',
                downloadUrl:
                  '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/18b19f8d-5df6-48bd-90eb-50578ed8812f.txt',
                errors: [],
                flags: [],
                id: 1,
                jobCode: null,
                name: 'upload name',
                provider: 'travis',
                state: 'PROCESSED',
                updatedAt: '2020-08-25T16:36:25.85988900:00',
                uploadType: 'UPLOADED',
              },
            ],
          },
        }

        await waitFor(() => expect(result.current.data).toEqual(expectedResult))
      })
    })

    describe('there is a null owner', () => {
      it('returns a null value', async () => {
        setup({ isNullOwner: true })
        const { result } = renderHook(
          () =>
            useCommitTeam({
              provider: 'gh',
              owner: 'febg',
              repo: 'repo-test',
              commitid: 'a23sda3',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() =>
          expect(result.current.data).toStrictEqual({
            commit: null,
          })
        )
      })
    })
  })

  describe('returns NotFoundError __typename', () => {
    let consoleSpy: MockInstance

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => null)
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('throws a 404', async () => {
      setup({ isNotFoundError: true })
      const { result } = renderHook(
        () =>
          useCommitTeam({
            provider: 'gh',
            owner: 'febg',
            repo: 'repo-test',
            commitid: 'a23sda3',
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
            dev: 'useCommitTeam - 404 not found',
          })
        )
      )
    })
  })

  describe('returns OwnerNotActivatedError __typename', () => {
    let consoleSpy: MockInstance

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => null)
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('throws a 403', async () => {
      setup({ isOwnerNotActivatedError: true })
      const { result } = renderHook(
        () =>
          useCommitTeam({
            provider: 'gh',
            owner: 'febg',
            repo: 'repo-test',
            commitid: 'a23sda3',
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
            dev: 'useCommitTeam - 403 owner not activated',
          })
        )
      )
    })
  })

  describe('unsuccessful parse of zod schema', () => {
    let consoleSpy: MockInstance

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => null)
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('throws a 404', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(
        () =>
          useCommitTeam({
            provider: 'gh',
            owner: 'febg',
            repo: 'repo-test',
            commitid: 'a23sda3',
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
            dev: 'useCommitTeam - 404 failed to parse',
          })
        )
      )
    })
  })
})

describe('useCommitTeam polling', () => {
  function setup() {
    let nbCallCompare = 0
    server.use(
      graphql.query(`GetCommitTeam`, (info) => {
        return HttpResponse.json({ data: mockCommitData })
      }),
      graphql.query(`GetCompareTotalsTeam`, (info) => {
        nbCallCompare++

        if (nbCallCompare < 9) {
          return HttpResponse.json({ data: mockCompareData })
        }

        return HttpResponse.json({ data: mockCompareData })
      })
    )
  }

  describe('when useCommit is called', () => {
    beforeEach(async () => {
      setup()
    })

    it('returns commit data merged with what polling fetched', async () => {
      const { result } = renderHook(
        () =>
          useCommitTeam({
            provider: 'gh',
            owner: 'febg',
            repo: 'repo-test',
            commitid: 'a23sda3',
            refetchInterval: 5,
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => result.current.isSuccess)
      await waitFor(() => {
        if (
          result.current.data?.commit?.compareWithParent?.__typename ===
          'Comparison'
        ) {
          return (
            result.current.data?.commit?.compareWithParent?.state ===
            'processed'
          )
        }
      })

      await waitFor(() =>
        expect(result.current.data).toEqual({
          commit: {
            branchName: null,
            commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
            pullId: 10,
            createdAt: '2020-08-25T16:35:32',
            author: {
              username: 'febg',
            },
            state: 'complete',
            message: 'paths test',
            ciPassed: true,
            compareWithParent: {
              __typename: 'Comparison',
              patchTotals: {
                coverage: 100,
              },
              state: 'processed',
              impactedFiles: {
                __typename: 'ImpactedFiles',
                results: [
                  {
                    headName: 'src/App.tsx',
                    patchCoverage: {
                      coverage: 100,
                    },
                  },
                ],
              },
            },
            uploads: [
              {
                buildCode: null,
                ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065746',
                createdAt: '2020-08-25T16:36:19.55947400:00',
                downloadUrl:
                  '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
                errors: [],
                flags: [],
                id: 0,
                jobCode: null,
                name: 'upload name',
                provider: 'travis',
                state: 'PROCESSED',
                updatedAt: '2020-08-25T16:36:19.67986800:00',
                uploadType: 'UPLOADED',
              },
              {
                buildCode: null,
                ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065763',
                createdAt: '2020-08-25T16:36:25.82034000:00',
                downloadUrl:
                  '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/18b19f8d-5df6-48bd-90eb-50578ed8812f.txt',
                errors: [],
                flags: [],
                id: 1,
                jobCode: null,
                name: 'upload name',
                provider: 'travis',
                state: 'PROCESSED',
                updatedAt: '2020-08-25T16:36:25.85988900:00',
                uploadType: 'UPLOADED',
              },
            ],
          },
        })
      )
    })
  })
})
