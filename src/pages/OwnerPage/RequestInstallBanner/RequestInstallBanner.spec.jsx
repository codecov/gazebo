import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'

import RequestInstallBanner from './RequestInstallBanner'

jest.mock('services/navigation')

const wrapper =
  ({ provider = 'gh' }) =>
  ({ children }) => {
    return (
      <MemoryRouter initialEntries={[`/${provider}/codecov/analytics/new`]}>
        <Switch>
          <Route path="/:provider/:owner/:repo/new">{children}</Route>
        </Switch>
      </MemoryRouter>
    )
  }

describe('RequestInstallBanner', () => {
  function setup({ setUpAction } = { setUpAction: 'request' }) {
    useLocationParams.mockReturnValue({
      params: { setup_action: setUpAction },
    })
  }

  describe('when rendered with github provider', () => {
    it('renders banner body', () => {
      setup()

      render(<RequestInstallBanner />, {
        wrapper: wrapper({ provider: 'gh' }),
      })

      const body = screen.getByText(/Installation request sent./)
      expect(body).toBeInTheDocument()

      const body2 = screen.getByText(
        /Since you're a member of the requested organization/
      )
      expect(body2).toBeInTheDocument()
    })
  })

  describe('when rendered with a different setup action', () => {
    it('renders empty dom', () => {
      setup({ setUpAction: 'install' })

      const { container } = render(<RequestInstallBanner />, {
        wrapper: wrapper({ provider: 'gh' }),
      })

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when rendered with other providers', () => {
    it('does not render banner body', () => {
      setup()

      render(<RequestInstallBanner />, {
        wrapper: wrapper({ provider: 'gl' }),
      })

      const body = screen.queryByText(/Installation request sent./)
      expect(body).not.toBeInTheDocument()
    })
  })
})
