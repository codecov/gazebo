import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import AdminSettingsHeader from './AdminSettingsHeader'

describe('AdminSettingsHeader', () => {
  function setup({ initialEntries = [], path = '' }) {
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Route path={path}>
          <AdminSettingsHeader />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when on global admin', () => {
    beforeEach(() => {
      setup({
        initialEntries: ['/admin/gh/access'],
        path: '/admin/:provider/access',
      })
    })

    it('displays all orgs and repos link', () => {
      const link = screen.getByRole('link', { name: 'All orgs and repos' })
      expect(link).toBeInTheDocument()
    })

    it('links to the right location', () => {
      const link = screen.getByRole('link', { name: 'All orgs and repos' })
      expect(link).toHaveAttribute('href', '/gh')
    })

    it('displays admin', () => {
      const admin = screen.getByText('Admin')
      expect(admin).toBeInTheDocument()
    })
  })
})
