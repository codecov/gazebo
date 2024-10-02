import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import TimescaleDisabled from './TimescaleDisabled'

describe('TimescaleDisabled', () => {
  const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
    <MemoryRouter initialEntries={['/gh/codecov/gazebo/components']}>
      <Route path="/:provider/:owner/:repo/components">{children}</Route>
    </MemoryRouter>
  )

  describe('when rendered', () => {
    it('shows message', () => {
      render(<TimescaleDisabled />, { wrapper })
      expect(
        screen.getByText(/The Components feature is not yet enabled/)
      ).toBeInTheDocument()
    })

    it('renders link', () => {
      render(<TimescaleDisabled />, { wrapper })
      const componentsAnchor = screen.getByRole('link', {
        name: /enable components in your infrastructure today/i,
      })
      expect(componentsAnchor).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/components'
      )
    })

    it('renders empty state image', () => {
      render(<TimescaleDisabled />, { wrapper })
      const componentsMarketingImg = screen.getByRole('img', {
        name: /Components feature not configured/,
      })
      expect(componentsMarketingImg).toBeInTheDocument()
    })
  })
})
