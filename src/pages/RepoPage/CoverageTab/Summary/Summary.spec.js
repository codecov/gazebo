import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import Summary from './Summary'

describe('Summary', () => {
  function setup() {
    render(
      <MemoryRouter initialEntries={['/gh/criticalrole/mightynein']}>
        <Route path="/:provider/:owner/:repo">
          <Summary />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when there is no coverage data to be shown', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the coderenderer', () => {
      expect(screen.getByText(/Fearne/)).toBeInTheDocument()
    })
  })
})
