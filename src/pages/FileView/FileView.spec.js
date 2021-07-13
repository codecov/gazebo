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

    it('renders toggles title', () => {
      expect(screen.getByText(/View coverage by:/)).toBeInTheDocument()
    })

    it('renders the breadcrumb', () => {
      expect(screen.getAllByText('src').length).toBe(2)
      expect(screen.getByText('specs')).toBeInTheDocument()
      expect(screen.getByText('config.js')).toBeInTheDocument()
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
      expect(screen.queryByText('specs')).not.toBeInTheDocument()
      expect(screen.queryByText('config.js')).not.toBeInTheDocument()
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
