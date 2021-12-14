import { render, screen } from 'custom-testing-library'
import NoReposBlock from './NoReposBlock.js'
import { MemoryRouter, Route } from 'react-router-dom'
import { ActiveContext } from 'shared/context'

describe('NoReposBlock', () => {
  function setup({ owner, active }) {
    const props = {
      owner,
    }
    render(
      <MemoryRouter>
        <Route>
          <ActiveContext.Provider value={active}>
            <NoReposBlock {...props} />
          </ActiveContext.Provider>
        </Route>
      </MemoryRouter>
    )
  }

  describe('when renderd with an owner and active repos', () => {
    beforeEach(() => {
      setup({
        owner: 'rula',
        active: true,
      })
    })

    it('renders the link select the repo', () => {
      const link = screen.getByRole('link', { name: 'Select the repo' })
      expect(link).toBeInTheDocument()
    })

    it('renders the button the set up link', () => {
      const buttons = screen.getAllByText(/No repos setup yet/)
      expect(buttons.length).toBe(1)
    })
  })

  describe('when renderd with an owner but no active repos', () => {
    beforeEach(() => {
      setup({
        owner: 'rula',
        active: false,
      })
    })

    it('displays the msg for no repos', () => {
      const msg = screen.queryByText(/You need to create repos first/)
      expect(msg).toBeInTheDocument()
    })

    it('does not render the button the set up link', () => {
      const buttons = screen.queryByText(/No repos setup yet/)
      expect(buttons).not.toBeInTheDocument()
    })
  })
})
