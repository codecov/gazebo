import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import { CommitStateEnum } from 'shared/utils/commit'

import { useImpactedFilesTable } from './FilesChanged/hooks'
import Root from './Root'

jest.mock('./FilesChanged/hooks')
jest.mock('./FilesChanged/FilesChanged', () => () => 'Files Changed Component')

const mockImpactedFiles = {
  data: {
    headState: CommitStateEnum.COMPLETE,
    pullBaseCoverage: 41.66667,
    pullHeadCoverage: 92.30769,
    pullPatchCoverage: 1,
    impactedFiles: [
      {
        changeCoverage: 58.333333333333336,
        hasHeadOrPatchCoverage: true,
        headCoverage: 90.23,
        headName: 'flag1/mafs.js',
        patchCoverage: 27.43,
      },
    ],
  },
  isLoading: false,
}

const initialEntries = ['/gh/test-org/test-repo/pull/12']

describe('Root', () => {
  function setup({ impactedFiles = mockImpactedFiles }) {
    useImpactedFilesTable.mockReturnValue(impactedFiles)
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/pull/:pullId">
          <Root />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered with changed files', () => {
    beforeEach(() => {
      setup({})
    })
    it('renders the changed files component', () => {
      expect(screen.getByText('Files Changed Component')).toBeInTheDocument()
    })
  })

  describe('when rendered without changes', () => {
    beforeEach(() => {
      const impactedFiles = {
        data: {
          pullBaseCoverage: 41.66667,
          pullHeadCoverage: 92.30769,
          pullPatchCoverage: 1,
          impactedFiles: [],
        },
        isLoading: false,
      }
      setup({ impactedFiles })
    })
    it('renders no change text', () => {
      expect(
        screen.getByText(
          'Everything is accounted for! No changes detected that need to be reviewed.'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Lines, not adjusted in diff, that have changed coverage data.'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Files that introduced coverage data that had none before.'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Files that have missing coverage data that once were tracked.'
        )
      ).toBeInTheDocument()
      expect(
        screen.queryByText('ImpactedFiles Component')
      ).not.toBeInTheDocument()
    })
  })

  describe('when rendered without changed files or changes', () => {
    beforeEach(() => {
      const impactedFiles = {
        data: {
          pullBaseCoverage: null,
          pullHeadCoverage: null,
          pullPatchCoverage: null,
          impactedFiles: [],
        },
        isLoading: false,
      }
      setup({ impactedFiles })
    })
    it('renders no changed files text', () => {
      expect(
        screen.getByText('No Files covered by tests were changed')
      ).toBeInTheDocument()
      expect(
        screen.queryByText('ImpactedFiles Component')
      ).not.toBeInTheDocument()
    })
  })

  describe('when rendered with head commit errored out', () => {
    beforeEach(() => {
      const impactedFiles = {
        data: {
          headState: CommitStateEnum.ERROR,
        },
        isLoading: false,
      }
      setup({ impactedFiles })
    })
    it('renders no head commit error text', () => {
      expect(
        screen.getByText(
          'Cannot display Changed files because most recent commit is in an error state.'
        )
      ).toBeInTheDocument()
    })
  })

  describe('when loading data', () => {
    beforeEach(() => {
      const impactedFiles = {
        data: {
          headState: CommitStateEnum.ERROR,
        },
        isLoading: true,
      }
      setup({ impactedFiles })
    })

    it('shows loading spinner', () => {
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toBeInTheDocument()
    })
  })
})
