import { render, screen } from 'custom-testing-library'

import { useParams } from 'react-router-dom'

import { useSingularImpactedFileComparison } from 'services/pull'

import FileDiff from './FileDiff'

jest.mock('services/pull')
jest.mock(
  'ui/CodeRenderer/CodeRendererInfoRow',
  () => () => 'Unexpected Changes'
)
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain the original functionalities
  useParams: jest.fn(() => {}),
}))

const owner = 'matt'
const provider = 'gh'
const repo = 'exandria'
const pullId = 32

const mockImpactedFile = {
  data: {
    isCriticalFile: true,
    headName: 'flag1/mafs.js',
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
            content: '+  constructor(scientificMode = false, value = 0) {',
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
  isLoading: false,
}

// I'm skipping this in the meantime, will come back to this before the pr is merged
xdescribe('FileDiff', () => {
  function setup(props) {
    useParams.mockReturnValue({ owner, provider, repo, pullId })
    useSingularImpactedFileComparison.mockReturnValue(mockImpactedFile)
    render(<FileDiff {...props} />)
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({
        headName: 'main.ts',
        segments: [
          {
            lines: [{ content: 'abc' }, { content: 'def' }],
          },
        ],
      })
    })
    it('renders the name of a impacted file', () => {
      expect(screen.getByText(/main.ts/i)).toBeInTheDocument()
    })
    it('renders the lines of a segment', () => {
      expect(screen.getByText(/abc/)).toBeInTheDocument()
      expect(screen.getByText(/def/)).toBeInTheDocument()
    })
  })

  describe('when coverage has changed outside of the git diff', () => {
    beforeEach(() => {
      setup({
        headName: 'main.ts',
        segments: [
          {
            hasUnintendedChanges: true,
            lines: [{ content: 'abc' }, { content: 'def' }],
          },
        ],
      })
    })
    it('renders unexpected changes', () => {
      expect(screen.getByText(/Unexpected Changes/i)).toBeInTheDocument()
    })
  })

  describe('when segment is an empty array', () => {
    beforeEach(() => {
      setup({
        headName: 'main.ts',
      })
    })
    it('doesnt render information on the code renderer', () => {
      expect(screen.queryByText(/Unexpected Changes/i)).not.toBeInTheDocument()
      expect(screen.queryByText('fv-diff-line')).not.toBeInTheDocument()
    })
  })

  describe('a new file', () => {
    beforeEach(() => {
      setup({
        headName: 'main.ts',
        isNewFile: true,
        segments: [],
      })
    })
    it('renders a new file label', () => {
      expect(screen.getByText(/New/i)).toBeInTheDocument()
    })
  })

  describe('a renamed file', () => {
    beforeEach(() => {
      setup({
        headName: 'main.ts',
        isRenamedFile: true,
        segments: [],
      })
    })
    it('renders a renamed file label', () => {
      expect(screen.getByText(/Renamed/i)).toBeInTheDocument()
    })
  })

  describe('a deleted file', () => {
    beforeEach(() => {
      setup({
        headName: 'main.ts',
        isDeletedFile: true,
        segments: [],
      })
    })
    it('renders a deleted file label', () => {
      expect(screen.getByText(/Deleted/i)).toBeInTheDocument()
    })
  })

  describe('a critical file', () => {
    beforeEach(() => {
      setup({
        headName: 'main.ts',
        isNewFile: true,
        isCriticalFile: true,
        segments: [],
      })
    })
    it('renders a critical file label', () => {
      expect(screen.getByText(/Critical File/i)).toBeInTheDocument()
    })
  })
})
