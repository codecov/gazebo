import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'
import { useUser } from 'services/user'

import Header from './Header'

jest.mock('services/user')
jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')

describe('Header', () => {
  function setup(props = {}) {
    useUser.mockReturnValue({
      data: {
        username: 'lewis',
      },
    })
    render(
      <MemoryRouter initialEntries={['/gh']}>
        <Route path="/:provider">
          <Header {...props} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered without owner', () => {
    beforeEach(() => {
      setup()
    })

    it('renders links to the current user settings', () => {
      expect(
        screen.getByRole('link', {
          name: /settings/i,
        })
      ).toHaveAttribute('href', '/account/gh/lewis')
    })
  })

  describe('when rendered with owner', () => {
    beforeEach(() => {
      setup({ owner: 'codecov' })
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
