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
  describe('when on org specific admin', () => {
    beforeEach(() => {
      setup({
        initialEntries: ['/admin/gh/codecov/access'],
        path: '/admin/:provider/:owner/access',
      })
    })

    it('displays codecov link', () => {
      const link = screen.getByRole('link', { name: 'codecov' })
      expect(link).toBeInTheDocument()
    })

    it('links to the right location', () => {
      const link = screen.getByRole('link', { name: 'codecov' })
      expect(link).toHaveAttribute('href', '/gh/codecov')
    })

    it('displays admin', () => {
      const admin = screen.getByText('Admin')
      expect(admin).toBeInTheDocument()
    })
  })
})
