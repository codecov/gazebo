import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import { useImpactedFilesComparison } from 'services/pull'

import ImpactedFiles from './ImpactedFiles'

jest.mock('services/pull')

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
        fileName: 'mafs.js',
        patchCoverage: 27.43,
      },
    ],
  },
}

describe('ImpactedFiles', () => {
  function setup({
    initialEntries = ['/gh/test-org/test-repo/pull/12'],
    impactedFiles = mockImpactedFiles,
  }) {
    useImpactedFilesComparison.mockReturnValue(impactedFiles)
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/pull/:pullId">
          <ImpactedFiles />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered with impacted files', () => {
    beforeEach(() => {
      setup({})
    })
    it('renders the headers of the impacted file table', () => {
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('HEAD')).toBeInTheDocument()
      expect(screen.getByText('file coverage %')).toBeInTheDocument()
      expect(screen.getByText('Patch %')).toBeInTheDocument()
      expect(screen.getByText('Change')).toBeInTheDocument()
    })
    it('renders the impacted files content', () => {
      expect(screen.getByText('mafs.js')).toBeInTheDocument()
      expect(screen.getByText('flag1/mafs.js')).toBeInTheDocument()
      expect(screen.getByText(/90.23%/i)).toBeInTheDocument()
      expect(screen.getByText(/27.43%/i)).toBeInTheDocument()
      expect(screen.getByText(/58.33%/i)).toBeInTheDocument()
    })
  })

  describe('when rendered without change', () => {
    beforeEach(() => {
      const impactedFiles = {
        data: {
          pullBaseCoverage: 41.66667,
          pullHeadCoverage: 92.30769,
          pullPatchCoverage: 1,
          impactedFiles: [
            {
              changeCoverage: 58.333333333333336,
              headCoverage: null,
              hasHeadAndPatchCoverage: false,
              headName: 'flag1/mafs.js',
              patchCoverage: 27.43,
            },
          ],
        },
      }
      setup({ impactedFiles })
    })
    it('renders no data available for the change', () => {
      expect(screen.getByText('No data available')).toBeInTheDocument()
    })
  })

  describe('when rendered with empty impacted files', () => {
    beforeEach(() => {
      const impactedFiles = {
        data: {
          pullBaseCoverage: 41.66667,
          pullHeadCoverage: 92.30769,
          pullPatchCoverage: 1,
          impactedFiles: [],
        },
      }
      setup({ impactedFiles })
    })
    it('renders the headers of the impacted file table', () => {
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('HEAD')).toBeInTheDocument()
      expect(screen.getByText('file coverage %')).toBeInTheDocument()
      expect(screen.getByText('Patch %')).toBeInTheDocument()
      expect(screen.getByText('Change')).toBeInTheDocument()
    })
  })
})
