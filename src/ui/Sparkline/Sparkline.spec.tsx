import { render, screen } from '@testing-library/react'

import Sparkline from '.'

describe('Sparkline', () => {
  function setup(props: {
    datum: any[]
    description: string
    dataTemplate: (d: number | null | undefined) => string
  }) {
    render(<Sparkline {...props} />)
  }

  describe('it renders an accessible line', () => {
    beforeEach(() => {
      setup({
        datum: [0, 2, 1, 3, null, 3, 5, undefined],
        description: 'Table caption',
        dataTemplate: (d) => `# of oranges ${d}`,
      })
    })

    it('renders a table header', () => {
      expect(screen.getByText(/Table caption/)).toBeInTheDocument()
    })

    it('data points have descriptors', () => {
      expect(screen.getByText(/# of oranges 0/)).toBeInTheDocument()
      expect(screen.getByText(/# of oranges 2/)).toBeInTheDocument()
      expect(screen.getByText(/# of oranges 1/)).toBeInTheDocument()
      expect(screen.queryAllByText(/# of oranges 3/).length).toBe(2)
      expect(screen.getByText(/# of oranges 5/)).toBeInTheDocument()
    })

    it("renders the correct number of tr's", () => {
      expect(screen.queryAllByRole('cell').length).toBe(8)
    })

    it('lines have an normal state', () => {
      expect(screen.queryAllByRole('cell')[0]).toHaveAttribute(
        'data-mode',
        'normal'
      )
    })

    it('lines have an empty state', () => {
      expect(screen.queryAllByRole('cell')[4]).toHaveAttribute(
        'data-mode',
        'empty'
      )
    })
  })
})
