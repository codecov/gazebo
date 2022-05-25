import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import FullFile from './FullFile'

describe('FullFile', () => {
  function setup({ initialEntries = ['/fg/something/something/dark/side'] }) {
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/fg/:path+">
          <FullFile />
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
