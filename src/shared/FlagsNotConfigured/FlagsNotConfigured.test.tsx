import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import FlagsNotConfigured from './FlagsNotConfigured'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo/flags']}>
    <Route path="/:provider/:owner/:repo/flags">{children}</Route>
  </MemoryRouter>
)

describe('FlagsNotConfigured', () => {
  describe('when rendered', () => {
    it('shows message', () => {
      render(<FlagsNotConfigured />, { wrapper })
      expect(
        screen.getByText(/The Flags feature is not yet configured/)
      ).toBeInTheDocument()
    })

    it('renders link', () => {
      render(<FlagsNotConfigured />, { wrapper })
      const flagsAnchor = screen.getByRole('link', {
        name: /help your team today/i,
      })
      expect(flagsAnchor).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/flags'
      )
    })

    it('renders empty state image', () => {
      render(<FlagsNotConfigured />, { wrapper })
      const flagsMarketingImg = screen.getByRole('img', {
        name: /Flags feature not configured/,
      })
      expect(flagsMarketingImg).toBeInTheDocument()
    })
  })
})
