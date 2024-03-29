import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import Breadcrumb from '.'

describe('Breadcrumb', () => {
  function setup(props = {}) {
    render(<Breadcrumb {...props} />, {
      wrapper: MemoryRouter,
    })
  }

  describe('Renders breadcrumb', () => {
    beforeEach(() => {
      setup({
        paths: [
          { pageName: 'invoicesPage' },
          { pageName: 'commits' },
          { pageName: 'readonly', readOnly: true, text: 'readonly' },
        ],
      })
    })

    it('renders a link with the right URL', () => {
      expect(screen.getByText('Invoices')).toBeInTheDocument()
      expect(screen.getByText('Commits')).toBeInTheDocument()
    })
  })
})
