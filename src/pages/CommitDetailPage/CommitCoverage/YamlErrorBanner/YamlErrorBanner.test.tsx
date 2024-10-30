import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import YamlErrorBanner from './YamlErrorBanner'

describe('YamlErrorBanner', () => {
  function setup() {
    render(
      <MemoryRouter initialEntries={[`/gh/codecov`]}>
        <Route path="/:provider/:owner">
          <YamlErrorBanner />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders heading of banner', () => {
      expect(screen.getByText(/YAML is invalid/)).toBeInTheDocument()
    })

    it('renders content', () => {
      expect(
        screen.getByText(
          /Coverage data is unable to be displayed, as the yaml appears to be invalid/
        )
      ).toBeInTheDocument()
    })
  })
})
