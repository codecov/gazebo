import { render, screen, fireEvent, waitFor } from 'custom-testing-library'
import CommitPage from './CommitPage'
import { MemoryRouter, Route } from 'react-router-dom'
import { useCommit } from 'services/commit'

jest.mock('services/commit')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    provider: 'gh',
    owner: 'codecov',
    commit: 'f00162848a3cebc0728d915763c2fd9e92132408',
  }),
}))
const dataReturned = {
  commit: {
    totals: {
      coverage: 38.30846,
    },
    compareWithParent: {
      impactedFiles: [
        {
          path: 'src/index2.py',
          baseTotals: {
            coverage: 62.5,
          },
          compareTotals: {
            coverage: 50,
          },
          patch: {
            coverage: 37.5,
          },
        },
      ],
    },
    commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
    pullId: 10,
    createdAt: '2020-08-25T16:35:32',
    author: {
      username: 'febg',
    },
    uploads: [
      {
        state: 'processed',
        provider: 'travis',
        createdAt: '2020-08-25T16:36:19.559474+00:00',
        updatedAt: '2020-08-25T16:36:19.679868+00:00',
        flags: ['flagone'],
        downloadUrl:
          '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
        ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065746',
        uploadType: 'uploaded',
      },
      {
        state: 'processed',
        provider: 'travis',
        createdAt: '2020-08-25T16:36:25.820340+00:00',
        updatedAt: '2020-08-25T16:36:25.859889+00:00',
        flags: [],
        downloadUrl:
          '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/18b19f8d-5df6-48bd-90eb-50578ed8812f.txt',
        ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065763',
        uploadType: 'uploaded',
      },
    ],

    yaml: 'codecov:\n  max_report_age: false\n  require_ci_to_pass: true\ncomment:\n  behavior: default\n  layout: reach,diff,flags,tree,reach\n  show_carryforward_flags: false\ncoverage:\n  precision: 2\n  range:\n  - 70.0\n  - 100.0\n  round: down\n  status:\n    changes: false\n    default_rules:\n      flag_coverage_not_uploaded_behavior: include\n    patch:\n      default:\n        target: 80.0\n    project:\n      library:\n        paths:\n        - src/path1/.*\n        target: auto\n        threshold: 0.1\n      tests:\n        paths:\n        - src/path2/.*\n        target: 100.0\ngithub_checks:\n  annotations: true\n',
    message: 'paths test',
    ciPassed: true,
    parent: {
      commitid: 'd773f5bc170caec7f6e64420b0967e7bac978a8f',
      totals: {
        coverage: 38.30846,
      },
    },
  },
}

describe('CommitPage', () => {
  function setup(data) {
    useCommit.mockReturnValue(data)

    render(
      <MemoryRouter initialEntries={['/gh/test/test-repo/commit/abcd']}>
        <Route path="/:provider/:owner/:repo/commit/:commit/">
          <CommitPage />{' '}
        </Route>
      </MemoryRouter>
    )
  }

  describe('renders', () => {
    beforeEach(() => {
      setup({ data: dataReturned, isSuccess: true })
    })

    it('renders the Uploads', () => {
      expect(screen.getByText(/Uploads/)).toBeInTheDocument()
    })

    it('renders the Coverage report', () => {
      expect(screen.getByText(/Coverage report/)).toBeInTheDocument()
    })

    it('renders the Impacted files', () => {
      expect(screen.getByText(/Impacted files/)).toBeInTheDocument()
    })

    it('opens & close YAMl modal', () => {
      fireEvent.click(screen.getByText('view yml file'))
      expect(
        screen.getByText('Includes default yaml, global yaml, and repo')
      ).toBeInTheDocument()
      fireEvent.click(screen.getByText('view yml file'))
      fireEvent.click(screen.getByLabelText('Close'))
    })
  })
})

describe('CommitPage Not Found', () => {
  function setup(data) {
    useCommit.mockReturnValue(data)

    render(<CommitPage />, {
      wrapper: MemoryRouter,
    })
  }

  describe('renders 404', () => {
    beforeEach(() => {
      setup({ data: { commit: null }, isSuccess: false })
    })
    it('renders the Uploads', async () => {
      await waitFor(() =>
        expect(screen.getByText(/Not found/)).toBeInTheDocument()
      )
    })
  })

  describe('renders empty data', () => {
    beforeEach(() => {
      setup({ data: { commit: {} }, isSuccess: true })
    })
    it('renders the Uploads', () => {
      expect(screen.getByText(/Uploads/)).toBeInTheDocument()
    })
  })
})
