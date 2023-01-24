import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { ActiveContext } from 'shared/context'

import ListRepo, { repoDisplayOptions } from './ListRepo'

jest.mock(
  './OrgControlTable/GithubPrivateScopeLogin',
  () => () => 'GithubPrivateScopeLogin'
)
jest.mock('./OrgControlTable/ResyncButton', () => () => 'ResyncButton')
jest.mock('./ReposTable', () => () => 'ReposTable')

describe('ListRepo', () => {
  let testLocation

  function setup(owner = null, url = '', path = '', repoDisplay = '') {
    render(
      <MemoryRouter initialEntries={[url]}>
        <ActiveContext.Provider value={repoDisplay}>
          <ListRepo owner={owner} canRefetch />
          <Route
            path={path}
            render={({ location }) => {
              testLocation = location
              return null
            }}
          />
        </ActiveContext.Provider>
      </MemoryRouter>
    )
  }

  describe('renders', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the children', () => {
      expect(screen.getByText(/Inactive/)).toBeInTheDocument()
    })

    it('renders the repo table', () => {
      expect(screen.getByText(/ReposTable/)).toBeInTheDocument()
    })
  })

  describe('reads URL parameters', () => {
    it('reads search parameter from URL', () => {
      setup(null, '?search=thisisaquery')
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

  describe('switches active/inactive/all repos', () => {
    it('switches to active repos', () => {
      setup(null, '/gh', '/:provider')
      screen
        .getByRole('button', {
          name: /Active/,
        })
        .click()
      expect(testLocation.state.repoDisplay).toEqual(
        expect.stringContaining('Active')
      )
    })

    it('switches to inactive repos', () => {
      setup(null, '/gh', '/:provider')
      screen
        .getByRole('button', {
          name: /Inactive/i,
        })
        .click()
      expect(testLocation.state.repoDisplay).toEqual(
        expect.stringContaining('Inactive')
      )
    })
    it('switches to all repos page', () => {
      setup(null, '/gh', '/:provider')
      screen
        .getByRole('button', {
          name: /All/,
        })
        .click()

      expect(testLocation.state.repoDisplay).toEqual(
        expect.stringContaining('All')
      )
    })

    it('switches to inactive repos owner page', () => {
      setup('owner', '/gh/hola', '/:provider/:owner')
      screen
        .getByRole('button', {
          name: /Inactive/,
        })
        .click()
      expect(testLocation.state.repoDisplay).toEqual(
        expect.stringContaining('Inactive')
      )
    })
    it('switches to active repos owner page', () => {
      setup('owner', '/gh/hola', '/:provider/:owner')
      screen
        .getByRole('button', {
          name: /Active/,
        })
        .click()
      expect(testLocation.state.repoDisplay).toEqual(
        expect.stringContaining('Active')
      )
    })
    it('switches to all repos owner page', () => {
      setup('owner', '/gh/owner', '/:provider/:owner')
      screen
        .getByRole('button', {
          name: /All/i,
        })
        .click()
      expect(testLocation.state.repoDisplay).toEqual(
        expect.stringContaining('All')
      )
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
      userEvent.click(screen.getByText('Most recent commit'))
    })

    it('renders the option user the custom rendered', () => {
      const options = screen.getAllByRole('option')
      userEvent.click(options[1])
      expect(testLocation.state.direction).toBe('DESC')
      expect(testLocation.state.ordering).toBe('NAME')
    })
  })

  describe('renders sorting options fo repos', () => {
    it('render sorting for all repos', () => {
      setup()

      const sortBtn = screen.getByRole('button', {
        name: 'Sort Order',
      })
      expect(sortBtn).toBeInTheDocument()

      sortBtn.click()

      const options = screen.getAllByRole('option')
      expect(options.length).toBe(2)
    })

    it('render sorting for active repos', () => {
      setup(null, '', '', repoDisplayOptions.ACTIVE.text)

      const sortBtn = screen.getByRole('button', {
        name: 'Sort Order',
      })
      expect(sortBtn).toBeInTheDocument()

      sortBtn.click()

      const options = screen.getAllByRole('option')
      expect(options.length).toBe(6)
    })

    it('render sorting for inactive repos', () => {
      setup(null, '', '', repoDisplayOptions.INACTIVE.text)

      const sortBtn = screen.getByRole('button', {
        name: 'Sort Order',
      })
      expect(sortBtn).toBeInTheDocument()

      sortBtn.click()

      const options = screen.getAllByRole('option')
      expect(options.length).toBe(2)
    })
  })
})
