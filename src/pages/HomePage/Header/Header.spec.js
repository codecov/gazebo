import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import Header from './Header'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')
jest.mock('config')

describe('Header', () => {
  function setup({ isEnterprise = false }) {
    config.IS_ENTERPRISE = isEnterprise
    render(
      <MemoryRouter initialEntries={['/gh']}>
        <Route path="/:provider">
          <Header />
        </Route>
      </MemoryRouter>
    )
  }

  describe('render in cloud', () => {
    beforeEach(() => {
      setup({ isEnterprise: false })
    })

    it('renders the context switcher', () => {
      expect(screen.getByText(/MyContextSwitcher/)).toBeInTheDocument()
    })

    it('Ask for feedback banner is rendered', () => {
      expect(
        screen.getByText(
          /We would love to hear your feedback! Let us know what you think/
        )
      ).toBeInTheDocument()
    })
  })

  describe('render on enterprise', () => {
    beforeEach(() => {
      setup({ isEnterprise: true })
    })

    it('Ask for feedback banner is rendered', () => {
      expect(
        screen.queryByText(
          /We would love to hear your feedback! Let us know what you think/
        )
      ).not.toBeInTheDocument()
    })
  })
})
