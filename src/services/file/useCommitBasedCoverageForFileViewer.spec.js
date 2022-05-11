import { renderHook } from '@testing-library/react-hooks'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import {
  useCommitBasedCoverageForFileViewer,
  useCoverageWithFlags,
  useFileWithMainCoverage,
} from '.'

jest.mock('./useFileWithMainCoverage.js')
jest.mock('./useCoverageWithFlags.js')

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh']}>
    <Route path="/:provider">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const provider = 'gh'
const owner = 'codecov'
const repo = 'gazebo'
const path = 'path/to/file'
const commit = '123sha'

describe('useCommitBasedCoverageForFileViewer', () => {
  let hookData

  function setup({ mainCoverageData, coverageWithFlags, selectedFlags }) {
    useFileWithMainCoverage.mockReturnValue({ data: mainCoverageData })
    useCoverageWithFlags.mockReturnValue({ data: coverageWithFlags })
    hookData = renderHook(
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
  }

  describe('when flags are not selected', () => {
    let mainCoverageData
    let selectedFlags = []

    beforeEach(() => {
      mainCoverageData = {
        content:
          'function add(a, b) {\n    return a + b;\n}\n\nfunction subtract(a, b) {\n    return a - b;\n}\n\nfunction multiply(a, b) {\n    return a * b;\n}\n\nfunction divide(a, b) {\n    if (b !== 0) {\n        return a / b;\n    } else {\n        return 0\n    }\n}\n\nmodule.exports = {add, subtract, multiply, divide};',
        coverage: {
          1: 'H',
          2: 'H',
          5: 'H',
          6: 'H',
          9: 'H',
          10: 'H',
          13: 'M',
          14: 'P',
          15: 'M',
          16: 'M',
          17: 'M',
          21: 'H',
        },
        isLoading: false,
        totals: 53.43,
        flagNames: selectedFlags,
      }
      const coverageWithFlags = null
      setup({ mainCoverageData, coverageWithFlags, selectedFlags })
      return hookData.waitFor(() => hookData.result.current.isSuccess)
    })

    it('returns commit file coverage', () => {
      expect(hookData.result.current).toEqual(mainCoverageData)
    })
  })

  describe('when flags are selected', () => {
    let mainCoverageData
    let coverageWithFlags
    let selectedFlags = ['one', 'two']

    beforeEach(() => {
      mainCoverageData = {
        content:
          'function add(a, b) {\n    return a + b;\n}\n\nfunction subtract(a, b) {\n    return a - b;\n}\n\nfunction multiply(a, b) {\n    return a * b;\n}\n\nfunction divide(a, b) {\n    if (b !== 0) {\n        return a / b;\n    } else {\n        return 0\n    }\n}\n\nmodule.exports = {add, subtract, multiply, divide};',
        coverage: {
          1: 'H',
          2: 'H',
        },
        isLoading: false,
        totals: 23.43,
        flagNames: selectedFlags,
      }
      coverageWithFlags = {
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
        isLoading: false,
        totals: 13.63,
        flagNames: selectedFlags,
      }
      setup({ mainCoverageData, coverageWithFlags, selectedFlags })
      return hookData.waitFor(() => hookData.result.current.isSuccess)
    })

    it('returns commit file coverage', () => {
      coverageWithFlags.isLoading = undefined
      expect(hookData.result.current).toEqual(coverageWithFlags)
    })
  })
})
