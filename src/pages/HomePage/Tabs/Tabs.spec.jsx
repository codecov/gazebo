import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import Tabs from './Tabs'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')
jest.mock('services/user')
jest.mock('config')

describe('Tabs', () => {
  function setup(props = {}, isSelfHosted = false) {
    config.IS_SELF_HOSTED = isSelfHosted

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
      setup(
        {
          currentUsername: 'lewis',
        },
        true
      )
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
