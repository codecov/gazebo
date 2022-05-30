import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import SettingsTab from './SettingsTab'

describe('AccountSettings', () => {
  function setup({ url }) {
    render(
      <MemoryRouter initialEntries={[url]}>
        <Route path="/:provider/:owner/:repo/settings">
          <SettingsTab />
        </Route>
      </MemoryRouter>
    )
  }

  describe('Render for a repo', () => {
    beforeEach(() => {
      setup({ url: '/gh/codecov/codecov-client/settings' })
    })

    it('renders the right links', () => {
      expect(screen.getByRole('link', { name: /General/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Yaml/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Badge/ })).toBeInTheDocument()
    })
  })

  describe('Render with an uknown path', () => {
    beforeEach(() => {
      setup({ url: '/gh/codecov/codecov-client/settings/random' })
    })

    it('renders the right links', () => {
      expect(screen.getByRole('link', { name: /General/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Yaml/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Badge/ })).toBeInTheDocument()
    })

    it('renders 404 not found', () => {
      expect(screen.getByText('Error 404')).toBeInTheDocument()
    })
  })
})
