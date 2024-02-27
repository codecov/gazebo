import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { chain } from 'lodash/chain'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useFileWithMainCoverage } from 'services/pathContents'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh']}>
    <Route path="/:provider">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const provider = 'gh'

const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useFileWithMainCoverage', () => {
  function setup(dataReturned) {
    server.use(
      graphql.query('CoverageForFile', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )
  }

  describe('when called for commit', () => {
    const data = {
      owner: {
        repository: {
          commit: {
            commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
            flagNames: ['a', 'b'],
            coverageFile: {
              hashedPath: 'hashedPath',
              isCriticalFile: true,
              content:
                'import pytest\nfrom path1 import index\n\ndef test_uncovered_if():\n    assert index.uncovered_if() == False\n\ndef test_fully_covered():\n    assert index.fully_covered() == True\n\n\n\n\n',
              coverage: [
                {
                  line: 1,
                  coverage: 1,
                },
                {
                  line: 2,
                  coverage: 1,
                },
                {
                  line: 4,
                  coverage: 1,
                },
                {
                  line: 5,
                  coverage: 1,
                },
                {
                  line: 7,
                  coverage: 1,
                },
                {
                  line: 8,
                  coverage: 1,
                },
              ],
            },
          },
          branch: null,
        },
      },
    }
    beforeEach(() => {
      setup(data)
    })

    it('returns commit file coverage', async () => {
      const { result } = renderHook(
        () => useFileWithMainCoverage({ provider }),
        {
          wrapper,
        }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() =>
        expect(result.current.data).toEqual({
          ...data.owner.repository.commit.coverageFile,
          totals: 0,
          flagNames: ['a', 'b'],
          coverage: chain(data.owner.repository.commit.coverageFile.coverage)
            .keyBy('line')
            .mapValues('coverage')
            .value(),
        })
      )
    })
  })

  describe('when called for branch', () => {
    const data = {
      owner: {
        repository: {
          commit: null,
          branch: {
            name: 'master',
            head: {
              commitid: '98a8b5f3ed2553d1b08ea02b2a0c3a1c1e001cf2',
              coverageFile: {
                hashedPath: 'hashedPath',
                isCriticalFile: true,
                content:
                  'def uncovered_if(var=True):\n    if var:\n      return False\n    else:\n      return True\n\n\ndef fully_covered():\n    # Added a change here\n    return True\n\ndef uncovered():\n    return True\n\n',
                coverage: [
                  {
                    line: 1,
                    coverage: 1,
                  },
                  {
                    line: 2,
                    coverage: 1,
                  },
                  {
                    line: 3,
                    coverage: 1,
                  },
                  {
                    line: 5,
                    coverage: 0,
                  },
                  {
                    line: 8,
                    coverage: 1,
                  },
                  {
                    line: 10,
                    coverage: 1,
                  },
                  {
                    line: 12,
                    coverage: 1,
                  },
                  {
                    line: 13,
                    coverage: 0,
                  },
                ],
              },
            },
          },
        },
      },
    }
    beforeEach(() => {
      setup(data)
    })

    it('returns branch file coverage', async () => {
      const { result } = renderHook(
        () => useFileWithMainCoverage({ provider }),
        {
          wrapper,
        }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() =>
        expect(result.current.data).toEqual({
          ...data.owner.repository.branch.head.coverageFile,
          totals: 0,
          flagNames: [],
          isCriticalFile: true,
          coverage: chain(
            data.owner.repository.branch.head.coverageFile.coverage
          )
            .keyBy('line')
            .mapValues('coverage')
            .value(),
        })
      )
    })
  })
})
