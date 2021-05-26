import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import Header from './Header'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')

describe('Header', () => {
  function setup(props = {}) {
    render(
      <MemoryRouter initialEntries={['/gh/codecov']}>
        <Route path="/:provider/:owner">
          <Header {...props} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when user is part of the org', () => {
    beforeEach(() => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: true,
        },
      })
    })

    it('renders links to the owner settings', () => {
      expect(
        screen.getByRole('link', {
          name: /settings/i,
        })
      ).toHaveAttribute('href', '/account/gh/codecov')
    })

    it('renders the context switcher', () => {
      expect(screen.getByText(/MyContextSwitcher/)).toBeInTheDocument()
    })
  })

  describe('when user is not part of the org', () => {
    beforeEach(() => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: false,
        },
      })
    })

    it('renders the title of the owner', () => {
      expect(
        screen.getByRole('heading', {
          name: /codecov/i,
        })
      ).toBeInTheDocument()
    })

    it('doesnt render the context switcher', () => {
      expect(screen.queryByText(/MyContextSwitcher/)).not.toBeInTheDocument()
    })

    it('doesnt render links to the settings', () => {
      expect(
        screen.queryByRole('link', {
          name: /settings/i,
        })
      ).not.toBeInTheDocument()
    })
  })
})
