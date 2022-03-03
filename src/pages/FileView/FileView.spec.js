import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useFileWithMainCoverage } from 'services/file/hooks'
import { useOwner } from 'services/user'

import FileView from './FileView'

jest.mock('services/user')
jest.mock('services/file/hooks')

describe('FileView', () => {
  function setup(owner, overProps) {
    useFileWithMainCoverage.mockReturnValue({
      data: {
        coverage: {
          1: 'M',
          2: 'H',
          3: 'M',
          4: 'M',
          5: 'H',
          6: 'M',
          7: 'H',
          8: 'M',
          9: 'M',
          10: 'M',
          11: 'H',
        },
        content: 'content',
        totals: 23,
        flagNames: [],
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

    it('renders the navigation breadcrumb', () => {
      expect(screen.getByText(/codecov/)).toBeInTheDocument()
      expect(screen.getByText(/repo-test/)).toBeInTheDocument()
      expect(screen.getByText(/master/)).toBeInTheDocument()
    })

    it('renders the title and path breadcrumb', () => {
      expect(screen.getByText(/src/)).toBeInTheDocument()
      expect(screen.getAllByText(/index2.py/).length).toBe(1)
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
