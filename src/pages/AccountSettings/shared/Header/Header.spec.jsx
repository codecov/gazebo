import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useShouldRenderBillingTabs } from 'services/useShouldRenderBillingTabs'

import Header from './Header'

jest.mock('services/useShouldRenderBillingTabs')
jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')

describe('Header', () => {
  function setup(show = true) {
    useShouldRenderBillingTabs.mockReturnValue(show)

    render(
      <MemoryRouter initialEntries={['/account/gh/codecov']}>
        <Route path="/account/:provider/:owner">
          <Header />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when users is part of the org', () => {
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
      ).toHaveAttribute('href', `/analytics/gh/codecov`)
    })

    it('renders links to the settings page', () => {
      expect(
        screen.getByRole('link', {
          name: /settings/i,
        })
      ).toHaveAttribute('href', `/account/gh/codecov`)
    })

    it('renders link to plan page', () => {
      expect(
        screen.getByRole('link', {
          name: /plan/i,
        })
      ).toHaveAttribute('href', `/plan/gh/codecov`)
    })

    it('renders link to members page', () => {
      expect(
        screen.getByRole('link', {
          name: /members/i,
        })
      ).toHaveAttribute('href', `/members/gh/codecov`)
    })
  })

  describe('when feature flag is off', () => {
    beforeEach(() => {
      setup(false)
    })

    it('does not render link to members page', () => {
      expect(
        screen.queryByRole('link', {
          name: /members/i,
        })
      ).not.toBeInTheDocument()
    })

    it('does not render link to plan page', () => {
      expect(
        screen.queryByRole('link', {
          name: /plan/i,
        })
      ).not.toBeInTheDocument()
    })
  })
})
