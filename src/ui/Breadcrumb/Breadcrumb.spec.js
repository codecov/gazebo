import { render, screen } from '@testing-library/react'
import Breadcrumb from '.'
import { MemoryRouter } from 'react-router-dom'

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
          { pageName: 'invoiceTab' },
          { pageName: 'commits' },
          { pageName: 'readonly', readOnly: true, text: 'readonly' },
        ],
      })
    })

    it('renders a link with the right URL', () => {
      expect(screen.getByText('Invoice overview')).toBeInTheDocument()
      expect(screen.getByText('Commits')).toBeInTheDocument()
      expect(screen.getByText('Invoice overview')).toBeInTheDocument()
    })
  })
})
