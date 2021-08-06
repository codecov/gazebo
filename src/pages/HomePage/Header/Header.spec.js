import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import Header from './Header'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')

describe('Header', () => {
  function setup(props = {}) {
    render(
      <MemoryRouter initialEntries={['/gh']}>
        <Route path="/:provider">
          <Header {...props} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('render', () => {
    beforeEach(() => {
      setup({
        currentUsername: 'lewis',
      })
    })

    it('renders the context switcher', () => {
      expect(screen.getByText(/MyContextSwitcher/)).toBeInTheDocument()
    })

    it('Ask for feedback banner is rendered', () => {
      expect(
        screen.queryByText(
          /We would love to hear your feedback! Let us know what you think/
        )
      ).toBeInTheDocument()
    })
  })
})
