import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import {
  useImpactedFilesComparison,
  usePull,
  useSingularImpactedFileComparison,
} from './hooks'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const pull = {
  pullId: 5,
  title: 'fix code',
  state: 'OPEN',
  updatestamp: '2021-03-03T17:54:07.727453',
  author: {
    username: 'landonorris',
  },
  head: {
    commitid: 'fc43199b07c52cf3d6c19b7cdb368f74387c38ab',
    totals: {
      coverage: 78.33,
    },
  },
  comparedTo: {
    commitid: '2d6c42fe217c61b007b2c17544a9d85840381857',
  },
  compareWithBase: {
    patchTotals: {
      coverage: 92.12,
    },
    changeWithParent: 38.94,
  },
}

const provider = 'gh'
const owner = 'codecov'
const repo = 'gazebo'

describe('usePull', () => {
  afterEach(() => queryClient.clear())
  let hookData

  function setup(data) {
    server.use(
      graphql.query('Pull', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(data))
      })
    )

    hookData = renderHook(() => usePull({ provider, owner, repo }), {
      wrapper,
    })
  }

  describe('when called', () => {
    beforeEach(() => {
      setup({
        owner: {
          isCurrentUserPartOfOrg: true,
          repository: {
            private: true,
            pull,
          },
        },
      })
    })

    it('renders isLoading true', () => {
      expect(hookData.result.current.isLoading).toBeTruthy()
    })

    describe('when data is loaded', () => {
      beforeEach(async () => {
        await hookData.waitFor(() => !hookData.result.current.isFetching)
      })

      it('returns the data', () => {
        expect(hookData.result.current.data).toEqual({
          hasAccess: true,
          ...pull,
        })
      })
    })
  })
  describe(`when user shouldn't have access`, () => {
    beforeEach(() => {
      setup({
        owner: {
          isCurrentUserPartOfOrg: false,
          repository: {
            private: true,
            pull,
          },
        },
      })
    })

    it('renders isLoading true', () => {
      expect(hookData.result.current.isLoading).toBeTruthy()
    })

    describe('when data is loaded', () => {
      beforeEach(async () => {
        await hookData.waitFor(() => !hookData.result.current.isFetching)
      })

      it('returns the data', () => {
        expect(hookData.result.current.data).toEqual({
          hasAccess: false,
          ...pull,
        })
      })
    })
  })
})

const mockImpactedFilesData = {
  patchTotals: {
    percentCovered: 1,
  },
  baseTotals: {
    percentCovered: 41.66667,
  },
  headTotals: {
    percentCovered: 92.30769,
  },
  impactedFiles: [
    {
      headName: 'file A',
      headCoverage: {
        percentCovered: 90.23,
      },
      baseCoverage: {
        percentCovered: 23.42,
      },
      patchCoverage: {
        percentCovered: 27.43,
      },
      changeCoverage: 58.333333333333336,
    },
  ],
}

const mockImpactedFilesWithEmptyHeadAndBaseCoverage = {
  patchTotals: {
    percentCovered: 1,
  },
  baseTotals: {
    percentCovered: 41.66667,
  },
  headTotals: {
    percentCovered: 92.30769,
  },
  impactedFiles: [
    {
      headName: 'file B',
      headCoverage: {
        percentCovered: undefined,
      },
      baseCoverage: {
        percentCovered: undefined,
      },
      patchCoverage: {
        percentCovered: 27.43,
      },
      changeCoverage: 58.333333333333336,
    },
  ],
}

describe('useImpactedFilesComparison', () => {
  afterEach(() => queryClient.clear())
  let hookData

  function setup(data) {
    server.use(
      graphql.query('ImpactedFilesComparison', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(data))
      })
    )

    hookData = renderHook(
      () => useImpactedFilesComparison({ provider, owner, repo, pullId: 10 }),
      {
        wrapper,
      }
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup({
        owner: {
          repository: {
            pull: {
              compareWithBase: mockImpactedFilesData,
            },
          },
        },
      })
    })

    it('renders isLoading true', () => {
      expect(hookData.result.current.isLoading).toBeTruthy()
    })

    describe('when data is loaded', () => {
      beforeEach(async () => {
        await hookData.waitFor(() => !hookData.result.current.isFetching)
      })

      it('returns the data', () => {
        expect(hookData.result.current.data).toEqual({
          impactedFiles: [
            {
              changeCoverage: 66.81,
              hasHeadOrPatchCoverage: true,
              headCoverage: 90.23,
              headName: 'file A',
              patchCoverage: 27.43,
            },
          ],
          pullBaseCoverage: 41.66667,
          pullHeadCoverage: 92.30769,
          pullPatchCoverage: 1,
        })
      })
    })
  })

  describe('when called without a numeric base and head coverage', () => {
    beforeEach(() => {
      setup({
        owner: {
          repository: {
            pull: {
              compareWithBase: mockImpactedFilesWithEmptyHeadAndBaseCoverage,
            },
          },
        },
      })
    })

    describe('when data is loaded', () => {
      beforeEach(() => {
        return hookData.waitFor(() => hookData.result.current.isSuccess)
      })

      it('returns the data', () => {
        expect(hookData.result.current.data).toEqual({
          impactedFiles: [
            {
              headCoverage: undefined,
              patchCoverage: 27.43,
              changeCoverage: NaN,
              hasHeadOrPatchCoverage: true,
              headName: 'file B',
              fileName: undefined,
            },
          ],
          pullHeadCoverage: 92.30769,
          pullPatchCoverage: 1,
          pullBaseCoverage: 41.66667,
        })
      })
    })
  })
})

const mockSingularImpactedFilesData = {
  headName: 'file A',
  isNewFile: true,
  isRenamedFile: false,
  isDeletedFile: false,
  isCriticalFile: false,
  headCoverage: {
    percentCovered: 90.23,
  },
  baseCoverage: {
    percentCovered: 23.42,
  },
  patchCoverage: {
    percentCovered: 27.43,
  },
  changeCoverage: 58.333333333333336,
  segments: [
    {
      header: '@@ -0,0 +1,45 @@',
      lines: [
        {
          baseNumber: null,
          headNumber: '1',
          baseCoverage: null,
          headCoverage: 'H',
          content: '+export default class Calculator {',
        },
        {
          baseNumber: null,
          headNumber: '2',
          baseCoverage: null,
          headCoverage: 'H',
          content: '+  private value = 0;',
        },
        {
          baseNumber: null,
          headNumber: '3',
          baseCoverage: null,
          headCoverage: 'H',
          content: '+  private calcMode = ""',
        },
      ],
    },
  ],
}

describe('useSingularImpactedFileComparison', () => {
  afterEach(() => queryClient.clear())
  let hookData

  function setup(data) {
    server.use(
      graphql.query('ImpactedFileComparison', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(data))
      })
    )

    hookData = renderHook(
      () =>
        useSingularImpactedFileComparison({
          provider,
          owner,
          repo,
          pullId: 10,
          path: 'someFile.js',
        }),
      {
        wrapper,
      }
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup({
        owner: {
          repository: {
            pull: {
              compareWithBase: {
                impactedFile: mockSingularImpactedFilesData,
              },
            },
          },
        },
      })
    })

    it('renders isLoading true', () => {
      expect(hookData.result.current.isLoading).toBeTruthy()
    })

    describe('when data is loaded', () => {
      beforeEach(async () => {
        await hookData.waitFor(() => !hookData.result.current.isFetching)
      })

      it('returns the data', () => {
        expect(hookData.result.current.data).toEqual({
          fileLabel: 'New',
          headName: 'file A',
          isCriticalFile: false,
          segments: [
            {
              header: '@@ -0,0 +1,45 @@',
              lines: [
                {
                  baseCoverage: null,
                  baseNumber: null,
                  content: '+export default class Calculator {',
                  headCoverage: 'H',
                  headNumber: '1',
                },
                {
                  baseCoverage: null,
                  baseNumber: null,
                  content: '+  private value = 0;',
                  headCoverage: 'H',
                  headNumber: '2',
                },
                {
                  baseCoverage: null,
                  baseNumber: null,
                  content: '+  private calcMode = ""',
                  headCoverage: 'H',
                  headNumber: '3',
                },
              ],
            },
          ],
        })
      })
    })
  })

  describe('when called with renamed file', () => {
    beforeEach(() => {
      const renamedImpactedFile = {
        headName: 'file A',
        isRenamedFile: true,
        isCriticalFile: false,
        segments: [],
      }
      setup({
        owner: {
          repository: {
            pull: {
              compareWithBase: {
                impactedFile: renamedImpactedFile,
              },
            },
          },
        },
      })
    })

    describe('when data is loaded', () => {
      beforeEach(async () => {
        await hookData.waitFor(() => !hookData.result.current.isFetching)
      })

      it('returns the data', () => {
        expect(hookData.result.current.data).toEqual({
          fileLabel: 'Renamed',
          headName: 'file A',
          isCriticalFile: false,
          segments: [],
        })
      })
    })
  })

  describe('when called with deleted file', () => {
    beforeEach(() => {
      const renamedImpactedFile = {
        headName: 'file A',
        isDeletedFile: true,
        isCriticalFile: false,
        segments: [],
      }
      setup({
        owner: {
          repository: {
            pull: {
              compareWithBase: {
                impactedFile: renamedImpactedFile,
              },
            },
          },
        },
      })
    })

    describe('when data is loaded', () => {
      beforeEach(async () => {
        await hookData.waitFor(() => !hookData.result.current.isFetching)
      })

      it('returns the data', () => {
        expect(hookData.result.current.data).toEqual({
          fileLabel: 'Deleted',
          headName: 'file A',
          isCriticalFile: false,
          segments: [],
        })
      })
    })
  })

  describe('when called with an unchanged file label', () => {
    beforeEach(() => {
      const renamedImpactedFile = {
        headName: 'file A',
        isNewFile: false,
        isRenamedFile: false,
        isDeletedFile: false,
        isCriticalFile: false,
        segments: [],
      }
      setup({
        owner: {
          repository: {
            pull: {
              compareWithBase: {
                impactedFile: renamedImpactedFile,
              },
            },
          },
        },
      })
    })

    describe('when data is loaded', () => {
      beforeEach(async () => {
        await hookData.waitFor(() => !hookData.result.current.isFetching)
      })

      it('returns the data', () => {
        expect(hookData.result.current.data).toEqual({
          fileLabel: null,
          headName: 'file A',
          isCriticalFile: false,
          segments: [],
        })
      })
    })
  })
})
