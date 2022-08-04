import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useIsPersonalAccount } from 'services/useIsPersonalAccount'

import Tabs from './Tabs'

jest.mock('services/useIsPersonalAccount')
jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')
jest.mock('../CallToAction', () => () => 'CallToAction')

describe('Tabs', () => {
  function setup(props = {}) {
    useIsPersonalAccount.mockReturnValue(false)

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
      setup({ owner: { username: 'kelly' }, provider: 'gh' })
    })

    it('renders links to the owner settings', () => {
      expect(
        screen.getByRole('link', {
          name: /settings/i,
        })
      ).toHaveAttribute('href', '/account/gh/codecov')
    })

    it('renders link to plan', () => {
      expect(
        screen.getByRole('link', {
          name: /plan/i,
        })
      ).toHaveAttribute('href', '/plan/gh/codecov')
    })
  })
})
