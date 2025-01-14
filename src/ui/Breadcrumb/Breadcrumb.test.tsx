import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import Breadcrumb from './Breadcrumb'

describe('Breadcrumb', () => {
  describe('Renders breadcrumb', () => {
    it('renders a link with the right URL', () => {
      render(
        <Breadcrumb
          paths={[
            { pageName: 'invoicesPage' },
            { pageName: 'commits' },
            { pageName: 'readonly', readOnly: true, text: 'readonly' },
          ]}
        />,
        { wrapper: MemoryRouter }
      )

      const invoices = screen.getByText('Invoices')
      expect(invoices).toBeInTheDocument()

      const commits = screen.getByText('Commits')
      expect(commits).toBeInTheDocument()
    })
  })
})
