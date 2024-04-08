import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import ComponentsNotConfigured from './ComponentsNotConfigured'

describe('ComponentsNotConfigured', () => {
  const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
    <MemoryRouter initialEntries={['/gh/codecov/gazebo/components']}>
      <Route path="/:provider/:owner/:repo/components">{children}</Route>
    </MemoryRouter>
  )

  describe('when rendered', () => {
    it('shows message', () => {
      render(<ComponentsNotConfigured />, { wrapper })
      expect(
        screen.getByText(/The Components feature is not yet configured/)
      ).toBeInTheDocument()
    })

    it('renders link', () => {
      render(<ComponentsNotConfigured />, { wrapper })
      const componentssAnchor = screen.getByRole('link', {
        name: /help your team today/i,
      })
      expect(componentssAnchor).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/components'
      )
    })

    it('renders empty state image', () => {
      render(<ComponentsNotConfigured />, { wrapper })
      const componentsMarketingImg = screen.getByRole('img', {
        name: /Components feature not configured/,
      })
      expect(componentsMarketingImg).toBeInTheDocument()
    })
  })
})
