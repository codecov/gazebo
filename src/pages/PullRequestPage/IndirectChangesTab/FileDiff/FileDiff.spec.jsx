import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import { useSingularImpactedFileComparison } from 'services/pull'

import FileDiff from './FileDiff'

jest.mock('services/pull')

const mockImpactedFile = {
  data: {
    isCriticalFile: false,
    headName: 'flag1/mafs.js',
    segments: [
      {
        header: '-0,0 +1,45',
        hasUnintendedChanges: false,
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
  },
  isLoading: false,
}

describe('FileDiff', () => {
  function setup({ path, impactedFile = mockImpactedFile }) {
    useSingularImpactedFileComparison.mockReturnValue(impactedFile)
    render(
      <MemoryRouter initialEntries={['/gh/matt/exandria/pull/32']}>
        <Route path="/:provider/:owner/:repo/pull/:pullId">
          <FileDiff path={path} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({ path: 'flag1/mafs.js' })
    })
    it('renders the line changes header', () => {
      expect(screen.getByText('-0,0 +1,45')).toBeInTheDocument()
    })
    it('renders the lines of a segment', () => {
      expect(screen.getByText(/Calculator/)).toBeInTheDocument()
      expect(screen.getByText(/value/)).toBeInTheDocument()
      expect(screen.getByText(/calcMode/)).toBeInTheDocument()
    })
  })

  describe('when coverage has changed outside of the git diff', () => {
    beforeEach(() => {
      const impactedFile = {
        data: {
          isCriticalFile: false,
          headName: 'flag1/mafs.js',
          segments: [
            {
              header: '-0,0 +1,48',
              hasUnintendedChanges: true,
              lines: [{ content: 'abc' }, { content: 'def' }],
            },
          ],
        },
      }
      setup({ path: 'flag1/mafs.js', impactedFile })
    })
    it('renders unexpected changes', () => {
      expect(screen.getByText(/indirect coverage change/i)).toBeInTheDocument()
    })
  })

  describe('when segment is an empty array', () => {
    beforeEach(() => {
      const impactedFile = {
        data: {
          isCriticalFile: false,
          headName: 'flag1/mafs.js',
          segments: [],
        },
      }
      setup({ path: 'flag1/mafs.js', impactedFile })
    })
    it('doesnt render information on the code renderer', () => {
      expect(screen.queryByText(/Unexpected Changes/i)).not.toBeInTheDocument()
      expect(screen.queryByText('fv-diff-line')).not.toBeInTheDocument()
    })
  })

  describe('a new file', () => {
    beforeEach(() => {
      const impactedFile = {
        data: {
          isCriticalFile: false,
          fileLabel: 'New',
          headName: 'flag1/mafs.js',
          segments: [{ lines: [{ content: 'abc' }, { content: 'def' }] }],
        },
      }
      setup({ path: 'flag1/mafs.js', impactedFile })
    })
    it('renders a new file label', () => {
      expect(screen.getByText(/New/i)).toBeInTheDocument()
    })
  })

  describe('a renamed file', () => {
    beforeEach(() => {
      const impactedFile = {
        data: {
          isCriticalFile: false,
          fileLabel: 'Renamed',
          headName: 'flag1/mafs.js',
          segments: [{ lines: [{ content: 'abc' }, { content: 'def' }] }],
        },
      }
      setup({ path: 'flag1/mafs.js', impactedFile })
    })
    it('renders a renamed file label', () => {
      expect(screen.getByText(/Renamed/i)).toBeInTheDocument()
    })
  })

  describe('a deleted file', () => {
    beforeEach(() => {
      const impactedFile = {
        data: {
          isCriticalFile: false,
          fileLabel: 'Deleted',
          headName: 'flag1/mafs.js',
          segments: [{ lines: [{ content: 'abc' }, { content: 'def' }] }],
        },
      }
      setup({ path: 'flag1/mafs.js', impactedFile })
    })
    it('renders a deleted file label', () => {
      expect(screen.getByText(/Deleted/i)).toBeInTheDocument()
    })
  })

  describe('a critical file', () => {
    beforeEach(() => {
      const impactedFile = {
        data: {
          isCriticalFile: true,
          fileLabel: null,
          headName: 'flag1/mafs.js',
          segments: [{ lines: [{ content: 'abc' }, { content: 'def' }] }],
        },
      }
      setup({ path: 'flag1/mafs.js', impactedFile })
    })
    it('renders a critical file label', () => {
      expect(screen.getByText(/Critical File/i)).toBeInTheDocument()
    })
  })

  describe('when isLoading is true', () => {
    beforeEach(() => {
      const impactedFile = {
        data: {},
        isLoading: true,
      }
      setup({ path: 'flag1/mafs.js', impactedFile })
    })

    it('shows loading spinner', () => {
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toBeInTheDocument()
    })
  })
})
