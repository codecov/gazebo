import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { renderHook } from '@testing-library/react-hooks'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useCommit, useCommitYaml, useImpactedFiles } from './hooks'
import { MemoryRouter, Route } from 'react-router-dom'

jest.mock('./hooks', () => ({
  ...jest.requireActual('./hooks'),
  fetchCompareTotals: () => ({ state: 'pending' }),
}))

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh']}>
    <Route path="/:provider">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const dataReturned = {
  owner: {
    repository: {
      commit: {
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
        uploads: {
          edges: [
            {
              node: {
                state: 'processed',
                provider: 'travis',
                createdAt: '2020-08-25T16:36:19.559474+00:00',
                updatedAt: '2020-08-25T16:36:19.679868+00:00',
                flags: [],
                downloadUrl:
                  '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
                ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065746',
                uploadType: 'uploaded',
              },
            },
            {
              node: {
                state: 'processed',
                provider: 'travis',
                createdAt: '2020-08-25T16:36:25.820340+00:00',
                updatedAt: '2020-08-25T16:36:25.859889+00:00',
                flags: [],
                downloadUrl:
                  '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/18b19f8d-5df6-48bd-90eb-50578ed8812f.txt',
                ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065763',
                uploadType: 'uploaded',
              },
            },
          ],
        },
        message: 'paths test',
        ciPassed: true,
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

const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useCommit', () => {
  let hookData

  function setup(provider, owner, repo, commitid) {
    server.use(
      graphql.query(`Commit`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )
    hookData = renderHook(
      () => useCommit({ provider, owner, repo, commitid }),
      {
        wrapper,
      }
    )
  }

  describe('when called and user is authenticated', () => {
    beforeEach(() => {
      setup('gh', 'febg', 'repo-test', 'a23sda3')
      return hookData.waitFor(() => hookData.result.current.isSuccess)
    })

    it('returns commit info', () => {
      const expectedResponse = {
        commit: {
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
          uploads: [
            {
              state: 'processed',
              provider: 'travis',
              createdAt: '2020-08-25T16:36:19.559474+00:00',
              updatedAt: '2020-08-25T16:36:19.679868+00:00',
              flags: [],
              downloadUrl:
                '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
              ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065746',
              uploadType: 'uploaded',
            },
            {
              state: 'processed',
              provider: 'travis',
              createdAt: '2020-08-25T16:36:25.820340+00:00',
              updatedAt: '2020-08-25T16:36:25.859889+00:00',
              flags: [],
              downloadUrl:
                '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/18b19f8d-5df6-48bd-90eb-50578ed8812f.txt',
              ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065763',
              uploadType: 'uploaded',
            },
          ],
          message: 'paths test',
          ciPassed: true,
          parent: {
            commitid: 'd773f5bc170caec7f6e64420b0967e7bac978a8f',
            totals: {
              coverage: 38.30846,
            },
          },
        },
      }
      expect(hookData.result.current.data).toEqual(expectedResponse)
    })
  })
})

describe('useCommitYaml', () => {
  let hookData

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
    hookData = renderHook(
      () => useCommitYaml({ provider, owner, repo, commitid }),
      {
        wrapper,
      }
    )
  }

  describe('when called and user is authenticated', () => {
    beforeEach(() => {
      setup('gh', 'febg', 'repo-test', 'a23sda3')
      return hookData.waitFor(() => hookData.result.current.isSuccess)
    })

    it('returns commit info', () => {
      expect(hookData.result.current.data).toEqual(yaml)
    })
  })
})

describe('useImpactedFiles', () => {
  let hookData

  function setup(compare) {
    server.use(
      graphql.query('impactedFiles', (req, res, ctx) => {
        return res(
          ctx.data({
            owner: {
              repository: {
                commit: {
                  compare,
                },
              },
            },
          })
        )
      })
    )
    hookData = renderHook(() => useImpactedFiles({}), { wrapper })
  }

  describe('when the hook is called and its loading', () => {
    beforeEach(() => {
      setup({
        compareWithParent: {
          state: 'PENDINNG',
        },
      })
    })

    it('returns loading true', () => {
      expect(hookData.result.current.loading).toBeTruthy()
    })
  })

  describe('when the hook is called and its not loading', () => {
    beforeEach(async () => {
      setup({
        compareWithParent: {
          state: 'PROCESSED',
        },
      })
      await hookData.waitFor(() => !hookData.result.current.loading)
    })

    it('returns loading true', () => {
      expect(hookData.result.current.loading).toBeFalsy()
    })
  })
})
