import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import ImpactedFiles from './ImpactedFiles'

const travisObject = {
  state: 'STARTED',
  provider: 'travis',
  createdAt: '2020-08-25T16:36:25.820340+00:00',
  updatedAt: '2020-08-25T16:36:25.859889+00:00',
  flags: [],
  downloadUrl:
    '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/18b19f8d-5df6-48bd-90eb-50578ed8812f.txt',
  ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065763',
  uploadType: 'uploaded',
  errors: [],
}

const circleciObject = {
  state: 'ERROR',
  provider: 'circleci',
  createdAt: '2020-08-25T16:36:19.559474+00:00',
  updatedAt: '2020-08-25T16:36:19.679868+00:00',
  flags: [],
  downloadUrl:
    '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
  ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065746',
  uploadType: 'uploaded',
  errors: [],
}

const mockCommitHasErrors = {
  uploads: [travisObject, circleciObject],
}

const mockCommit = {
  state: 'state?',
  compareWithParent: {
    impactedFiles: [
      {
        headName: 'src/index2.py',
        baseCoverage: {
          coverage: 62.5,
        },
        headCoverage: {
          coverage: 50.0,
        },
        patchCoverage: {
          coverage: 37.5,
        },
      },
    ],
  },
}

const wrapper =
  (initialEntries = ['/gh/codecov/cool-repo/commit']) =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/commit">{children}</Route>
      </MemoryRouter>
    )

describe('ImpactedFiles', () => {
  describe('when there is errored uploads', () => {
    it('displays error message', async () => {
      render(
        <ImpactedFiles commit={mockCommitHasErrors} commitSHA="sha256" />,
        {
          wrapper: wrapper(),
        }
      )

      const message = await screen.findByText(
        /We recommend checking the Codecov/
      )
      expect(message).toBeInTheDocument()
    })
  })

  describe('rendering with data', () => {
    it('displays commits table', async () => {
      render(<ImpactedFiles commit={mockCommit} commitSHA="sha256" />, {
        wrapper: wrapper(),
      })

      const head = await screen.findByText('HEAD')
      expect(head).toBeInTheDocument()
    })
  })
})
