import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import ImpactedFiles from './ImpactedFiles'

jest.mock('./CommitFileView.jsx', () => () => 'Commit File View')

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

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/cool-repo/commit']}>
    <Route path="/:provider/:owner/:repo/commit">{children}</Route>
  </MemoryRouter>
)

describe('ImpactedFiles', () => {
  describe('rendering with data', () => {
    it('displays commits table', async () => {
      render(<ImpactedFiles commit={mockCommit} commitSHA="sha256" />, {
        wrapper,
      })

      const head = await screen.findByText('HEAD')
      expect(head).toBeInTheDocument()
    })
  })

  describe('user can open and view code segments', () => {
    it('displays code segments', async () => {
      render(<ImpactedFiles commit={mockCommit} commitSHA="sha256" />, {
        wrapper,
      })

      const icon = await screen.findByText('chevron-right.svg')
      userEvent.click(icon)

      const commitFileView = await screen.findByText('Commit File View')
      expect(commitFileView).toBeInTheDocument()
    })
  })
})
