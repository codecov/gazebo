import { act, render, screen } from '@testing-library/react'
import qs from 'qs'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { eventTracker } from 'services/events/events'
import { Provider } from 'shared/api/helpers'

import SyncButton from './SyncButton'

vi.mock('services/events/events')

vi.mock('config')
config.API_URL = 'secret-api-url'

const { location } = window
beforeEach(() => {
  Object.defineProperty(window, 'location', {
    value: { ...location, protocol: 'http:', host: 'secret-api-url' },
  })
})

afterEach(() => {
  Object.defineProperty(window, 'location', { value: location })
})

const wrapper =
  (initialEntries = '/sync'): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <MemoryRouter initialEntries={[initialEntries]}>
      <Route path="/sync">{children}</Route>
    </MemoryRouter>
  )

interface Case {
  provider: Provider
  name: string
  redirectTo: string
}

const cases: Case[] = [
  {
    provider: 'gh',
    name: 'GitHub',
    redirectTo: 'http://secret-api-url/gh',
  },
  {
    provider: 'ghe',
    name: 'GitHub Enterprise',
    redirectTo: 'http://secret-api-url/ghe',
  },
  {
    provider: 'gl',
    name: 'GitLab',
    redirectTo: 'http://secret-api-url/gl',
  },
  {
    provider: 'gle',
    name: 'GitLab Enterprise',
    redirectTo: 'http://secret-api-url/gle',
  },
  {
    provider: 'bb',
    name: 'Bitbucket',
    redirectTo: 'http://secret-api-url/bb',
  },

  {
    provider: 'bbs',
    name: 'Bitbucket Server',
    redirectTo: 'http://secret-api-url/bbs',
  },
]

describe('SyncButton', () => {
  describe.each(cases)('$name', ({ name, provider, redirectTo }) => {
    it('renders sync button', () => {
      render(<SyncButton provider={provider} />, { wrapper: wrapper() })

      const link = screen.getByRole('link', {
        name: new RegExp(`Sync with ${name}`),
      })

      const queryString = qs.stringify(
        { to: redirectTo },
        { addQueryPrefix: true }
      )
      const expectedRedirect = `secret-api-url/login/${provider}${queryString}`
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', expectedRedirect)
    })
  })

  it('emits event on click', () => {
    console.error = () => {} // silence error about navigation on click
    render(<SyncButton provider="gh" />, { wrapper: wrapper() })

    const link = screen.getByRole('link', { name: /Sync with GitHub/ })

    act(() => link.click())

    expect(eventTracker().track).toHaveBeenCalledWith({
      type: 'Button Clicked',
      properties: {
        buttonName: 'Sync',
        buttonLocation: 'Sync Provider Page',
        loginProvider: 'GitHub',
      },
    })
  })

  describe('when a to param is provided', () => {
    it('appends the to param to the redirect url', () => {
      render(<SyncButton provider="gh" />, {
        wrapper: wrapper('/sync?to=/test'),
      })

      const redirectQueryString = qs.stringify(
        { to: '/test' },
        { addQueryPrefix: true }
      )
      const queryString = qs.stringify(
        { to: `http://secret-api-url/gh${redirectQueryString}` },
        { addQueryPrefix: true }
      )
      const link = screen.getByRole('link', { name: /Sync with GitHub/ })
      expect(link).toHaveAttribute(
        'href',
        `secret-api-url/login/gh${queryString}`
      )
    })
  })
})
