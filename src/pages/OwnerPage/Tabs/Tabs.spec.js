import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useShouldRenderBillingTabs } from 'services/useShouldRenderBillingTabs'

import Tabs from './Tabs'

jest.mock('services/useShouldRenderBillingTabs')
jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')
jest.mock('../CallToAction', () => () => 'CallToAction')

describe('Tabs', () => {
  function setup({ props = {}, show = true }) {
    useShouldRenderBillingTabs.mockReturnValue(show)

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
      setup({ props: { owner: { username: 'kelly' }, provider: 'gh' } })
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

    it('renders link to members page', () => {
      expect(
        screen.getByRole('link', {
          name: /members/i,
        })
      ).toHaveAttribute('href', `/members/gh/codecov`)
    })
  })

  describe('when should render billing tabs is false', () => {
    beforeEach(() => {
      setup({
        props: { owner: { username: 'kelly' }, provider: 'gh' },
        show: false,
      })
    })

    it('does not render link to plan', () => {
      expect(
        screen.queryByRole('link', {
          name: /plan/i,
        })
      ).not.toBeInTheDocument()
    })

    it('does not render link to members page', () => {
      expect(
        screen.queryByRole('link', {
          name: /members/i,
        })
      ).not.toBeInTheDocument()
    })
  })
})
