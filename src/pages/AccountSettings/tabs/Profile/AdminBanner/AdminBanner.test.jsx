import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import AdminBanner from './AdminBanner'

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/account/gh/codecov-user']}>
    <Route path="/account/:provider/:owner">{children}</Route>
  </MemoryRouter>
)

describe('AdminBanner', () => {
  describe('rendering component', () => {
    it('displays heading', async () => {
      render(<AdminBanner />, { wrapper })

      const heading = await screen.findByText('Managing users')

      expect(heading).toBeInTheDocument()
    })

    it('displays link to access page', async () => {
      render(<AdminBanner />, { wrapper })
      const link = await screen.findByText('admin management settings')

      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/admin/gh/access')
    })
  })
})
