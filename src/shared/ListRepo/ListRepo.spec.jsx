import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import ListRepo from './ListRepo'

jest.mock(
  './OrgControlTable/GithubPrivateScopeLogin',
  () => () => 'GithubPrivateScopeLogin'
)
jest.mock('./OrgControlTable/ResyncButton', () => () => 'ResyncButton')
jest.mock('./ReposTable', () => () => 'ReposTable')

describe('ListRepo', () => {
  let testLocation

  function setup(owner = null, active = true, url = '', path = '') {
    render(
      <MemoryRouter initialEntries={[url]}>
        <ListRepo active={active} owner={owner} canRefetch />
        <Route
          path={path}
          render={({ location }) => {
            testLocation = location
            return null
          }}
        />
      </MemoryRouter>
    )
  }

  describe('renders', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the children', () => {
      expect(screen.getByText(/Enabled/)).toBeInTheDocument()
    })

    it('renders the repo table', () => {
      expect(screen.getByText(/ReposTable/)).toBeInTheDocument()
    })
  })

  describe('reads URL parameters', () => {
    it('reads search parameter from URL', () => {
      setup(null, false, '?search=thisisaquery')
      const input = screen.getByTestId('org-control-search')
      expect(input).toHaveValue('thisisaquery')
    })
    it('reads ordering & direction (ASC) parameter from URL', () => {
      setup(null, false, '?ordering=NAME&direction=ASC')
      const select = screen.getByRole('button', {
        name: /Sort Order/,
      })
      expect(select).toBeInTheDocument()
    })
    it('reads ordering & direction (DESC) parameter from URL', () => {
      setup(null, false, '?ordering=NAME&direction=DESC')
      const select = screen.getByRole('button', {
        name: /Sort Order/,
      })
      expect(select).toBeInTheDocument()
    })
    it('default fallback for ordering & direction parameter from URL', () => {
      setup(null, true, '?ordering=NAMEe&direction=DESC')
      const select = screen.getByRole('button', {
        name: /Sort Order/,
      })
      expect(select).toBeInTheDocument()
    })
  })

  describe('switches active/inactive repos', () => {
    it('switches to active repos', () => {
      setup(null, false, '/gh', '/:provider')
      screen
        .getByRole('button', {
          name: /enabled/i,
        })
        .click()
      expect(testLocation.pathname).toEqual(expect.not.stringContaining('+'))
    })
    it('switches to inactive repos', () => {
      setup(null, false, '/gh', '/:provider')
      screen
        .getByRole('button', {
          name: /Not yet setup/i,
        })
        .click()
      expect(testLocation.pathname).toEqual(expect.stringContaining('+'))
    })
    it('switches to active repos owner page', () => {
      setup('owner', false, '/gh', '/:provider/:owner')
      screen
        .getByRole('button', {
          name: /enabled/i,
        })
        .click()
      expect(testLocation.pathname).toEqual(expect.not.stringContaining('+'))
    })
    it('switches to inactive repos owner page', () => {
      setup('owner', false, '/gh', '/:provider/:owner')
      screen
        .getByRole('button', {
          name: /Not yet setup/i,
        })
        .click()
      expect(testLocation.pathname).toEqual(expect.stringContaining('+'))
    })
  })

  describe('update params after typing', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      setup()
      const searchInput = screen.getByRole('textbox', {
        name: /search/i,
      })
      userEvent.type(searchInput, 'search')
    })

    describe('after waiting some time', () => {
      beforeEach(() => {
        jest.advanceTimersByTime(600)
      })

      it('calls setSearchValue', () => {
        expect(testLocation.state.search).toBe('search')
      })
    })
  })

  describe('update params after usign select', () => {
    beforeEach(() => {
      setup()
      const button = screen.getByText('Most recent commit')
      userEvent.click(button)
    })

    it('renders the option user the custom rendered', () => {
      const options = screen.getAllByRole('option')
      userEvent.click(options[3])
      expect(testLocation.state.direction).toBe('ASC')
      expect(testLocation.state.ordering).toBe('COVERAGE')
    })
  })

  describe('renders sorting options for nin active repos', () => {
    it('render sorting for non active repos', () => {
      setup(null, false, '')
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBe(3)
    })
    it('render sorting for non active reposL', () => {
      setup(null, true, '')
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBe(3)
    })
  })
})
