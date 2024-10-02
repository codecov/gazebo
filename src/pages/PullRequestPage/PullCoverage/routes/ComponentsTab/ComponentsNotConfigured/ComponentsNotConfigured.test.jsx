import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import ComponentsNotConfigured from './ComponentsNotConfigured'

const wrapper =
  (initialEntries = '/gh/codecov/gazebo/pull/123/components') =>
  ({ children }) => (
    <MemoryRouter initialEntries={[initialEntries]}>
      <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
    </MemoryRouter>
  )

describe('ComponentsNotConfigured', () => {
  describe('when rendered', () => {
    it('shows title and body', () => {
      render(<ComponentsNotConfigured />, { wrapper: wrapper() })
      const title = screen.getByText(/See how components can help you today!/)
      expect(title).toBeInTheDocument()

      const body = screen.getByText(
        /Components allow you to isolate and categorize coverage data from your project with virtual filters. Learn how components can/
      )
      expect(body).toBeInTheDocument()
    })

    it('shows link', () => {
      render(<ComponentsNotConfigured />, { wrapper: wrapper() })
      const flagsAnchor = screen.getByRole('link', /help your team today/i)
      expect(flagsAnchor).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/components'
      )
    })

    it('renders placeholder image', () => {
      render(<ComponentsNotConfigured />, { wrapper: wrapper() })
      const marketingImage = screen.getByRole('img', {
        name: /Components feature not configured/,
      })
      expect(marketingImage).toBeInTheDocument()
    })
  })
})
