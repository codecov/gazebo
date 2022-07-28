import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import FlagsNotConfigured from './FlagsNotConfigured'

describe('FlagsNotConfigured', () => {
  function setup() {
    render(
      <MemoryRouter initialEntries={['/gh/codecov/gazebo/flags']}>
        <Route path="/:provider/:owner/:repo/flags">
          <FlagsNotConfigured />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('shows message', () => {
      expect(
        screen.getByText(/The Flags feature is not yet configured/)
      ).toBeInTheDocument()
    })

    it('renders link', () => {
      const flagsAnchor = screen.getByRole('link', /help your team today/i)
      expect(flagsAnchor).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/flags'
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
