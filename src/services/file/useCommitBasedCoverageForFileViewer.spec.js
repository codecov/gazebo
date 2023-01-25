import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useCommitBasedCoverageForFileViewer } from './useCommitBasedCoverageForFileViewer'

const provider = 'gh'
const owner = 'codecov'
const repo = 'gazebo'
const path = 'path/to/file'
const commit = '123sha'

const mockFileMainCoverage = (coverage, flagNames) => ({
  owner: {
    repository: {
      commit: {
        commitId: '1',
        flagNames,
        coverageFile: { ...coverage },
      },
      branch: {
        name: 'main',
        head: {
          flagNames,
          commitId: '1',
          coverageFile: {
            ...coverage,
          },
        },
      },
    },
  },
})

const mockFileFlagCoverage = (coverage) => ({
  owner: {
    repository: {
      commit: {
        coverageFile: { ...coverage },
      },
      branch: {
        name: 'main',
        head: {
          ...coverage,
        },
      },
    },
  },
})

const queryClient = new QueryClient()
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh']}>
      <Route path="/:provider">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => server.listen())

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('useCommitBasedCoverageForFileViewer', () => {
  function setup({ mainCoverageData, coverageWithFlags, selectedFlags }) {
    server.use(
      graphql.query('CoverageForFile', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data(mockFileMainCoverage(mainCoverageData, selectedFlags))
        )
      ),
      graphql.query('CoverageForFileWithFlags', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data(mockFileFlagCoverage(coverageWithFlags, selectedFlags))
        )
      )
    )
  }

  describe('when flags are not selected', () => {
    const selectedFlags = []

    beforeEach(() => {
      const mainCoverageData = {
        content:
          'function add(a, b) {\n    return a + b;\n}\n\nfunction subtract(a, b) {\n    return a - b;\n}\n\nfunction multiply(a, b) {\n    return a * b;\n}\n\nfunction divide(a, b) {\n    if (b !== 0) {\n        return a / b;\n    } else {\n        return 0\n    }\n}\n\nmodule.exports = {add, subtract, multiply, divide};',
        coverage: [
          { line: 1, coverage: 'H' },
          { line: 2, coverage: 'H' },
          { line: 5, coverage: 'H' },
          { line: 6, coverage: 'H' },
          { line: 9, coverage: 'H' },
          { line: 10, coverage: 'H' },
          { line: 13, coverage: 'M' },
          { line: 14, coverage: 'P' },
          { line: 15, coverage: 'M' },
          { line: 16, coverage: 'M' },
          { line: 17, coverage: 'M' },
          { line: 21, coverage: 'H' },
        ],
        totals: { coverage: 53.43 },
        isCriticalFile: false,
        hashedPath: 'hashedPath',
      }
      const coverageWithFlags = {}

      setup({ mainCoverageData, coverageWithFlags, selectedFlags })
    })

    it('returns commit file coverage', async () => {
      const { result, waitForNextUpdate } = renderHook(
        () =>
          useCommitBasedCoverageForFileViewer({
            commit,
            path,
            repo,
            provider,
            owner,
            selectedFlags,
          }),
        {
          wrapper,
        }
      )

      await waitForNextUpdate()

      const expectedResult = {
        content:
          'function add(a, b) {\n    return a + b;\n}\n\nfunction subtract(a, b) {\n    return a - b;\n}\n\nfunction multiply(a, b) {\n    return a * b;\n}\n\nfunction divide(a, b) {\n    if (b !== 0) {\n        return a / b;\n    } else {\n        return 0\n    }\n}\n\nmodule.exports = {add, subtract, multiply, divide};',
        coverage: {
          1: 'H',
          10: 'H',
          13: 'M',
          14: 'P',
          15: 'M',
          16: 'M',
          17: 'M',
          2: 'H',
          21: 'H',
          5: 'H',
          6: 'H',
          9: 'H',
        },
        flagNames: [],
        hashedPath: 'hashedPath',
        isCriticalFile: false,
        totals: 53.43,
        isLoading: false,
      }

      expect(result.current).toEqual(expectedResult)
    })
  })

  describe('when flags are selected', () => {
    const selectedFlags = ['one', 'two']

    beforeEach(() => {
      const mainCoverageData = {
        content:
          'function add(a, b) {\n    return a + b;\n}\n\nfunction subtract(a, b) {\n    return a - b;\n}\n\nfunction multiply(a, b) {\n    return a * b;\n}\n\nfunction divide(a, b) {\n    if (b !== 0) {\n        return a / b;\n    } else {\n        return 0\n    }\n}\n\nmodule.exports = {add, subtract, multiply, divide};',
        coverage: [
          { line: 1, coverage: 'H' },
          { line: 2, coverage: 'H' },
        ],
        totals: { coverage: 23.43 },
        isCriticalFile: false,
        hashedPath: 'hashedPath',
      }

      const coverageWithFlags = {
        content:
          'function add(a, b) {\n    return a + b;\n}\n\nfunction subtract(a, b) {\n    return a - b;\n}\n\nfunction multiply(a, b) {\n    return a * b;\n}\n\nfunction divide(a, b) {\n    if (b !== 0) {\n        return a / b;\n    } else {\n        return 0\n    }\n}\n\nmodule.exports = {add, subtract, multiply, divide};',
        coverage: [
          { line: 1, coverage: 'H' },
          { line: 2, coverage: 'H' },
          { line: 3, coverage: 'H' },
          { line: 4, coverage: 'H' },
          { line: 5, coverage: 'H' },
          { line: 6, coverage: 'H' },
          { line: 7, coverage: 'M' },
        ],
        totals: { coverage: 13.63 },
        isCriticalFile: false,
        hashedPath: 'hashedPath',
      }
      setup({ mainCoverageData, coverageWithFlags, selectedFlags })
    })

    it('returns commit file coverage', async () => {
      const { result, waitFor } = renderHook(
        () =>
          useCommitBasedCoverageForFileViewer({
            commit,
            path,
            repo,
            provider,
            owner,
            selectedFlags,
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      const expectedResult = {
        content:
          'function add(a, b) {\n    return a + b;\n}\n\nfunction subtract(a, b) {\n    return a - b;\n}\n\nfunction multiply(a, b) {\n    return a * b;\n}\n\nfunction divide(a, b) {\n    if (b !== 0) {\n        return a / b;\n    } else {\n        return 0\n    }\n}\n\nmodule.exports = {add, subtract, multiply, divide};',
        coverage: {
          1: 'H',
          2: 'H',
          3: 'H',
          4: 'H',
          5: 'H',
          6: 'H',
          7: 'M',
        },
        totals: 13.63,
        flagNames: selectedFlags,
        isCriticalFile: false,
        hashedPath: 'hashedPath',
        isLoading: false,
      }

      expect(result.current).toEqual(expectedResult)
    })
  })
})
