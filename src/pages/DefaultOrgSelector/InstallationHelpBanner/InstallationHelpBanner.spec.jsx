import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'

import InstallationHelpBanner from './InstallationHelpBanner'

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

describe('InstallationHelpBanner', () => {
  function setup({ setUpAction } = { setUpAction: 'install' }) {
    useLocationParams.mockReturnValue({
      params: { setup_action: setUpAction },
    })
  }

  describe('when rendered with github provider', () => {
    it('renders banner body', () => {
      setup()

      render(<InstallationHelpBanner />, {
        wrapper: wrapper({ provider: 'gh' }),
      })

      const body = screen.getByText(/Installed organization/)
      expect(body).toBeInTheDocument()

      const body2 = screen.getByText(
        /t may take a few minutes to appear as a selection/
      )
      expect(body2).toBeInTheDocument()
    })
  })

  describe('when rendered with a different setup action', () => {
    it('renders empty dom', () => {
      setup({ setUpAction: 'request' })

      const { container } = render(<InstallationHelpBanner />, {
        wrapper: wrapper({ provider: 'gh' }),
      })

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when rendered with other providers', () => {
    it('does not render banner body', () => {
      setup()

      render(<InstallationHelpBanner />, {
        wrapper: wrapper({ provider: 'gl' }),
      })

      const body = screen.queryByText(/Installed organization/)
      expect(body).not.toBeInTheDocument()
    })
  })
})
