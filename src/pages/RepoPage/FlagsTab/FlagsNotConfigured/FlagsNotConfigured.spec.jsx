import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import FlagsNotConfigured from './FlagsNotConfigured'

const defaultProps = {
  isTimescaleEnabled: true,
}

describe('FlagsNotConfigured', () => {
  function setup(props = defaultProps) {
    render(
      <MemoryRouter initialEntries={['/gh/codecov/gazebo/flags']}>
        <Route path="/:provider/:owner/:repo/flags">
          <FlagsNotConfigured {...props} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when timescale is enabled', () => {
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

  describe('when timescale is not enabled', () => {
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
        'https://docs.codecov.com/docs/deploying-with-helm#deploying-flags-support'
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
