import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useCommit, useCommitYaml } from './index'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh']}>
    <Route path="/:provider">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const commitData = {
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
          state: 'processed',
          provider: 'travis',
          createdAt: '2020-08-25T16:36:19.559474+00:00',
          updatedAt: '2020-08-25T16:36:19.679868+00:00',
          flags: [],
          downloadUrl:
            '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
          ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065746',
          uploadType: 'uploaded',
          errors: [],
          name: 'upload name',
        },
      },
      {
        node: {
          id: 1,
          state: 'processed',
          provider: 'travis',
          createdAt: '2020-08-25T16:36:25.820340+00:00',
          updatedAt: '2020-08-25T16:36:25.859889+00:00',
          flags: [],
          downloadUrl:
            '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/18b19f8d-5df6-48bd-90eb-50578ed8812f.txt',
          ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065763',
          uploadType: 'uploaded',
          errors: [],
          name: 'upload name',
        },
      },
    ],
  },
  message: 'paths test',
  ciPassed: true,
  compareWithParent: {
    state: 'pending',
  },
  parent: {
    commitid: 'd773f5bc170caec7f6e64420b0967e7bac978a8f',
    totals: {
      coverage: 38.30846,
    },
  },
}

const compareDoneData = {
  owner: {
    repository: {
      commit: {
        compareWithParent: {
          state: 'processed',
        },
      },
    },
  },
}

const dataReturned = {
  owner: {
    repository: {
      commit: commitData,
    },
  },
}

const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  jest.useRealTimers()
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useCommit', () => {
  function setup() {
    server.use(
      graphql.query(`Commit`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(dataReturned))
      }),
      graphql.query(`CompareTotals`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(compareDoneData))
      })
    )
  }

  describe('when useCommit is called', () => {
    const expectedResponse = {
      commit: {
        ...commitData,
        compareWithParent: {
          state: 'processed',
        },
        uploads: [
          commitData.uploads.edges[0].node,
          commitData.uploads.edges[1].node,
        ],
      },
    }

    beforeEach(() => {
      setup()
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

      await waitFor(() => expect(result.current.data).toEqual(expectedResponse))
    })
  })
})

describe('useCommit polling', () => {
  let nbCallCompare = 0

  function setup(provider, owner, repo, commitid) {
    nbCallCompare = 0
    server.use(
      graphql.query(`Commit`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(dataReturned))
      }),
      graphql.query(`CompareTotals`, (req, res, ctx) => {
        nbCallCompare++
        // after 10 calls, the server returns that the commit is processed
        if (nbCallCompare < 10)
          return res(ctx.status(200), ctx.data(dataReturned))
        return res(ctx.status(200), ctx.data(compareDoneData))
      })
    )
  }

  describe('when useCommit is called', () => {
    const expectedResponse = {
      commit: {
        ...commitData,
        uploads: [
          commitData.uploads.edges[0].node,
          commitData.uploads.edges[1].node,
        ],
      },
    }
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
        const { commit } = result.current.data
        return commit.compareWithParent.state === 'processed'
      })

      await waitFor(() =>
        expect(result.current.data).toEqual({
          ...expectedResponse,
          commit: {
            ...expectedResponse.commit,
            compareWithParent: {
              state: 'processed',
            },
          },
        })
      )
    })
  })
})

describe('useCommitYaml', () => {
  const yaml =
    'codecov:\n  max_report_age: false\n  require_ci_to_pass: true\ncomment:\n  behavior: default\n  layout: reach,diff,flags,tree,reach\n  show_carryforward_flags: false\ncoverage:\n  precision: 2\n  range:\n  - 70.0\n  - 100.0\n  round: down\n  status:\n    changes: false\n    default_rules:\n      flag_coverage_not_uploaded_behavior: include\n    patch:\n      default:\n        target: 80.0\n    project:\n      library:\n        paths:\n        - src/path1/.*\n        target: auto\n        threshold: 0.1\n      tests:\n        paths:\n        - src/path2/.*\n        target: 100.0\ngithub_checks:\n  annotations: true\n'

  function setup(provider, owner, repo, commitid) {
    server.use(
      graphql.query(`CommitYaml`, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              repository: {
                commit: {
                  commitid: 'abc',
                  yaml,
                },
              },
            },
          })
        )
      })
    )
  }

  describe('when called and user is authenticated', () => {
    beforeEach(() => {
      setup()
    })

    it('returns commit info', async () => {
      const { result } = renderHook(
        () =>
          useCommitYaml({
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

      await waitFor(() => expect(result.current.data).toEqual(yaml))
    })
  })
})
