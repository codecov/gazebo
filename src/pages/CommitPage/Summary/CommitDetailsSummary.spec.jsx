import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import CommitDetailsSummary from './CommitDetailsSummary'
import { useCommitForSummary } from './hooks'

jest.mock('./hooks')

const commit = {
  totals: { coverage: 90.91 },
  state: 'complete',
  commitid: 'ca3fe8ad0632288b67909ba9793b00e5d109547b',
  pullId: null,
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
  message: 'Test commit message',
  ciPassed: true,
  parent: {
    commitid: 'fc43199b07c52cf3d6c19b7cdb368f74387c38ab',
    totals: { coverage: 100 },
  },
  compareWithParent: {
    state: 'processed',
    patchTotals: { coverage: 0.75 },
    impactedFiles: [
      {
        patchCoverage: { coverage: 75 },
        headName: 'flag1/mafs.js',
        baseCoverage: { coverage: 100 },
        headCoverage: { coverage: 90.9090909090909 },
      },
    ],
  },
}

const commitData = {
  changeCoverage: 95.09,
  headCommitId: 'ca3fe8ad0632288b67909ba9793b00e5d109547b',
  headCoverage: 90.91,
  parentCommitId: 'fc43199b07c52cf3d6c19b7cdb368f74387c38ab',
  patchCoverage: 75,
  state: 'complete',
}

describe('CommitDetailsSummary', () => {
  function setup({ commitData }) {
    useCommitForSummary.mockReturnValue(commitData)

    render(
      <MemoryRouter initialEntries={['/gh/test/test-repo/commit/abcd']}>
        <Route path="/:provider/:owner/:repo/commit/:commit">
          <CommitDetailsSummary />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered with valid fields', () => {
    beforeEach(() => {
      setup({ commitData })
    })

    it('renders a card for every valid field', () => {
      const headCardTitle = screen.getByText('HEAD')
      expect(headCardTitle).toBeInTheDocument()
      const headCardValue = screen.getByText(`90.91%`)
      expect(headCardValue).toBeInTheDocument()

      const patchCardTitle = screen.getByText('Patch')
      expect(patchCardTitle).toBeInTheDocument()
      const patchCardValue = screen.getByText(`75.00%`)
      expect(patchCardValue).toBeInTheDocument()

      const changeCardTitle = screen.getByText('Change')
      expect(changeCardTitle).toBeInTheDocument()
      const changeCardValue = screen.getByText(`95.09%`)
      expect(changeCardValue).toBeInTheDocument()
      expect(changeCardValue).toHaveClass("before:content-['+']")

      const sourceCardTitle = screen.getByText('Source')
      expect(sourceCardTitle).toBeInTheDocument()
      expect(screen.getByText(/Coverage data is based on/i)).toBeInTheDocument()
      expect(
        screen.getAllByText(commit.commitid.slice(0, 7))[1]
      ).toBeInTheDocument()
      expect(
        screen.getByText(commit.parent.commitid.slice(0, 7))
      ).toBeInTheDocument()
    })
  })

  describe('when rendered with state error', () => {
    beforeEach(() => {
      setup({ commitData: { ...commitData, state: 'ERROR' } })
    })

    it('renders error message', () => {
      expect(
        screen.getByText(/There is an error processing the coverage reports/)
      ).toBeInTheDocument()
    })

    it('suggests support links', () => {
      expect(
        screen.getByRole('link', { name: 'files paths external-link.svg' })
      ).toHaveAttribute('href', 'https://docs.codecov.com/docs/fixing-paths')
      expect(
        screen.getByRole('link', { name: 'reference external-link.svg' })
      ).toHaveAttribute('href', 'https://docs.codecov.com/docs/error-reference')
    })
  })
})
