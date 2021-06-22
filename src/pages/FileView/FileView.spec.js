import { render, screen } from '@testing-library/react'
import FileView from './FileView'
import { useOwner } from 'services/user'
import { MemoryRouter, Route } from 'react-router-dom'

jest.mock('services/user')

describe('FileView', () => {
  function setup(owner) {
    useOwner.mockReturnValue({
      data: owner,
    })
    render(
      <MemoryRouter
        initialEntries={['/gh/codecov/repo/src/controller/nav/controller.ts']}
      >
        <Route path="/:provider/:owner/:repo/*">
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

    it('renders the file view', () => {
      expect(screen.getByText(/file view/)).toBeInTheDocument()
    })

    it('renders the breadcrumb', () => {
      expect(screen.getByText('codecov')).toBeInTheDocument()
      expect(screen.getByText('repo')).toBeInTheDocument()
      expect(screen.getByText('src')).toBeInTheDocument()
      expect(screen.getByText('controller')).toBeInTheDocument()
      expect(screen.getByText('nav')).toBeInTheDocument()
      expect(screen.getByText('controller.ts')).toBeInTheDocument()
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
      expect(screen.queryByText('codecov')).not.toBeInTheDocument()
      expect(screen.queryByText('repo')).not.toBeInTheDocument()
      expect(screen.queryByText('src')).not.toBeInTheDocument()
      expect(screen.queryByText('controller')).not.toBeInTheDocument()
      expect(screen.queryByText('nav')).not.toBeInTheDocument()
      expect(screen.queryByText('controller.ts')).not.toBeInTheDocument()
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
