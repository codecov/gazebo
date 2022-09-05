import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import AdminSettings from './AdminSettings'

describe('AdminSettings', () => {
  function setup({ initialEntries = [], path = '' }) {
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Route path={path}>
          <AdminSettings />
        </Route>
      </MemoryRouter>
    )
  }

  describe('renders access page', () => {
    beforeEach(() => {
      setup({
        initialEntries: ['/admin/gh/access'],
        path: '/admin/:provider/access',
      })
    })

    it('renders access page', () => {
      const text = screen.getByText('gh access')
      expect(text).toBeInTheDocument()
    })
  })

  describe('renders users page', () => {
    beforeEach(() => {
      setup({
        initialEntries: ['/admin/gh/users'],
        path: '/admin/:provider/users',
      })
    })

    it('renders users page', () => {
      const text = screen.getByText('gh users')
      expect(text).toBeInTheDocument()
    })
  })
})
