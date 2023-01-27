import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import TimescaleDisabled from './TimescaleDisabled'

describe('TimescaleDisabled', () => {
  function setup() {
    render(
      <MemoryRouter initialEntries={['/gh/codecov/gazebo/flags']}>
        <Route path="/:provider/:owner/:repo/flags">
          <TimescaleDisabled />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      const props = { isTimescaleEnabled: false }
      setup(props)
    })

    it('shows message', () => {
      expect(
        screen.getByText(/The Flags feature is not yet enabled/)
      ).toBeInTheDocument()
    })

    it('renders link', () => {
      const flagsAnchor = screen.getByRole(
        'link',
        /enable flags in your infrastructure today/i
      )
      expect(flagsAnchor).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/implementing-flags-with-timescaledb'
      )
    })

    it('renders empty state image', () => {
      const flagsMarketingImg = screen.getByRole('img', {
        name: /Flags feature not configured/,
      })
      expect(flagsMarketingImg).toBeInTheDocument()
    })
  })
})
