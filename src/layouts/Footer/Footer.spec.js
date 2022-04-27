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
      jest.useFakeTimers().setSystemTime(new Date('3301-01-01'))
      setup()
    })
    afterAll(() => {
      jest.useRealTimers()
    })

    it('renders a link', () => {
      const copywrite = screen.getByText(`© 3301 Codecov`)
      expect(copywrite).toBeInTheDocument()
    })
  })
})
