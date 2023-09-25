import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useCommit } from './index'

const compareDoneData = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        branchName: null,
        totals: {
          coverage: 38.30846,
          diff: {
            coverage: null,
          },
        },
        commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
        pullId: 10,
        createdAt: '2020-08-25T16:35:32',
        author: {
          username: 'febg',
        },
        state: 'complete',
        uploads: {
          edges: [],
        },
        message: 'paths test',
        ciPassed: true,
        compareWithParent: {
          __typename: 'Comparison',
          state: 'PROCESSED',
          indirectChangedFilesCount: 1,
          directChangedFilesCount: 1,
          patchTotals: null,
          impactedFiles: [],
        },
        parent: {
          commitid: 'd773f5bc170caec7f6e64420b0967e7bac978a8f',
          totals: {
            coverage: 38.30846,
          },
        },
      },
    },
  },
}

const dataReturned = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        branchName: null,
        totals: {
          coverage: 38.30846,
          diff: {
            coverage: null,
          },
        },
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
          patchTotals: null,
          impactedFiles: [],
        },
        parent: {
          commitid: 'd773f5bc170caec7f6e64420b0967e7bac978a8f',
          totals: {
            coverage: 38.30846,
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
  <MemoryRouter initialEntries={['/gh']}>
    <Route path="/:provider">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  jest.useRealTimers()
  server.resetHandlers()
  queryClient.clear()
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

describe('useCommit', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    server.use(
      graphql.query(`Commit`, (req, res, ctx) => {
        if (isNotFoundError) {
          return res(ctx.status(200), ctx.data(mockNotFoundError))
        } else if (isOwnerNotActivatedError) {
          return res(ctx.status(200), ctx.data(mockOwnerNotActivatedError))
        } else if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockUnsuccessfulParseError))
        } else if (isNullOwner) {
          return res(ctx.status(200), ctx.data(mockNullOwner))
        } else {
          return res(ctx.status(200), ctx.data(dataReturned))
        }
      }),
      graphql.query(`CompareTotals`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(compareDoneData))
      })
    )
  }

  describe('when useCommit is called', () => {
    describe('api returns valid response', () => {
      beforeEach(() => {
        setup({})
      })

      it('returns commit info', async () => {
        const { result } = renderHook(
          () =>
            useCommit({
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
              impactedFiles: [],
              patchTotals: null,
              state: 'PROCESSED',
            },
            createdAt: '2020-08-25T16:35:32',
            message: 'paths test',
            parent: {
              commitid: 'd773f5bc170caec7f6e64420b0967e7bac978a8f',
              totals: {
                coverage: 38.30846,
              },
            },
            pullId: 10,
            state: 'complete',
            totals: {
              coverage: 38.30846,
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
        }

        await waitFor(() => expect(result.current.data).toEqual(expectedResult))
      })
    })

    describe('there is a null owner', () => {
      it('returns a null value', async () => {
        setup({ isNullOwner: true })
        const { result } = renderHook(
          () =>
            useCommit({
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
    beforeEach(() => {
      jest.spyOn(console, 'error')
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('throws a 404', async () => {
      setup({ isNotFoundError: true })
      const { result } = renderHook(
        () =>
          useCommit({
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
          })
        )
      )
    })
  })

  describe('returns OwnerNotActivatedError __typename', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error')
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('throws a 403', async () => {
      setup({ isOwnerNotActivatedError: true })
      const { result } = renderHook(
        () =>
          useCommit({
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
          })
        )
      )
    })
  })

  describe('unsuccessful parse of zod schema', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error')
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('throws a 404', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(
        () =>
          useCommit({
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
          })
        )
      )
    })
  })
})

describe('useCommit polling', () => {
  let nbCallCompare = 0

  function setup() {
    nbCallCompare = 0
    server.use(
      graphql.query(`Commit`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(dataReturned))
      }),
      graphql.query(`CompareTotals`, (req, res, ctx) => {
        nbCallCompare++
        // after 10 calls, the server returns that the commit is processed
        if (nbCallCompare < 10) {
          return res(ctx.status(200), ctx.data(dataReturned))
        }
        return res(ctx.status(200), ctx.data(compareDoneData))
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
          useCommit({
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
            totals: {
              coverage: 38.30846,
            },
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
              state: 'PROCESSED',
              impactedFiles: [],
              patchTotals: null,
            },
            parent: {
              commitid: 'd773f5bc170caec7f6e64420b0967e7bac978a8f',
              totals: {
                coverage: 38.30846,
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
