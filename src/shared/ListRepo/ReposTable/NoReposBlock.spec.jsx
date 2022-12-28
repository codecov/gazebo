import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import { ActiveContext } from 'shared/context'

import NoReposBlock from './NoReposBlock'

describe('NoReposBlock', () => {
  function setup({ owner, repoDisplay }) {
    const props = {
      owner,
    }
    render(
      <MemoryRouter>
        <Route>
          <ActiveContext.Provider value={repoDisplay}>
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
        repoDisplay: 'Active',
      })
    })

    it('renders select the repo text', () => {
      const p = screen.getByText('Select the repo')
      expect(p).toBeInTheDocument()
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
        repoDisplay: 'Inactive',
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
