import { render, screen } from '@testing-library/react'

import Sparkline from '.'

describe('Sparkline', () => {
  describe('it renders an accessible line', () => {
    it('renders a table header', () => {
      const datum = [0, 2, 1, 3, null, 3, 5, undefined]
      const description = 'Table caption'
      const dataTemplate = (d: any) => `# of oranges ${d}`
      render(
        <Sparkline
          datum={datum}
          description={description}
          dataTemplate={dataTemplate}
        />
      )

      const caption = screen.getByText(/Table caption/)
      expect(caption).toBeInTheDocument()
    })

    it('data points have descriptors', () => {
      const datum = [0, 2, 1, 3, null, 3, 5, undefined]
      const description = 'Table caption'
      const dataTemplate = (d: any) => `# of oranges ${d}`
      render(
        <Sparkline
          datum={datum}
          description={description}
          dataTemplate={dataTemplate}
        />
      )

      const firstPoint = screen.getByText(/# of oranges 0/)
      expect(firstPoint).toBeInTheDocument()

      const secondPoint = screen.getByText(/# of oranges 2/)
      expect(secondPoint).toBeInTheDocument()

      const thirdPoint = screen.getByText(/# of oranges 1/)
      expect(thirdPoint).toBeInTheDocument()

      const fourthAndSixthPoints = screen.queryAllByText(/# of oranges 3/)
      expect(fourthAndSixthPoints).toHaveLength(2)

      const seventhPoint = screen.getByText(/# of oranges 5/)
      expect(seventhPoint).toBeInTheDocument()
    })

    it("renders the correct number of tr's", () => {
      const datum = [0, 2, 1, 3, null, 3, 5, undefined]
      const description = 'Table caption'
      const dataTemplate = (d: any) => `# of oranges ${d}`
      render(
        <Sparkline
          datum={datum}
          description={description}
          dataTemplate={dataTemplate}
        />
      )

      const cells = screen.queryAllByRole('cell')
      expect(cells).toHaveLength(8)
    })

    it('lines have an normal state', () => {
      const datum = [0, 2, 1, 3, null, 3, 5, undefined]
      const description = 'Table caption'
      const dataTemplate = (d: any) => `# of oranges ${d}`
      render(
        <Sparkline
          datum={datum}
          description={description}
          dataTemplate={dataTemplate}
        />
      )

      const lineState = screen.queryAllByRole('cell')[0]
      expect(lineState).toHaveAttribute('data-mode', 'normal')
    })

    it('lines have an empty state', () => {
      const datum = [0, 2, 1, 3, null, 3, 5, undefined]
      const description = 'Table caption'
      const dataTemplate = (d: any) => `# of oranges ${d}`
      render(
        <Sparkline
          datum={datum}
          description={description}
          dataTemplate={dataTemplate}
        />
      )

      const emptyState = screen.queryAllByRole('cell')[4]
      expect(emptyState).toHaveAttribute('data-mode', 'empty')
    })
  })
})
