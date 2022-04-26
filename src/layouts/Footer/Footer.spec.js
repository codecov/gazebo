import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import Footer from './Footer'

describe('Footer', () => {
  function setup() {
    render(
      <MemoryRouter initialEntries={['/bb/critical-role/bells-hells']}>
        <Route path="/:provider/:owner/:repo">
          <Footer />
        </Route>
      </MemoryRouter>
    )
  }

  describe('renders the current years copywrite', () => {
    beforeEach(() => {
      setup()
    })

    it('renders a link', () => {
      const year = new Date().getFullYear()
      const copywrite = screen.getByText(`© ${year} Codecov`)
      expect(copywrite).toBeInTheDocument()
    })
  })
})
