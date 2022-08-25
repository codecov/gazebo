import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import useImpactedFilesTable from './ImpactedFiles/hooks'
import Root from './Root'

jest.mock('./ImpactedFiles/hooks')
jest.mock(
  './ImpactedFiles/ImpactedFiles',
  () => () => 'ImpactedFiles Component'
)

const mockImpactedFiles = {
  data: {
    pullBaseCoverage: 41.66667,
    pullHeadCoverage: 92.30769,
    pullPatchCoverage: 1,
    impactedFiles: [
      {
        changeCoverage: 58.333333333333336,
        hasHeadAndPatchCoverage: true,
        headCoverage: 90.23,
        headName: 'flag1/mafs.js',
        patchCoverage: 27.43,
      },
    ],
  },
  isLoading: false,
}

describe('Root', () => {
  function setup({
    initialEntries = ['/gh/test-org/test-repo/pull/12'],
    impactedFiles = mockImpactedFiles,
  }) {
    useImpactedFilesTable.mockReturnValue(impactedFiles)
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/pull/:pullId">
          <Root />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered with impacted files', () => {
    beforeEach(() => {
      setup({})
    })
    it('renders the name of the header and coverage labels', () => {
      expect(screen.getByText('Impacted Files')).toBeInTheDocument()
      expect(screen.getByText('covered')).toBeInTheDocument()
      expect(screen.getByText('partial')).toBeInTheDocument()
      expect(screen.getByText('uncovered')).toBeInTheDocument()
    })
    it('renders the impacted files component', () => {
      expect(screen.getByText('ImpactedFiles Component')).toBeInTheDocument()
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
        screen.queryByText('ImpactedFiles Component')
      ).not.toBeInTheDocument()
    })
  })
})
