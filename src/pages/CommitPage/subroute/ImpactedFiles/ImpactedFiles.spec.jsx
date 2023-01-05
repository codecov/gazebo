import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import ImpactedFiles from './ImpactedFiles'

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
