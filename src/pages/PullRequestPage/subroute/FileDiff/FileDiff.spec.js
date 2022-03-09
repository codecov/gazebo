import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import FileDiff from './FileDiff'

describe('FileDiff', () => {
  function setup({ initialEntries = ['/fg/something/something/dark/side'] }) {
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/fg/:path+">
          <FileDiff />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({})
    })
    it('renders the path', () => {
      expect(
        screen.getByText(/something\/something\/dark\/side/i)
      ).toBeInTheDocument()
    })
  })
})
