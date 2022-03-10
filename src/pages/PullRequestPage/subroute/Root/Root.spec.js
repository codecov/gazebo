import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import Root from './Root'

describe('Root', () => {
  function setup({ initialEntries = ['/gh/test-org/test-repo/pull/12'] }) {
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/pull/:pullid">
          <Root />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({})
    })
    it('renders the pull id', () => {
      expect(
        screen.getByRole('heading', {
          name: /Root/i,
        })
      ).toBeInTheDocument()
      expect(screen.getByText(/12/i)).toBeInTheDocument()
    })
  })
})
