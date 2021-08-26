import { render, screen } from '@testing-library/react'
import FileView from './FileView'
import { useOwner } from 'services/user'
import { useFileCoverage } from 'services/file/hooks'
import { MemoryRouter, Route } from 'react-router-dom'

jest.mock('services/user')
jest.mock('services/file/hooks')

describe('FileView', () => {
  function setup(owner) {
    useFileCoverage.mockReturnValue({
      data: {
        coverage: {
          1: 1,
          2: 0,
          3: 1,
          4: 1,
          5: 0,
          6: 1,
          7: 0,
          8: 1,
          9: 1,
          10: 1,
          11: 0,
        },
        content: 'content',
        totals: {
          coverage: 23,
        },
      },
    })
    useOwner.mockReturnValue({
      data: owner,
    })

    render(
      <MemoryRouter
        initialEntries={['/gh/codecov/repo-test/blob/master/src/index2.py']}
      >
        <Route path="/:provider/:owner/:repo/blob/:ref/*">
          <FileView />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when the owner exists', () => {
    beforeEach(() => {
      setup({
        username: 'codecov',
        isCurrentUserPartOfOrg: false,
      })
    })

    it('renders the breadcrumb', () => {
      expect(screen.getAllByText('src').length).toBe(2)
      expect(screen.getAllByText('index2.py').length).toBe(3)
    })
  })

  describe('when the owner doesnt exist', () => {
    beforeEach(() => {
      setup(null)
    })

    it('doesnt render the file view', () => {
      expect(screen.queryByText(/file view/)).not.toBeInTheDocument()
    })

    it('doesnt render the breadcrumb', () => {
      expect(screen.queryByText('src')).not.toBeInTheDocument()
      expect(screen.queryByText('index2.py')).not.toBeInTheDocument()
    })

    it('renders a not found error page', () => {
      expect(
        screen.getByRole('heading', {
          name: /not found/i,
        })
      ).toBeInTheDocument()
    })
  })
})
