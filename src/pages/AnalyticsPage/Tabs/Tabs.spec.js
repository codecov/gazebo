import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import Tabs from './Tabs'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')

describe('Tabs', () => {
  function setup() {
    render(
      <MemoryRouter initialEntries={['/analytics/gh/codecov']}>
        <Route path="/analytics/:provider/:owner">
          <Tabs />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when user is part of the org', () => {
    beforeEach(() => {
      setup()
    })

    it('renders links to the home page', () => {
      expect(
        screen.getByRole('link', {
          name: /repos/i,
        })
      ).toHaveAttribute('href', '/gh/codecov')
    })

    it('renders links to the analytics page', () => {
      expect(
        screen.getByRole('link', {
          name: /analytics/i,
        })
      ).toHaveAttribute('href', '/analytics/gh/codecov')
    })

    it('renders links to the settings page', () => {
      expect(
        screen.getByRole('link', {
          name: /settings/i,
        })
      ).toHaveAttribute('href', '/account/gh/codecov')
    })
  })
})
