import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import TimescaleDisabled from './TimescaleDisabled'

describe('TimescaleDisabled', () => {
  const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
    <MemoryRouter initialEntries={['/gh/codecov/gazebo/flags']}>
      <Route path="/:provider/:owner/:repo/flags">{children}</Route>
    </MemoryRouter>
  )

  describe('when rendered', () => {
    it('shows message', () => {
      render(<TimescaleDisabled />, { wrapper })
      expect(
        screen.getByText(/The Flags feature is not yet enabled/)
      ).toBeInTheDocument()
    })

    it('renders link', () => {
      render(<TimescaleDisabled />, { wrapper })
      const flagsAnchor = screen.getByRole('link', {
        name: /enable flags in your infrastructure today/i,
      })
      expect(flagsAnchor).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/implementing-flags-with-timescaledb'
      )
    })

    it('renders empty state image', () => {
      render(<TimescaleDisabled />, { wrapper })
      const flagsMarketingImg = screen.getByRole('img', {
        name: /Flags feature not configured/,
      })
      expect(flagsMarketingImg).toBeInTheDocument()
    })
  })
})
