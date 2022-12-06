import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { ActiveContext } from 'shared/context'

import Tabs from './Tabs'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')
jest.mock('services/user')
jest.mock('config')

describe('Tabs', () => {
  function setup({
    props = {},
    isSelfHosted = false,
    initialEntries = ['/gh'],
    active = false,
  }) {
    config.IS_SELF_HOSTED = isSelfHosted

    render(
      <ActiveContext.Provider value={active}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider">
            <Tabs {...props} />
          </Route>
        </MemoryRouter>
      </ActiveContext.Provider>
    )
  }

  describe('when user is looking at orgs and repos', () => {
    describe('when rendered', () => {
      beforeEach(() => {
        setup({
          props: { currentUsername: 'lewis' },
          active: true,
        })
      })

      it('renders link to repos', () => {
        const reposLink = screen.getByRole('link', { name: 'Repos' })
        expect(reposLink).toBeInTheDocument()
      })

      it('does not render link to the current user settings', () => {
        const userSettingsLink = screen.queryByRole('link', {
          name: /settings/i,
        })

        expect(userSettingsLink).not.toBeInTheDocument()
      })

      it('renders links to the current user plan', () => {
        const planLink = screen.queryByRole('link', {
          name: /plan/i,
        })

        expect(planLink).not.toBeInTheDocument()
      })

      it('renders links to the current user members', () => {
        const membersLink = screen.queryByRole('link', {
          name: /members/i,
        })
        expect(membersLink).not.toBeInTheDocument()
      })
    })
  })

  describe('when user is looking at a specific org', () => {
    describe('when rendered', () => {
      beforeEach(() => {
        setup({
          props: {
            currentUsername: 'lewis',
          },
        })
      })

      it('renders links to the current user settings', () => {
        expect(
          screen.getByRole('link', {
            name: /settings/i,
          })
        ).toHaveAttribute('href', '/account/gh/lewis')
      })

      it('renders links to the current user plan', () => {
        expect(
          screen.getByRole('link', {
            name: /plan/i,
          })
        ).toHaveAttribute('href', '/plan/gh/lewis')
      })

      it('renders links to the current user members', () => {
        expect(
          screen.getByRole('link', {
            name: /members/i,
          })
        ).toHaveAttribute('href', '/members/gh/lewis')
      })
    })

    describe('when rendered with enterprise account', () => {
      beforeEach(() => {
        setup({
          props: {
            currentUsername: 'lewis',
          },
          isSelfHosted: true,
        })
      })

      it('renders links to the current user settings', () => {
        expect(
          screen.getByRole('link', {
            name: /settings/i,
          })
        ).toHaveAttribute('href', '/account/gh/lewis')
      })

      it('does not render links to the current user plan', () => {
        expect(
          screen.queryByRole('link', {
            name: /plan/i,
          })
        ).not.toBeInTheDocument()
      })

      it('does not render links to the current user members', () => {
        expect(
          screen.queryByRole('link', {
            name: /members/i,
          })
        ).not.toBeInTheDocument()
      })
    })
  })
})
