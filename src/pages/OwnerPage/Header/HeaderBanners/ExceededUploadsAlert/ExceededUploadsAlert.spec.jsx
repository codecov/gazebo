import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import ExceededUploadsAlert from './ExceededUploadsAlert'

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov']}>
    <Route path="/:provider/:owner">{children}</Route>
  </MemoryRouter>
)

describe('ExceededUploadsAlert', () => {
  describe('rendering banner', () => {
    it('has header content', () => {
      render(<ExceededUploadsAlert />, { wrapper })

      const heading = screen.getByText('Upload limit has been reached')
      expect(heading).toBeInTheDocument()
    })

    it('has body content', () => {
      render(<ExceededUploadsAlert />, { wrapper })

      const body = screen.getByText(/This org is currently/)
      expect(body).toBeInTheDocument()
    })

    it('has links to upgrade org plan', () => {
      render(<ExceededUploadsAlert />, { wrapper })

      const links = screen.getAllByRole('link', { name: /upgrade plan/i })
      expect(links.length).toBe(2)
      expect(links[0]).toHaveAttribute('href', '/plan/gh/codecov/upgrade')
    })

    it('has link to email sales team', () => {
      render(<ExceededUploadsAlert />, { wrapper })

      const link = screen.getByRole('link', { name: /sales@codecov.io/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', 'https://about.codecov.io/sales')
    })
  })
})
