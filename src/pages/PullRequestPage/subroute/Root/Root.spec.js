import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import { usePull } from 'services/pull'

import Root from './Root'

jest.mock('services/pull')

const mockPullData = {
  isLoading: false,
  data: {
    pullId: 5,
    title: 'Calculator 3',
    state: 'OPEN',
    author: {
      username: 'terry-codecov',
    },
    updatestamp: '2022-02-15T20:45:43.438415',
    head: {
      commitid: '22e5019e06d2c707681666c05e550d39028d9760',
      totals: {
        percentCovered: 77.14,
      },
    },
    comparedTo: {
      commitid: '58422498718eec4e1c249e31724c08c44bfca56e',
    },
    compareWithBase: {
      patchTotals: {
        percentCovered: 0.7692308,
      },
      changeWithParent: -0.64,
      baseTotals: {
        percentCovered: 77.77778,
        fileCount: 1,
        lineCount: 9,
        hitsCount: 7,
        missesCount: 2,
        partialsCount: 0,
      },
      headTotals: {
        percentCovered: 77.14286,
        fileCount: 2,
        lineCount: 35,
        hitsCount: 27,
        missesCount: 8,
        partialsCount: 0,
      },
      fileComparisons: [
        {
          baseName: null,
          headName: 'src/calculator.ts',
          isNewFile: true,
          hasDiff: true,
          hasChanges: false,
          baseTotals: null,
          headTotals: {
            percentCovered: 76.92308,
            lineCount: 26,
            hitsCount: 20,
            missesCount: 6,
            partialsCount: 0,
          },
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
                {
                  baseNumber: null,
                  headNumber: '4',
                  baseCoverage: null,
                  headCoverage: 'H',
                  content:
                    '+  constructor(scientificMode = false, value = 0) {',
                },
                {
                  baseNumber: null,
                  headNumber: '5',
                  baseCoverage: null,
                  headCoverage: 'H',
                  content: '+    this.value = value',
                },
                {
                  baseNumber: null,
                  headNumber: '6',
                  baseCoverage: null,
                  headCoverage: null,
                  content: '+',
                },
                {
                  baseNumber: null,
                  headNumber: '7',
                  baseCoverage: null,
                  headCoverage: 'H',
                  content: '+    if(scientificMode) {',
                },
                {
                  baseNumber: null,
                  headNumber: '8',
                  baseCoverage: null,
                  headCoverage: 'M',
                  content: '+      this.calcMode = "science!"',
                },
                {
                  baseNumber: null,
                  headNumber: '9',
                  baseCoverage: null,
                  headCoverage: 'H',
                  content: '+    } else if(scientificMode && this.value > 0) {',
                },
                {
                  baseNumber: null,
                  headNumber: '10',
                  baseCoverage: null,
                  headCoverage: 'M',
                  content:
                    '+      this.calcMode = "I dont know I\'m just making a branching statement"',
                },
                {
                  baseNumber: null,
                  headNumber: '11',
                  baseCoverage: null,
                  headCoverage: null,
                  content: '+    } else {',
                },
                {
                  baseNumber: null,
                  headNumber: '12',
                  baseCoverage: null,
                  headCoverage: 'H',
                  content: '+      this.calcMode = "graphing"',
                },
                {
                  baseNumber: null,
                  headNumber: '13',
                  baseCoverage: null,
                  headCoverage: null,
                  content: '+    }',
                },
                {
                  baseNumber: null,
                  headNumber: '14',
                  baseCoverage: null,
                  headCoverage: null,
                  content: '+  }',
                },
                {
                  baseNumber: null,
                  headNumber: '15',
                  baseCoverage: null,
                  headCoverage: null,
                  content: '+',
                },
                {
                  baseNumber: null,
                  headNumber: '16',
                  baseCoverage: null,
                  headCoverage: 'H',
                  content: '+  get total() {',
                },
                {
                  baseNumber: null,
                  headNumber: '17',
                  baseCoverage: null,
                  headCoverage: 'H',
                  content: '+    return this.value',
                },
                {
                  baseNumber: null,
                  headNumber: '18',
                  baseCoverage: null,
                  headCoverage: null,
                  content: '+  }',
                },
                {
                  baseNumber: null,
                  headNumber: '19',
                  baseCoverage: null,
                  headCoverage: null,
                  content: '+',
                },
                {
                  baseNumber: null,
                  headNumber: '20',
                  baseCoverage: null,
                  headCoverage: 'H',
                  content: '+  get mode() {',
                },
                {
                  baseNumber: null,
                  headNumber: '21',
                  baseCoverage: null,
                  headCoverage: 'H',
                  content: '+    return this.calcMode',
                },
                {
                  baseNumber: null,
                  headNumber: '22',
                  baseCoverage: null,
                  headCoverage: null,
                  content: '+  }',
                },
                {
                  baseNumber: null,
                  headNumber: '23',
                  baseCoverage: null,
                  headCoverage: null,
                  content: '+',
                },
                {
                  baseNumber: null,
                  headNumber: '24',
                  baseCoverage: null,
                  headCoverage: 'H',
                  content: '+  plus = (num) => {',
                },
                {
                  baseNumber: null,
                  headNumber: '25',
                  baseCoverage: null,
                  headCoverage: 'H',
                  content: '+    this.value = this.value + num',
                },
                {
                  baseNumber: null,
                  headNumber: '26',
                  baseCoverage: null,
                  headCoverage: 'H',
                  content: '+    return this.total',
                },
                {
                  baseNumber: null,
                  headNumber: '27',
                  baseCoverage: null,
                  headCoverage: null,
                  content: '+  }',
                },
                {
                  baseNumber: null,
                  headNumber: '28',
                  baseCoverage: null,
                  headCoverage: null,
                  content: '+',
                },
                {
                  baseNumber: null,
                  headNumber: '29',
                  baseCoverage: null,
                  headCoverage: 'H',
                  content: '+  minus = (num) => {',
                },
                {
                  baseNumber: null,
                  headNumber: '30',
                  baseCoverage: null,
                  headCoverage: 'M',
                  content: '+    this.value = this.value - num',
                },
                {
                  baseNumber: null,
                  headNumber: '31',
                  baseCoverage: null,
                  headCoverage: 'M',
                  content: '+    return this.total',
                },
                {
                  baseNumber: null,
                  headNumber: '32',
                  baseCoverage: null,
                  headCoverage: null,
                  content: '+  }',
                },
                {
                  baseNumber: null,
                  headNumber: '33',
                  baseCoverage: null,
                  headCoverage: null,
                  content: '+',
                },
                {
                  baseNumber: null,
                  headNumber: '34',
                  baseCoverage: null,
                  headCoverage: null,
                  content: '+',
                },
                {
                  baseNumber: null,
                  headNumber: '35',
                  baseCoverage: null,
                  headCoverage: 'H',
                  content: '+  multiply = (num) => {',
                },
                {
                  baseNumber: null,
                  headNumber: '36',
                  baseCoverage: null,
                  headCoverage: 'M',
                  content: '+    this.value = this.value * num',
                },
                {
                  baseNumber: null,
                  headNumber: '37',
                  baseCoverage: null,
                  headCoverage: 'M',
                  content: '+    return this.total',
                },
                {
                  baseNumber: null,
                  headNumber: '38',
                  baseCoverage: null,
                  headCoverage: null,
                  content: '+  }',
                },
                {
                  baseNumber: null,
                  headNumber: '39',
                  baseCoverage: null,
                  headCoverage: null,
                  content: '+',
                },
                {
                  baseNumber: null,
                  headNumber: '40',
                  baseCoverage: null,
                  headCoverage: 'H',
                  content: '+  c = () => {',
                },
                {
                  baseNumber: null,
                  headNumber: '41',
                  baseCoverage: null,
                  headCoverage: 'H',
                  content: '+    this.value = 0',
                },
                {
                  baseNumber: null,
                  headNumber: '42',
                  baseCoverage: null,
                  headCoverage: 'H',
                  content: '+    return this.total',
                },
                {
                  baseNumber: null,
                  headNumber: '43',
                  baseCoverage: null,
                  headCoverage: null,
                  content: '+  }',
                },
                {
                  baseNumber: null,
                  headNumber: '44',
                  baseCoverage: null,
                  headCoverage: null,
                  content: '+  ',
                },
                {
                  baseNumber: null,
                  headNumber: '45',
                  baseCoverage: null,
                  headCoverage: null,
                  content: '+}',
                },
              ],
            },
          ],
        },
      ],
    },
    commits: {
      totalCount: 2,
      pageInfo: {
        hasNextPage: false,
        startCursor: 'MjAyMi0wMi0xNSAyMDo0NDozNi4xMzA5NTJ8MTk=',
        hasPreviousPage: false,
      },
      edges: [
        {
          node: {
            commitid: '96c47d090c98e970d5813339ffb1dec8c6fa52fa',
            message: 'calc mode',
            createdAt: '2022-02-15T20:44:11',
            author: {
              username: 'terry-codecov',
            },
          },
        },
        {
          node: {
            commitid: '22e5019e06d2c707681666c05e550d39028d9760',
            message: 'Drop testing subtract',
            createdAt: '2022-02-15T20:45:24',
            author: {
              username: 'terry-codecov',
            },
          },
        },
      ],
    },
  },
}

const mockPullDataNoFiles = {
  isLoading: false,
  data: {
    pullId: 5,
    title: 'Calculator 3',
    state: 'OPEN',
    author: {
      username: 'terry-codecov',
    },
    updatestamp: '2022-02-15T20:45:43.438415',
    head: {
      commitid: '22e5019e06d2c707681666c05e550d39028d9760',
      totals: {
        percentCovered: 77.14,
      },
    },
    comparedTo: {
      commitid: '58422498718eec4e1c249e31724c08c44bfca56e',
    },
    compareWithBase: {
      patchTotals: {
        percentCovered: 0.7692308,
      },
      changeWithParent: -0.64,
      baseTotals: {
        percentCovered: 77.77778,
        fileCount: 1,
        lineCount: 9,
        hitsCount: 7,
        missesCount: 2,
        partialsCount: 0,
      },
      headTotals: {
        percentCovered: 77.14286,
        fileCount: 2,
        lineCount: 35,
        hitsCount: 27,
        missesCount: 8,
        partialsCount: 0,
      },
      fileComparisons: [],
    },
    commits: {
      totalCount: 2,
      pageInfo: {
        hasNextPage: false,
        startCursor: 'MjAyMi0wMi0xNSAyMDo0NDozNi4xMzA5NTJ8MTk=',
        hasPreviousPage: false,
      },
      edges: [
        {
          node: {
            commitid: '96c47d090c98e970d5813339ffb1dec8c6fa52fa',
            message: 'calc mode',
            createdAt: '2022-02-15T20:44:11',
            author: {
              username: 'terry-codecov',
            },
          },
        },
        {
          node: {
            commitid: '22e5019e06d2c707681666c05e550d39028d9760',
            message: 'Drop testing subtract',
            createdAt: '2022-02-15T20:45:24',
            author: {
              username: 'terry-codecov',
            },
          },
        },
      ],
    },
  },
}

describe('Root', () => {
  function setup({ initialEntries = ['/gh/test-org/test-repo/pull/12'] }) {
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/pull/:pullId">
          <Root />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      usePull.mockReturnValue(mockPullData)

      setup({})
    })
    it('renders the name of a impacted file', () => {
      expect(screen.getByText(/src\/calculator.ts/i)).toBeInTheDocument()
    })
  })

  describe('No file changes', () => {
    beforeEach(() => {
      usePull.mockReturnValue(mockPullDataNoFiles)

      setup({})
    })

    it('renders without file changes', () => {
      expect(
        screen.getByText(
          /Everything is accounted for! No changes detected that need to be reviewed./
        )
      ).toBeInTheDocument()
    })
  })
})
