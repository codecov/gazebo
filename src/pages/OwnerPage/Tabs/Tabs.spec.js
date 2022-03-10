import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { useIsCurrentUserAnAdmin } from 'services/user'

import Tabs from './Tabs'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')
jest.mock('../CallToAction', () => () => 'CallToAction')
jest.mock('services/user/hooks')

const queryClient = new QueryClient()

describe('Tabs', () => {
  function setup({ props, isAdmin }) {
    useIsCurrentUserAnAdmin.mockReturnValue(isAdmin)

    render(
      <MemoryRouter initialEntries={['/gh/codecov']}>
        <Route path="/:provider/:owner">
          <QueryClientProvider client={queryClient}>
            <Tabs {...props} />
          </QueryClientProvider>
        </Route>
      </MemoryRouter>
    )
  }

  describe('when user is part of the org and is an admin', () => {
    beforeEach(() => {
      setup({
        props: { owner: { username: 'kelly' }, provider: 'gh' },
        isAdmin: true,
      })
    })

    it('renders links to the owner settings', () => {
      expect(
        screen.getByRole('link', {
          name: /settings/i,
        })
      ).toHaveAttribute('href', '/account/gh/codecov')
    })
  })

  describe('when user is part of the org and is not an admin', () => {
    beforeEach(() => {
      setup({
        props: { owner: { username: 'kelly' }, provider: 'gh' },
        isAdmin: false,
      })
    })

    it('renders links to the owner settings', () => {
      expect(
        screen.getByRole('link', {
          name: /settings/i,
        })
      ).toHaveAttribute('href', '/account/gh/codecov/billing')
    })
  })
})
