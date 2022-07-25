import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useFlags } from 'shared/featureFlags'

import Tabs from './Tabs'

jest.mock('shared/featureFlags')
jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')

describe('Tabs', () => {
  function setup(props = {}) {
    useFlags.mockReturnValue({
      gazeboBillingsTab: true,
    })

    render(
      <MemoryRouter initialEntries={['/gh']}>
        <Route path="/:provider">
          <Tabs {...props} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({
        currentUsername: 'lewis',
      })
    })

    it('renders links to the current user settings', () => {
      expect(
        screen.getByRole('link', {
          name: /settings/i,
        })
      ).toHaveAttribute('href', '/account/gh/lewis')
    })

    it('renders link to billing', () => {
      expect(
        screen.getByRole('link', {
          name: /billing/i,
        })
      ).toHaveAttribute('href', '/billing/gh/lewis')
    })
  })
})
