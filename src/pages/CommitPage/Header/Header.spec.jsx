import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import { useCommit } from 'services/commit'

import Header from './Header'

jest.mock('services/commit')

const dataReturned = {
  commit: {
    totals: { coverage: 90.91 },
    state: 'complete',
    commitid: 'ca3fe8ad0632288b67909ba9793b00e5d109547b',
    pullId: 123,
    branchName: 'main',
    createdAt: '2022-03-10T19:14:13',
    author: { username: 'Rabee-AbuBaker' },
    uploads: [
      {
        state: 'PROCESSED',
        provider: null,
        createdAt: '2022-03-10T19:14:33.148945+00:00',
        updatedAt: '2022-03-10T19:14:33.347403+00:00',
        flags: [],
        jobCode: null,
        downloadUrl:
          '/upload/gh/Rabee-AbuBaker/another-test/download?path=v4/raw/2022-03-10/8D515A8AC57CA50377BBB7743D7BDB0B/ca3fe8ad0632288b67909ba9793b00e5d109547b/71a6b706-7135-43e3-9098-34bba60312c2.txt',
        ciUrl: null,
        uploadType: 'UPLOADED',
        buildCode: null,
        errors: [],
      },
      {
        state: 'PROCESSED',
        provider: null,
        createdAt: '2022-03-14T12:49:29.568415+00:00',
        updatedAt: '2022-03-14T12:49:30.157909+00:00',
        flags: [],
        jobCode: null,
        downloadUrl:
          '/upload/gh/Rabee-AbuBaker/another-test/download?path=v4/raw/2022-03-14/8D515A8AC57CA50377BBB7743D7BDB0B/ca3fe8ad0632288b67909ba9793b00e5d109547b/e83fec55-633d-4621-b509-35678628ffd0.txt',
        ciUrl: null,
        uploadType: 'UPLOADED',
        buildCode: null,
        errors: [],
      },
    ],
    message: 'Test commit',
    ciPassed: true,
    parent: {
      commitid: 'fc43199b07c52cf3d6c19b7cdb368f74387c38ab',
      totals: { coverage: 100 },
    },
    compareWithParent: {
      state: 'processed',
      patchTotals: { coverage: 75 },
      impactedFiles: [
        {
          patchCoverage: { coverage: 75 },
          headName: 'flag1/mafs.js',
          baseCoverage: { coverage: 100 },
          headCoverage: { coverage: 90.9090909090909 },
        },
      ],
    },
  },
}

describe('Header', () => {
  function setup(data) {
    useCommit.mockReturnValue(data)
    render(
      <MemoryRouter initialEntries={['/gh/test/test-repo/commit/abcd']}>
        <Route path="/:provider/:owner/:repo/commit/:commit">
          <Header />
        </Route>
      </MemoryRouter>
    )
  }

  describe('When rendered with valid values', () => {
    beforeEach(() => {
      setup({
        data: dataReturned,
      })
    })

    it('renders commit message', () => {
      expect(screen.getByText('Test commit')).toBeInTheDocument()
    })
    it('The summary header', () => {
      expect(screen.getByText(/authored commit/)).toBeInTheDocument()
    })
    it('renders commit id and link', () => {
      const commitLink = screen.getByRole('link', {
        name: /abcd/i,
      })
      expect(commitLink).toBeInTheDocument()
      expect(commitLink.href).toBe(
        'https://github.com/test/test-repo/commit/abcd'
      )
    })
    it('renders CI Passed', () => {
      expect(screen.getByText('CI Passed')).toBeInTheDocument()
    })
    it('renders branch name', () => {
      expect(screen.getByText('main')).toBeInTheDocument()
    })
    it('renders the pull label', () => {
      expect(screen.getByText(/pull-request-open.svg/)).toBeInTheDocument()
    })
  })

  describe('renders with patch', () => {
    beforeEach(() => {
      setup({
        data: {
          commit: { ...dataReturned.commit, pullId: null },
        },
      })
    })

    it('does not render the pull label', () => {
      expect(
        screen.queryByText(/pull-request-open.svg/)
      ).not.toBeInTheDocument()
    })
  })
})
