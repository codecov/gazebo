import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import NetworkErrorBoundary from 'layouts/shared/NetworkErrorBoundary'
import { useUser } from 'services/user'

import SettingsTab from './SettingsTab'

const loggedInUser = {
  user: {
    username: 'RulaKhaled',
    avatarUrl: '',
  },
}

jest.spyOn(console, 'error').mockImplementation()

jest.mock('services/user', () => ({
  ...jest.requireActual('services/user'), // import and retain the original functionalities
  useUser: jest.fn(),
}))

describe('SettingsTab', () => {
  function setup(url, ErrorRender) {
    render(
      <MemoryRouter initialEntries={[url]}>
        <Route path="/:provider/:owner/:repo/settings">
          <NetworkErrorBoundary>
            <SettingsTab />
            <ErrorRender />
          </NetworkErrorBoundary>
        </Route>
      </MemoryRouter>
    )
  }

  describe('Render for a repo', () => {
    beforeEach(() => {
      useUser.mockReturnValue({ data: loggedInUser })
      setup('/gh/codecov/codecov-client/settings', () => null)
    })

    it('renders the right links', () => {
      expect(screen.getByRole('link', { name: /General/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Yaml/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Badge/ })).toBeInTheDocument()
    })
  })

  describe('Render with an uknown path', () => {
    beforeEach(() => {
      useUser.mockReturnValue({ data: loggedInUser })
      setup('/gh/codecov/codecov-client/settings/random', () => null)
    })

    it('renders the right links', () => {
      expect(screen.getByRole('link', { name: /General/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Yaml/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Badge/ })).toBeInTheDocument()
    })
  })

  describe('Render with Unauthenticated user', () => {
    beforeEach(() => {
      function ErrorRender() {
        //mocking error promise reject within then promise handle
        throw Object.assign({
          status: 401,
          data: {
            detail: 'Unauthenticated',
          },
        })
      }
      useUser.mockReturnValue({ data: undefined })
      setup('/gh/codecov/codecov-client/settings', ErrorRender)
    })

    it('renders 401', () => {
      expect(screen.getByText('Error 401')).toBeInTheDocument()
    })
  })
})
