import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import { CommitStateEnum } from 'shared/utils/commit'

import { useIndirectChangedFilesTable } from './IndirectChangedFiles/hooks'
import IndirectChangesTab from './IndirectChangesTab'

jest.mock('./IndirectChangedFiles/hooks')
jest.mock(
  './IndirectChangedFiles/IndirectChangedFiles',
  () => () => 'IndirectChangedFiles Component'
)

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

describe('IndirectChangesTab', () => {
  function setup({ impactedFiles = mockImpactedFiles }) {
    useIndirectChangedFilesTable.mockReturnValue(impactedFiles)
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/pull/:pullId">
          <IndirectChangesTab />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered with impacted files', () => {
    beforeEach(() => {
      setup({})
    })
    it('renders the impacted files component', () => {
      expect(
        screen.getByText(/IndirectChangedFiles Component/)
      ).toBeInTheDocument()
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
        screen.queryByText('IndirectChangedFiles Component')
      ).not.toBeInTheDocument()
    })
  })

  describe('when rendered without impacted files or changes', () => {
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
    it('renders no impacted files text', () => {
      expect(
        screen.getByText('No Files covered by tests were changed')
      ).toBeInTheDocument()
      expect(
        screen.queryByText('IndirectChangedFiles Component')
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
          'Cannot display Impacted Files because most recent commit is in an error state.'
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
