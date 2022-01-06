import { render, screen } from '@testing-library/react'
import Change from '.'

describe('Change', () => {
  function setup({ totals, parent }) {
    render(<Change totals={totals} parent={parent} />)
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({
        totals: {
          coverage: 45,
        },
        parent: {
          totals: {
            coverage: 98,
          },
        },
      })
    })

    it('renders commit change', () => {
      const change = screen.getByText(/-53.00%/)
      expect(change).toBeInTheDocument()
    })
  })
})
