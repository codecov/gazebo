import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import AdminSettingsSidebar from './AdminSettingsSidebar'

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/admin/gh/access']}>
    <Route path="/admin/:provider/access">{children}</Route>
  </MemoryRouter>
)

describe('AdminSettingsSidebar', () => {
  describe('when on global admin', () => {
    it('renders access link', () => {
      render(<AdminSettingsSidebar />, { wrapper })

      const link = screen.getByText('Access')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/admin/gh/access')
    })

    it('renders users link', () => {
      render(<AdminSettingsSidebar />, { wrapper })

      const link = screen.getByText('Users')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/admin/gh/users')
    })
  })
})
