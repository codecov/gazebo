import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { ActiveContext } from 'shared/context'

import NoReposBlock from './NoReposBlock'

jest.mock('services/navigation', () => ({
  ...jest.requireActual('services/navigation'),
  useLocationParams: jest.fn(),
}))

const mockUpdateParams = jest.fn()

describe('NoReposBlock', () => {
  function setup({ owner, repoDisplay, urlParams = '' }) {
    const props = {
      owner,
    }
    useLocationParams.mockReturnValue({
      updateParams: mockUpdateParams,
      params: urlParams,
    })

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

    it('updates the params when clicking on select the repo text', () => {
      const p = screen.getByText('Select the repo')
      p.click()

      expect(mockUpdateParams).toBeCalledWith({
        repoDisplay: 'Inactive',
      })
    })

    it('renders the button the set up link', () => {
      const buttons = screen.getAllByText(/No repos setup yet/)
      expect(buttons.length).toBe(1)
    })

    it('updates the params when clicking on View repos for setup button', () => {
      const btn = screen.getByText('View repos for setup')
      btn.click()

      expect(mockUpdateParams).toBeCalledWith({
        repoDisplay: 'Inactive',
      })
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
