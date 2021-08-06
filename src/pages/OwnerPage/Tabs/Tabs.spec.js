import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import Tabs from './Tabs'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')

describe('Tabs', () => {
  function setup(props = {}) {
    render(
      <MemoryRouter initialEntries={['/gh/codecov']}>
        <Route path="/:provider/:owner">
          <Tabs {...props} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when user is part of the org', () => {
    beforeEach(() => {
      setup()
    })

    it('renders links to the owner settings', () => {
      expect(
        screen.getByRole('link', {
          name: /settings/i,
        })
      ).toHaveAttribute('href', '/account/gh/codecov')
    })
  })
})
