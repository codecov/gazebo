import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import AdminBanner from './AdminBanner'

describe('AdminBanner', () => {
  function setup() {
    render(
      <MemoryRouter initialEntries={['/account/gh/codecov-user']}>
        <Route path="/account/:provider/:owner">
          <AdminBanner />
        </Route>
      </MemoryRouter>
    )
  }

  describe('rendering component', () => {
    beforeEach(() => {
      setup()
    })

    it('displays heading', async () => {
      const heading = await screen.findByText('Managing users')

      expect(heading).toBeInTheDocument()
    })

    it('displays link to access page', async () => {
      const link = await screen.findByText('admin management settings')

      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/admin/gh/access')
    })
  })
})
