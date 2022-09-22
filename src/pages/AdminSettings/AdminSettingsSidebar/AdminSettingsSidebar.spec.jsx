import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import AdminSettingsSidebar from './AdminSettingsSidebar'

describe('AdminSettingsSidebar', () => {
  function setup({ initialEntries = [], path = '' }) {
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Route path={path}>
          <AdminSettingsSidebar />
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

    it('renders access link', () => {
      const link = screen.getByText('Access')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/admin/gh/access')
    })

    it('renders users link', () => {
      const link = screen.getByText('Users')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/admin/gh/users')
    })
  })
})
