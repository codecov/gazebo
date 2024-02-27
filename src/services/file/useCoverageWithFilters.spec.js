import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { chain } from 'lodash/chain'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useCoverageWithFilters } from '.'

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

describe('useCoverageWithFilters', () => {
  function setup(dataReturned) {
    server.use(
      graphql.query('CoverageForFileWithFilters', (req, res, ctx) => {
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
            componentNames: ['c'],
            coverageFile: {
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
        () => useCoverageWithFilters({ provider }),
        {
          wrapper,
        }
      )

      await waitFor(() => result.current.isSuccess)

      await waitFor(() =>
        expect(result.current.data).toEqual({
          ...data.owner.repository.commit.coverageFile,
          totals: 0,
          flagNames: ['a', 'b'],
          componentNames: ['c'],
          coverage: chain(data.owner.repository.commit.coverageFile.coverage)
            .keyBy('line')
            .mapValues('coverage')
            .value(),
          isCriticalFile: false,
        })
      )
    })
  })
})
