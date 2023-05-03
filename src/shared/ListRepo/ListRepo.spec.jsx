import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { ActiveContext } from 'shared/context'

import ListRepo, { repoDisplayOptions } from './ListRepo'

jest.mock(
  './OrgControlTable/GithubPrivateScopeLogin',
  () => () => 'GithubPrivateScopeLogin'
)
jest.mock('./OrgControlTable/RepoOrgNotFound', () => () => 'RepoOrgNotFound')
jest.mock('./ReposTable', () => () => 'ReposTable')

let testLocation

const wrapper =
  ({ url = '', path = '', repoDisplay = '' } = {}) =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={[url]}>
        <ActiveContext.Provider value={repoDisplay}>
          {children}
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

describe('ListRepo', () => {
  function setup() {
    const user = userEvent.setup()

    return { user }
  }

  describe('renders', () => {
    it('renders the children', () => {
      render(<ListRepo canRefetch />, {
        wrapper: wrapper(),
      })

      expect(screen.getByText(/Inactive/)).toBeInTheDocument()
    })

    it('renders the repo table', () => {
      render(<ListRepo canRefetch />, {
        wrapper: wrapper(),
      })

      expect(screen.getByText(/ReposTable/)).toBeInTheDocument()
    })
  })

  describe('reads URL parameters', () => {
    it('reads search parameter from URL', () => {
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({ url: '?search=thisisaquery' }),
      })

      const input = screen.getByTestId('org-control-search')
      expect(input).toHaveValue('thisisaquery')
    })

    it('reads ordering & direction (ASC) parameter from URL', () => {
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({ url: '?ordering=NAME&direction=ASC' }),
      })

      const sortOption = screen.getByText('Name [A-Z]')
      expect(sortOption).toBeInTheDocument()
    })

    it('reads ordering & direction (DESC) parameter from URL', () => {
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({ url: '?ordering=NAME&direction=DESC' }),
      })

      const sortOption = screen.getByText('Name [Z-A]')
      expect(sortOption).toBeInTheDocument()
    })

    it('default fallback for ordering & direction parameter from URL', () => {
      render(<ListRepo canRefetch />, {
        wrapper: wrapper(),
      })

      const sortOption = screen.getByText('Most recent commit')
      expect(sortOption).toBeInTheDocument()
    })
  })

  describe('switches active/inactive/all repos', () => {
    it('switches to active repos', async () => {
      const { user } = setup()
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({ url: '/gh', path: '/:provider' }),
      })

      const button = screen.getByRole('button', {
        name: /Active/,
      })
      await user.click(button)
      expect(testLocation.state.repoDisplay).toEqual(
        expect.stringContaining('Active')
      )
    })

    it('switches to inactive repos', async () => {
      const { user } = setup()
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({ url: '/gh', path: '/:provider' }),
      })

      const button = screen.getByRole('button', {
        name: /Inactive/,
      })
      await user.click(button)
      expect(testLocation.state.repoDisplay).toEqual(
        expect.stringContaining('Inactive')
      )
    })

    it('switches to active repos owner page', async () => {
      const { user } = setup()
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({
          url: '/gh/hola',
          path: '/:provider/:owner',
        }),
      })
      const button = screen.getByRole('button', {
        name: /Active/,
      })
      await user.click(button)
      expect(testLocation.state.repoDisplay).toEqual(
        expect.stringContaining('Active')
      )
    })

    it('switches to all repos owner page', async () => {
      const { user } = setup()
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({
          url: '/gh/hola',
          path: '/:provider/:owner',
        }),
      })

      const button = screen.getByRole('button', {
        name: /All/,
      })
      await user.click(button)
      expect(testLocation.state.repoDisplay).toEqual(
        expect.stringContaining('All')
      )
    })
  })

  describe('update params after typing', () => {
    it('calls setSearchValue', async () => {
      const { user } = setup()
      render(<ListRepo canRefetch />, {
        wrapper: wrapper(),
      })

      const searchInput = screen.getByRole('textbox', {
        name: /Search/,
      })
      await user.type(searchInput, 'some random repo')

      await waitFor(() => {
        expect(testLocation.state.search).toBe('some random repo')
      })
    })
  })

  describe('update params after using select', () => {
    it('renders the option user the custom rendered', async () => {
      const { user } = setup()
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({
          url: '/gh',
          path: '/:provider',
        }),
      })

      const sortButton = screen.getByRole('button', {
        name: /Sort Order/,
      })
      await user.click(sortButton)

      const option = screen.getByRole('option', { name: 'Least recent commit' })
      await user.click(option)

      await waitFor(() => expect(testLocation.state.direction).toBe('ASC'))
      await waitFor(() =>
        expect(testLocation.state.ordering).toBe('COMMIT_DATE')
      )
    })
  })

  describe('renders sorting options fo repos', () => {
    it('render sorting for all repos', () => {
      render(<ListRepo canRefetch />, {
        wrapper: wrapper(),
      })

      const sortBtn = screen.getByRole('button', {
        name: 'Sort Order',
      })
      expect(sortBtn).toBeInTheDocument()

      sortBtn.click()

      const options = screen.getAllByRole('option')
      expect(options.length).toBe(6)
    })

    it('render sorting for active repos', () => {
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({
          repoDisplay: repoDisplayOptions.ACTIVE.text,
        }),
      })

      const sortBtn = screen.getByRole('button', {
        name: 'Sort Order',
      })
      expect(sortBtn).toBeInTheDocument()

      sortBtn.click()

      const options = screen.getAllByRole('option')
      expect(options.length).toBe(6)
    })

    it('render sorting for inactive repos', () => {
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({
          repoDisplay: repoDisplayOptions.INACTIVE.text,
        }),
      })

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
